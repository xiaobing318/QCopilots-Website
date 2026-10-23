import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, open, cp, readdir, lstat, rm } from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { caddyConfig, localUrl } from './config.mjs';
import { exists, readJson, writeJson, within, run, sleep } from './common.mjs';
import { ensureCaddy } from './tools.mjs';

const statePath = (config) => path.join(config.runtimeDir, 'state.json');
const currentPath = (config) => path.join(config.runtimeDir, 'current.json');
export async function portAvailable(host, port) {
  return new Promise((resolve) => {
    const socket = net.createServer();
    socket.once('error', () => resolve(false));
    socket.listen(port, host, () => socket.close(() => resolve(true)));
  });
}
async function request(url, options = {}) {
  return fetch(url, {
    signal: AbortSignal.timeout(2500),
    ...options,
    headers: { Origin: new URL(url).origin, ...options.headers },
  });
}
export async function ownedServer(state) {
  if (!state?.config) return false;
  try {
    const response = await request(`http://127.0.0.1:${state.config.adminPort}/config/`);
    if (!response.ok) return false;
    const active = await response.json();
    const server = active.apps?.http?.servers?.[`qc-${state.instanceId}`];
    // A persisted UUID, listener, and root prove this is our configuration. PID reuse is irrelevant.
    return Boolean(
      server?.routes?.some((route) =>
        route.handle?.some(
          (handler) => handler.handler === 'vars' && handler.root === state.current?.siteDir,
        ),
      ),
    );
  } catch {
    return false;
  }
}
async function health(config, state, release) {
  const identity = await request(`${localUrl(config)}/_qcopilots/health/${state.instanceId}`);
  if (!identity.ok || (await identity.text()) !== release.id)
    throw new Error('Release identity health check failed.');
  const page = await request(`${localUrl(config)}${config.basePath}`);
  if (!page.ok || !(page.headers.get('content-type') ?? '').includes('text/html'))
    throw new Error(`Homepage health check failed (${page.status}).`);
}
async function waitHealthy(config, state, release) {
  let failure;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await health(config, state, release);
      return;
    } catch (error) {
      failure = error;
      await sleep(200);
    }
  }
  throw failure;
}
async function assertTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if ((await lstat(file)).isSymbolicLink())
      throw new Error(`Symlinks are not allowed in a deployable static artifact: ${file}`);
    if (entry.isDirectory()) await assertTree(file);
  }
}
async function assertSource(config) {
  if (
    config.sourceDir === config.runtimeDir ||
    within(config.sourceDir, config.runtimeDir) ||
    within(config.runtimeDir, config.sourceDir)
  )
    throw new Error('sourceDir and runtimeDir must be separate directory trees.');
  for (const filename of ['index.html', '404.html'])
    if (!(await exists(path.join(config.sourceDir, filename))))
      throw new Error(
        `Missing ${filename} in ${config.sourceDir}. Run build first or pass --source to a complete static artifact.`,
      );
  const build = await readJson(path.join(config.sourceDir, 'build-info.json'), null);
  if (build && build.basePath !== config.basePath)
    throw new Error(
      `Artifact basePath ${build.basePath} does not match deployment basePath ${config.basePath}. Rebuild with BASE_PATH=${config.basePath}.`,
    );
  await assertTree(config.sourceDir);
}
async function lock(config, callback) {
  await mkdir(config.runtimeDir, { recursive: true });
  const file = path.join(config.runtimeDir, 'operation.lock');
  let handle;
  try {
    handle = await open(file, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST')
      throw new Error(
        `Another deployment operation holds ${file}. After confirming no site command is running, remove this file if a prior command was interrupted.`,
      );
    throw error;
  }
  try {
    await handle.writeFile(String(process.pid));
    return await callback();
  } finally {
    await handle.close();
    await rm(file, { force: true });
  }
}
async function registration(config) {
  return readJson(path.join(config.runtimeDir, 'service-registration.json'), null);
}
async function refuseService(config, action = 'start') {
  const installed = await registration(config);
  if (installed)
    throw new Error(
      `An OS service is registered for this instance. Use its ${action} command (program and argument arrays): ${JSON.stringify(action === 'stop' ? installed.stopCommands : installed.startCommands)}. Run service uninstall before using direct lifecycle commands.`,
    );
}
async function validate(executable, file) {
  await run(executable, ['validate', '--config', file], { stdio: 'pipe' });
}
async function load(state, document) {
  const response = await request(`http://127.0.0.1:${state.config.adminPort}/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  });
  if (!response.ok)
    throw new Error(`Caddy rejected configuration (${response.status}): ${await response.text()}`);
}
async function launch(config, state, release, executable, file) {
  if (!(await portAvailable('127.0.0.1', config.adminPort)))
    throw new Error(
      `Admin port ${config.adminPort} is occupied by an unverified process. No process was stopped.`,
    );
  if (!(await portAvailable(config.host, config.port)))
    throw new Error(`Site port ${config.port} is occupied. No process was stopped.`);
  const logs = path.join(config.runtimeDir, 'caddy.log');
  const out = await open(logs, 'a');
  let child;
  try {
    child = spawn(executable, ['run', '--config', file], {
      cwd: config.runtimeDir,
      windowsHide: true,
      detached: true,
      stdio: ['ignore', out.fd, out.fd],
    });
    const launched = new Promise((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });
    await launched;
    await waitHealthy(config, state, release);
    child.unref();
    return {
      pid: child.pid,
      executable,
      configPath: currentPath(config),
      startedAt: new Date().toISOString(),
    };
  } catch (error) {
    // This handle belongs to the child created above, never a PID loaded from a file.
    if (child?.pid && child.exitCode === null) {
      child.kill();
      await sleep(200);
    }
    throw new Error(`${error.message} See ${logs}`);
  } finally {
    await out.close();
  }
}
async function activate(config, state, release, executable) {
  const document = caddyConfig(config, state, release);
  const candidate = path.join(config.runtimeDir, `candidate-${release.id}.json`);
  await writeJson(candidate, document);
  await validate(executable, candidate);
  const running = await ownedServer(state);
  if (running && state.config.adminPort !== config.adminPort)
    throw new Error('Stop this instance before changing adminPort.');
  const previousDocument = state.current ? caddyConfig(state.config, state, state.current) : null;
  let processRecord = state.process ?? null;
  try {
    if (running) {
      await load(state, document);
      await waitHealthy(config, state, release);
    } else {
      await refuseService(config);
      // The persistent path is the exact config used by subsequent service registration.
      await writeJson(currentPath(config), document);
      processRecord = await launch(config, state, release, executable, currentPath(config));
    }
    await writeJson(currentPath(config), document);
    return {
      ...state,
      config,
      current: release,
      previous: state.current,
      process: processRecord,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (running && previousDocument) {
      try {
        await load(state, previousDocument);
        await waitHealthy(state.config, state, state.current);
      } catch (restoreError) {
        throw new Error(
          `Deployment failed: ${error.message}. Restoring previous release also failed: ${restoreError.message}`,
        );
      }
    }
    if (previousDocument) await writeJson(currentPath(config), previousDocument);
    throw error;
  } finally {
    await rm(candidate, { force: true });
  }
}
export async function deployNative(config) {
  await assertSource(config);
  const executable = await ensureCaddy();
  return lock(config, async () => {
    const state = await readJson(statePath(config), {
      version: 1,
      instanceId: randomUUID(),
      config,
      current: null,
      previous: null,
      process: null,
    });
    const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
    const siteDir = path.join(config.runtimeDir, 'releases', id, 'site');
    await mkdir(path.dirname(siteDir), { recursive: true });
    await cp(config.sourceDir, siteDir, { recursive: true, errorOnExist: true, force: false });
    const release = { id, siteDir, config: { ...config }, createdAt: new Date().toISOString() };
    try {
      const next = await activate(config, state, release, executable);
      await writeJson(statePath(config), next);
      return {
        status: 'running',
        release: id,
        url: `${localUrl(config)}${config.basePath}`,
        domain: config.domain,
        pid: next.process?.pid,
      };
    } catch (error) {
      const releaseDir = path.dirname(siteDir);
      if (within(path.join(config.runtimeDir, 'releases'), releaseDir))
        await rm(releaseDir, { recursive: true, force: true });
      throw error;
    }
  });
}
export async function statusNative(config) {
  const state = await readJson(statePath(config), null);
  if (!state?.current) return { status: 'not-deployed' };
  const running = await ownedServer(state);
  let healthy = false;
  if (running) {
    try {
      await health(state.config, state, state.current);
      healthy = true;
    } catch {
      /* represented in status */
    }
  }
  return {
    status: running ? (healthy ? 'running' : 'unhealthy') : 'stopped',
    release: state.current.id,
    previous: state.previous?.id ?? null,
    url: `${localUrl(state.config)}${state.config.basePath}`,
    process: state.process,
    service: Boolean(await registration(config)),
  };
}
export async function startNative(config) {
  return lock(config, async () => {
    await refuseService(config);
    const state = await readJson(statePath(config), null);
    if (!state?.current) throw new Error('No deployed release. Run deploy native first.');
    if (await ownedServer(state)) return statusNative(config);
    const executable = await ensureCaddy();
    const document = caddyConfig(state.config, state, state.current);
    await writeJson(currentPath(config), document);
    await validate(executable, currentPath(config));
    state.process = await launch(
      state.config,
      state,
      state.current,
      executable,
      currentPath(config),
    );
    await writeJson(statePath(config), state);
    return statusNative(config);
  });
}
export async function stopNative(config) {
  return lock(config, async () => {
    await refuseService(config, 'stop');
    const state = await readJson(statePath(config), null);
    if (!state?.current || !(await ownedServer(state)))
      return {
        status: 'stopped',
        message: 'No verified running instance. No process was signalled.',
      };
    const response = await request(`http://127.0.0.1:${state.config.adminPort}/stop`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Caddy refused stop (${response.status}).`);
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (!(await ownedServer(state))) {
        state.process = null;
        await writeJson(statePath(config), state);
        return { status: 'stopped', release: state.current.id };
      }
      await sleep(100);
    }
    throw new Error('The verified instance did not stop in time. Inspect caddy.log.');
  });
}
export async function rollbackNative(config) {
  return lock(config, async () => {
    const state = await readJson(statePath(config), null);
    if (!state?.previous) throw new Error('No previous successful release is available.');
    if (!within(path.join(config.runtimeDir, 'releases'), state.previous.siteDir))
      throw new Error('Previous release path is outside this instance.');
    const next = await activate(
      state.previous.config ?? state.config,
      state,
      state.previous,
      await ensureCaddy(),
    );
    await writeJson(statePath(config), next);
    return statusNative(config);
  });
}
