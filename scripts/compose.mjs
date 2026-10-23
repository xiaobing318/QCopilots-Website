import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const action = args.shift();
if (!['deploy', 'start', 'stop', 'status', 'rollback'].includes(action)) {
  throw new Error('Usage: compose deploy|start|stop|status|rollback [--config config/deploy.json]');
}
let configFile = 'config/deploy.json';
if (args.length) {
  if (args.length !== 2 || args[0] !== '--config') throw new Error('Only --config is supported.');
  configFile = args[1];
}
const defaults = {
  projectName: 'qcopilots-website',
  runtimeDir: '.qcopilots-deploy/compose',
  sourceDir: 'dist',
  basePath: '/',
  host: '127.0.0.1',
  httpPort: 8080,
  httpsPort: 8443,
  domain: null,
  email: null,
};
let loaded = {};
try {
  loaded = JSON.parse(await readFile(path.resolve(root, configFile), 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT' || args.length) throw error;
}
const config = { ...defaults, ...loaded.compose };
if (!/^[a-z0-9][a-z0-9_-]{0,48}$/.test(config.projectName)) {
  throw new Error(
    'compose.projectName must be 1–49 lowercase letters, numbers, underscores or hyphens.',
  );
}
if (!['127.0.0.1', '0.0.0.0'].includes(config.host)) {
  throw new Error('compose.host must be 127.0.0.1 or 0.0.0.0.');
}
for (const key of ['httpPort', 'httpsPort']) {
  if (!Number.isInteger(config[key]) || config[key] < 1 || config[key] > 65535) {
    throw new Error(`compose.${key} must be an integer from 1 to 65535.`);
  }
}
if (config.httpPort === config.httpsPort) throw new Error('HTTP and HTTPS ports must differ.');
if (
  typeof config.basePath !== 'string' ||
  !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]*\/?$/.test(config.basePath)
) {
  throw new Error('compose.basePath must be a URL path, for example / or /QCopilots-Website/.');
}
config.basePath =
  config.basePath === '/' ? '/' : `/${config.basePath.split('/').filter(Boolean).join('/')}/`;
if (
  config.domain !== null &&
  !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(config.domain)
) {
  throw new Error('compose.domain must be a hostname without a scheme, path, or port.');
}
if (config.email !== null && !/^[^\s@{}]+@[^\s@{}]+\.[^\s@{}]+$/.test(config.email)) {
  throw new Error('compose.email must be a valid email address.');
}
if (
  config.domain &&
  (config.host !== '0.0.0.0' || config.httpPort !== 80 || config.httpsPort !== 443)
) {
  throw new Error('Automatic public HTTPS requires host 0.0.0.0, httpPort 80 and httpsPort 443.');
}
if (process.platform !== 'linux')
  throw new Error('Compose deployment targets Linux with Docker Engine and Compose V2.');

const runtime = path.resolve(root, config.runtimeDir);
const statePath = path.join(runtime, 'state.json');
await mkdir(runtime, { recursive: true });
let lock;
try {
  lock = await open(path.join(runtime, 'operation.lock'), 'wx');
} catch (error) {
  if (error.code === 'EEXIST')
    throw new Error(
      `Another deployment may be running. Inspect ${path.join(runtime, 'operation.lock')} before removing a stale lock.`,
    );
  throw error;
}
await lock.writeFile(JSON.stringify({ pid: process.pid, action, at: new Date().toISOString() }));
let state;

function docker(parameters, { env, quiet = false } = {}) {
  const result = spawnSync('docker', parameters, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: quiet ? 'pipe' : ['ignore', 'inherit', 'inherit'],
    timeout: 10 * 60 * 1000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `docker ${parameters.slice(0, 3).join(' ')} failed (${result.status}). ${quiet ? result.stderr.trim() : ''}`,
    );
  }
  return result.stdout?.trim() ?? '';
}
function environment(release) {
  const settings = release.config;
  return {
    QCO_IMAGE: release.image,
    QCO_INSTANCE: state.instanceId,
    QCO_HOST: settings.host,
    QCO_HTTP_PORT: String(settings.httpPort),
    QCO_HTTPS_PORT: String(settings.httpsPort),
    QCO_BASE_PATH: settings.basePath,
    QCO_SITE_ADDRESS: settings.domain || ':80',
    QCO_EMAIL_CONFIG: settings.email ? `email ${settings.email}` : '',
  };
}
function compose(release, parameters, quiet = false) {
  return docker(
    [
      'compose',
      '--project-name',
      config.projectName,
      '--file',
      path.join(root, 'compose.yaml'),
      ...parameters,
    ],
    {
      env: environment(release),
      quiet,
    },
  );
}
async function save() {
  await writeFile(`${statePath}.tmp`, `${JSON.stringify(state, null, 2)}\n`);
  await rename(`${statePath}.tmp`, statePath);
}
function requireRelease() {
  if (!state.current) throw new Error('No successful deployment exists. Run deploy compose first.');
}
function assertOwnership() {
  const ids = docker(
    [
      'ps',
      '-a',
      '--filter',
      `label=com.docker.compose.project=${config.projectName}`,
      '--format',
      '{{.ID}}',
    ],
    { quiet: true },
  );
  for (const id of ids.split('\n').filter(Boolean)) {
    const instance = docker(
      ['inspect', '--format', '{{index .Config.Labels "com.qcopilots.instance"}}', id],
      { quiet: true },
    );
    if (instance !== state.instanceId) {
      throw new Error(
        `Compose project ${config.projectName} belongs to another instance. Choose a different projectName and runtimeDir.`,
      );
    }
  }
}
function verify(release) {
  const container = compose(release, ['ps', '-q', 'website'], true);
  if (!container) throw new Error('The website container is missing.');
  const body = docker(
    ['exec', container, 'wget', '-qO-', `http://127.0.0.1:2016/build-info.json`],
    { quiet: true },
  );
  const actual = JSON.parse(body);
  if (actual.buildId !== release.buildId)
    throw new Error('The running container does not contain the expected build.');
}
function up(release) {
  compose(release, ['up', '-d', '--no-build', '--wait', '--wait-timeout', '90']);
  verify(release);
}

