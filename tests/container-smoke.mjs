import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
if (process.platform !== 'linux')
  throw new Error('Run the container smoke test on Linux with Docker Engine and Compose V2.');
const work = await mkdtemp(path.join(os.tmpdir(), 'qcopilots container 中文 '));
const source = path.join(work, 'static build');
const runtime = path.join(work, 'runtime');
const configuration = path.join(work, 'deploy.json');
const projectName = `qco-test-${randomUUID().slice(0, 8)}`;
const port = await freePort();
let httpsPort = await freePort();
while (httpsPort === port) httpsPort = await freePort();
const images = new Set();
let basePath = '/';

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) =>
    server.listen(0, '127.0.0.1', resolve).once('error', reject),
  );
  const result = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return result;
}
function run(command, parameters, options = {}) {
  const result = spawnSync(command, parameters, {
    cwd: root,
    encoding: 'utf8',
    timeout: 10 * 60 * 1000,
    ...options,
  });
  if (result.error) throw result.error;
  return result;
}
function cli(action, success = true) {
  const result = run(process.execPath, ['scripts/compose.mjs', action, '--config', configuration]);
  if (success) assert.equal(result.status, 0, `${action}: ${result.stdout}\n${result.stderr}`);
  else assert.notEqual(result.status, 0, `${action} unexpectedly succeeded`);
  console.log(result.stdout.trim());
  return result;
}
async function state() {
  const value = JSON.parse(await readFile(path.join(runtime, 'state.json'), 'utf8'));
  if (value.current) images.add(value.current.image);
  if (value.previous) images.add(value.previous.image);
  return value;
}
function probe(url, options = {}) {
  // Every probe follows a synchronous Docker operation that may replace or stop
  // the server. Do not reuse a socket whose close event was blocked by spawnSync.
  return fetch(url, {
    ...options,
    headers: { Connection: 'close' },
    signal: AbortSignal.timeout(10_000),
  });
}
async function expectBuild(id) {
  const response = await probe(`http://127.0.0.1:${port}${basePath}build-info.json`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).buildId, id);
}

try {
  assert.equal(run('docker', ['info']).status, 0, 'Docker Engine is required.');
  assert.equal(run('docker', ['compose', 'version']).status, 0, 'Docker Compose V2 is required.');
  await mkdir(source, { recursive: true });
  await cp(path.join(root, 'dist'), source, { recursive: true });
  const originalBuild = JSON.parse(await readFile(path.join(source, 'build-info.json'), 'utf8'));
  basePath = `/${originalBuild.basePath.split('/').filter(Boolean).join('/')}/`.replace('//', '/');
  const config = {
    compose: {
      projectName,
      runtimeDir: runtime,
      sourceDir: source,
      basePath,
      host: '127.0.0.1',
      httpPort: port,
      httpsPort,
    },
  };
  await writeFile(configuration, JSON.stringify(config));
  await writeFile(
    path.join(source, 'build-info.json'),
    JSON.stringify({ buildId: 'container-smoke-first', basePath }),
  );
  cli('deploy');
  await state();
  await expectBuild('container-smoke-first');
  const home = await probe(`http://127.0.0.1:${port}${basePath}zh/`);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /QCopilots/);
  console.log('Container smoke: canonical directory redirects preserve the complete query string.');
  const directory = basePath === '/' ? '/zh/' : basePath;
  for (const query of ['', '?source=chrome-audit&label=hello%20world&tag=one&tag=two']) {
    const redirect = await probe(`http://127.0.0.1:${port}${directory.slice(0, -1)}${query}`, {
      redirect: 'manual',
    });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), `${directory}${query}`);
  }
  assert.equal(
    (await probe(`http://127.0.0.1:${port}${basePath}missing-container-page`)).status,
    404,
  );
  cli('start');
  cli('start');
  cli('status');
  await writeFile(
    path.join(source, 'build-info.json'),
    JSON.stringify({ buildId: 'container-smoke-second', basePath }),
  );
  cli('deploy');
  await state();
  await expectBuild('container-smoke-second');
  cli('rollback');
  await expectBuild('container-smoke-first');

  // An invalid candidate never changes the current deployment.
  await writeFile(
    path.join(source, 'build-info.json'),
    JSON.stringify({ buildId: 'wrong-path', basePath: '/wrong/' }),
  );
  cli('deploy', false);
  await expectBuild('container-smoke-first');
  cli('stop');
  cli('stop');
  cli('start');
  await expectBuild('container-smoke-first');
  cli('stop');
  console.log('Container lifecycle, rollback, custom paths, 404 and build identity passed.');
} finally {
  const result = run('docker', [
    'ps',
    '-aq',
    '--filter',
    `label=com.docker.compose.project=${projectName}`,
  ]);
  const ids = result.stdout.trim().split(/\s+/).filter(Boolean);
  if (ids.length) run('docker', ['rm', '-f', ...ids]);
  run('docker', ['volume', 'rm', `${projectName}_caddy-data`, `${projectName}_caddy-config`]);
  run('docker', ['network', 'rm', `${projectName}_default`]);
  if (images.size) run('docker', ['image', 'rm', ...images]);
  await rm(work, { recursive: true, force: true });
}
