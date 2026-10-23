import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { normalizeConfig } from '../scripts/runtime/config.mjs';
import {
  deployNative,
  startNative,
  stopNative,
  statusNative,
  rollbackNative,
} from '../scripts/runtime/native.mjs';
import { within, sleep } from '../scripts/runtime/common.mjs';

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
const parent = path.resolve(process.env.QC_NATIVE_TEST_TEMP ?? os.tmpdir());
await mkdir(parent, { recursive: true });
const temporary = await mkdtemp(path.join(parent, 'qcopilots native 中文 '));
const source = path.join(temporary, 'static content 中文');
await mkdir(source);
await writeFile(
  path.join(source, 'index.html'),
  '<!doctype html><html lang="en"><title>Release one</title><p>Release one</p></html>',
);
await writeFile(
  path.join(source, '404.html'),
  '<!doctype html><html lang="en"><title>Not found</title><p>Not found</p></html>',
);
await writeFile(
  path.join(source, 'build-info.json'),
  JSON.stringify({ basePath: '/test-prefix/' }),
);
const config = normalizeConfig({
  sourceDir: source,
  runtimeDir: path.join(temporary, 'deployment 中文'),
  basePath: '/test-prefix/',
  port: Number(process.env.QC_NATIVE_TEST_PORT ?? (await freePort())),
  adminPort: Number(process.env.QC_NATIVE_TEST_ADMIN_PORT ?? (await freePort())),
});
let unrelated;
try {
  console.log(
    'Native smoke: first deploy, idempotent start, Unicode/space paths, prefix, custom 404.',
  );
  const first = await deployNative(config);
  assert.equal(first.status, 'running');
  const repeated = await startNative(config);
  assert.equal(repeated.process.pid, first.pid);
  assert.match(await (await fetch(first.url)).text(), /Release one/);
  console.log('Native smoke: prefix canonical redirects preserve the complete query string.');
  for (const query of ['', '?source=chrome-audit&label=hello%20world&tag=one&tag=two']) {
    const redirect = await fetch(`${first.url.slice(0, -1)}${query}`, { redirect: 'manual' });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), `${config.basePath}${query}`);
  }
  const notFound = await fetch(`${first.url}missing`);
  assert.equal(notFound.status, 404);
  assert.match(await notFound.text(), /Not found/);
  const wrongPrefix = await fetch(first.url.replace('/test-prefix/', '/index.html'));
  assert.equal(wrongPrefix.status, 404);
  console.log('Native smoke: update and rollback preserve previous successful content.');
  await writeFile(
    path.join(source, 'index.html'),
    '<!doctype html><html lang="en"><title>Release two</title><p>Release two</p></html>',
  );
  const second = await deployNative(config);
  assert.notEqual(second.release, first.release);
  assert.match(await (await fetch(first.url)).text(), /Release two/);
  console.log('Native smoke: failed listener update restores the active release.');
  unrelated = http.createServer((_request, response) => response.end('port-blocker'));
  await new Promise((resolve) => unrelated.listen(0, '127.0.0.1', resolve));
  const blockedPort = unrelated.address().port;
  await assert.rejects(deployNative({ ...config, port: blockedPort }), /rejected configuration/);
  assert.match(await (await fetch(first.url)).text(), /Release two/);
  assert.equal(await (await fetch(`http://127.0.0.1:${blockedPort}`)).text(), 'port-blocker');
  await new Promise((resolve) => unrelated.close(resolve));
  unrelated = null;
  await rollbackNative(config);
  assert.match(await (await fetch(first.url)).text(), /Release one/);
  console.log('Native smoke: rollback restores the original deployment prefix and settings.');
  await writeFile(
    path.join(source, 'build-info.json'),
    JSON.stringify({ basePath: '/new-prefix/' }),
  );
  await deployNative({ ...config, basePath: '/new-prefix/' });
  assert.equal((await fetch(first.url)).status, 404);
  await rollbackNative(config);
  assert.equal((await statusNative(config)).url, first.url);
  assert.match(await (await fetch(first.url)).text(), /Release one/);
  console.log('Native smoke: invalid artifact leaves active release unchanged.');
  await writeFile(path.join(source, 'build-info.json'), JSON.stringify({ basePath: '/wrong/' }));
  await assert.rejects(deployNative(config), /basePath/);
  assert.match(await (await fetch(first.url)).text(), /Release one/);
  await writeFile(
    path.join(source, 'build-info.json'),
    JSON.stringify({ basePath: '/test-prefix/' }),
  );
  await stopNative(config);
  await stopNative(config);
  assert.equal((await statusNative(config)).status, 'stopped');
  await sleep(250);
  console.log('Native smoke: occupied port and forged/stale PID never stop unrelated server.');
  unrelated = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('unrelated');
  });
  await new Promise((resolve) => unrelated.listen(config.port, '127.0.0.1', resolve));
  await assert.rejects(startNative(config), /occupied/);
  const persisted = JSON.parse(await readFile(path.join(config.runtimeDir, 'state.json'), 'utf8'));
  persisted.process = { pid: process.pid, executable: process.execPath, configPath: 'not-ours' };
  await writeFile(path.join(config.runtimeDir, 'state.json'), JSON.stringify(persisted));
  await stopNative(config);
  assert.equal(await (await fetch(`http://127.0.0.1:${config.port}`)).text(), 'unrelated');
  await new Promise((resolve) => unrelated.close(resolve));
  unrelated = null;
  console.log('Native smoke: unowned admin endpoint receives no stop or load requests.');
  let foreignMutation = false;
  unrelated = http.createServer((request, response) => {
    if (request.method !== 'GET') foreignMutation = true;
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ apps: { http: { servers: { foreign: {} } } } }));
  });
  await new Promise((resolve) => unrelated.listen(config.adminPort, '127.0.0.1', resolve));
  await assert.rejects(startNative(config), /occupied/);
  await stopNative(config);
  assert.equal(foreignMutation, false);
  await new Promise((resolve) => unrelated.close(resolve));
  unrelated = null;
  await startNative(config);
  assert.equal((await statusNative(config)).status, 'running');
  console.log('Native smoke passed.');
} finally {
  if (unrelated) await new Promise((resolve) => unrelated.close(resolve));
  await stopNative(config);
  await sleep(250);
  if (!within(parent, temporary)) throw new Error('Unsafe test cleanup path refused.');
  await rm(temporary, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
