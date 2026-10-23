import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { normalizeConfig, normalizeBasePath, caddyConfig } from '../../scripts/runtime/config.mjs';
import { toolchain, within, optionsFrom } from '../../scripts/runtime/common.mjs';

test('native config rejects occupied-role ports and malformed paths before mutations', () => {
  assert.throws(() => normalizeConfig({ port: 8080, adminPort: 8080 }), /different/);
  assert.throws(() => normalizeConfig({ port: '8080oops' }), /integer/);
  assert.throws(() => normalizeConfig({ host: 'example.com' }), /IPv4/);
  assert.throws(() => normalizeConfig({ domain: 'https://example.com/' }), /DNS/);
  assert.throws(() => normalizeBasePath('/../../elsewhere'), /basePath/);
  assert.equal(normalizeBasePath('/QCopilots-Website'), '/QCopilots-Website/');
});

test('subpath deployment strips prefix without SPA fallback and keeps scoped identity', () => {
  const config = normalizeConfig({ basePath: '/QCopilots-Website/' });
  const state = { instanceId: 'instance-123' };
  const release = { id: 'release-456', siteDir: path.resolve('test files 中文') };
  const result = caddyConfig(config, state, release);
  assert.equal(result.admin.listen, '127.0.0.1:20199');
  assert.equal(result.admin.config.persist, false);
  const server = result.apps.http.servers['qc-instance-123'];
  const route = server.routes.find((item) => item.match?.[0]?.path?.[0] === '/QCopilots-Website/*');
  assert.deepEqual(route.match, [{ path: ['/QCopilots-Website/*'] }]);
  assert.equal(route.handle[0].strip_path_prefix, '/QCopilots-Website');
  assert.equal(server.routes[0].handle[0].body, 'release-456');
  assert.equal(server.errors.routes[0].handle.at(-1).status_code, 404);
});

test('public domain adds HTTPS while retaining loopback deployment health listener', () => {
  const config = normalizeConfig({ domain: 'example.com', email: 'admin@example.com' });
  const result = caddyConfig(config, { instanceId: 'one' }, { id: 'two', siteDir: '/site' });
  assert.deepEqual(result.apps.http.servers['public-one'].listen, [':443']);
  assert.deepEqual(result.apps.http.servers['qc-one'].listen, ['127.0.0.1:8080']);
  assert.equal(result.apps.tls.automation.policies[0].issuers[0].email, 'admin@example.com');
});

test('every supported platform has independently pinned official archive checksums', () => {
  for (const product of ['node', 'caddy'])
    for (const platform of ['win32', 'linux', 'darwin'])
      for (const arch of ['x64', 'arm64']) {
        const key = `${product}-${platform}-${arch}`;
        assert.match(toolchain[`${key}-sha256`], /^[0-9a-f]{64}$/);
        assert.match(
          toolchain[`${key}-url`],
          product === 'node'
            ? /^https:\/\/nodejs.org\/dist\/v24.22.1\//
            : /^https:\/\/github.com\/caddyserver\/caddy\/releases\/download\/v2.11.7\//,
        );
      }
});

test('cleanup bounds and command argument parsing reject sibling escapes', () => {
  assert.equal(within('/tmp/release', '/tmp/release-other'), false);
  assert.equal(within('/tmp/release', '/tmp/release'), false);
  assert.equal(within('/tmp/release', '/tmp/release/child'), true);
  assert.deepEqual(optionsFrom(['deploy', 'native', '--source', 'build 中文', '--dry-run']), {
    positional: ['deploy', 'native'],
    options: { source: 'build 中文', 'dry-run': true },
  });
  assert.throws(() => optionsFrom(['--config']), /Missing/);
});
