import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { root } from '../../scripts/runtime/common.mjs';

test('invalid lifecycle target is rejected instead of selecting native deployment', () => {
  const result = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/site.mjs'), 'stop', '--target', 'compsoe'],
    { encoding: 'utf8', windowsHide: true },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--target must be native or compose/);
});

test('contradictory deployment target flags are rejected before a deployment', () => {
  const result = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/site.mjs'), 'deploy', 'native', '--target', 'compose'],
    { encoding: 'utf8', windowsHide: true },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--target is only for start/);
});