try {
  docker(['info', '--format', '{{.OSType}}'], { quiet: true });
  docker(['compose', 'version', '--short'], { quiet: true });
  try {
    state = JSON.parse(await readFile(statePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    state = {
      instanceId: randomUUID(),
      projectName: config.projectName,
      current: null,
      previous: null,
    };
  }
  if (state.projectName !== config.projectName)
    throw new Error(
      'The configured projectName differs from this runtime directory. Use a new runtimeDir for a new project.',
    );
  assertOwnership();
  if (action === 'deploy') {
    const source = path.resolve(root, config.sourceDir);
    const build = JSON.parse(await readFile(path.join(source, 'build-info.json'), 'utf8'));
    const base =
      build.basePath === '/' ? '/' : `/${build.basePath.split('/').filter(Boolean).join('/')}/`;
    if (base !== config.basePath)
      throw new Error(
        'Build BASE_PATH and compose.basePath differ. Rebuild for the deployment path.',
      );
    if (typeof build.buildId !== 'string' || !build.buildId)
      throw new Error('The static build has no buildId.');
    const release = {
      id: randomUUID(),
      image: `${config.projectName}:${randomUUID()}`,
      buildId: build.buildId,
      deployedAt: new Date().toISOString(),
      config,
    };
    // An isolated context permits transferred builds and paths containing spaces.
    const context = path.join(runtime, 'contexts', release.id);
    await mkdir(path.join(context, 'deploy'), { recursive: true });
    const { cp } = await import('node:fs/promises');
    await cp(source, path.join(context, 'dist'), { recursive: true, dereference: false });
    await cp(path.join(root, 'Dockerfile'), path.join(context, 'Dockerfile'));
    await cp(path.join(root, 'deploy', 'Caddyfile'), path.join(context, 'deploy', 'Caddyfile'));
    try {
      docker([
        'build',
        '--pull',
        '--build-arg',
        `BASE_PATH=${config.basePath}`,
        '--build-arg',
        `RELEASE_ID=${build.buildId}`,
        '--tag',
        release.image,
        context,
      ]);
      compose(release, ['config', '--quiet']);
      await save();
      try {
        up(release);
      } catch (error) {
        if (state.current) up(state.current);
        else compose(release, ['down', '--remove-orphans']);
        throw error;
      }
      state.previous = state.current;
      state.current = release;
      await save();
    } finally {
      await rm(context, { recursive: true, force: true });
    }
    console.log(`Deployed ${release.buildId}. Previous image is retained for rollback.`);
  } else if (action === 'rollback') {
    requireRelease();
    if (!state.previous) throw new Error('There is no previous successful release.');
    try {
      up(state.previous);
    } catch (error) {
      up(state.current);
      throw error;
    }
    [state.current, state.previous] = [state.previous, state.current];
    await save();
    console.log(`Rolled back to ${state.current.buildId}.`);
  } else if (action === 'status') {
    if (!state.current) console.log('No successful Compose deployment.');
    else compose(state.current, ['ps', '--all']);
  } else {
    requireRelease();
    if (action === 'start') up(state.current);
    else compose(state.current, ['stop']);
  }
} finally {
  await lock.close();
  await rm(path.join(runtime, 'operation.lock'), { force: true });
}
