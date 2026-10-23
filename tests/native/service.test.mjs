import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  createServicePlan,
  isInstalled,
  quoteWindowsArgument,
  renderLaunchdPlist,
  renderSystemdUnit,
  service,
  validateServiceUser,
  windowsAccessRules,
} from '../../scripts/runtime/service.mjs';

const posixInput = {
  user: 'website',
  uid: 1000,
  executable: '/srv/产品 site/caddy',
  configPath: '/srv/产品 site/runtime/current.json',
  runtimeDir: '/srv/产品 site/runtime',
};
const windowsInput = {
  executable: 'C:\\产品 site\\caddy.exe',
  configPath: 'C:\\产品 site\\runtime\\current.json',
  runtimeDir: 'C:\\产品 site\\runtime',
};

test('Windows registration preserves spaces and Unicode without a command shell', () => {
  const plan = createServicePlan({ ...windowsInput, platform: 'win32' });
  assert.equal(
    plan.definition,
    '"C:\\产品 site\\caddy.exe" run --config "C:\\产品 site\\runtime\\current.json"',
  );
  assert.equal(plan.installCommands[0][6], plan.definition);
  assert.deepEqual(plan.startCommands, [['sc.exe', 'start', 'qcopilots-website']]);
  assert.equal(plan.installCommands.length, 1);
  assert.equal(quoteWindowsArgument('C:\\trailing\\'), '"C:\\trailing\\\\"');
  assert.equal(quoteWindowsArgument('a"b'), '"a\\"b"');
});

test('systemd paths escape command expansion and preserve non-ASCII characters', () => {
  const unit = renderSystemdUnit({
    ...posixInput,
    executable: '/srv/$HOME/100%/caddy',
    configPath: '/srv/产品 "site/current.json',
    scope: 'system',
  });
  assert.ok(
    unit.includes(
      'ExecStart=":/srv/$HOME/100%%/caddy" "run" "--config" "/srv/产品 \\"site/current.json"',
    ),
  );
  assert.ok(unit.includes('WantedBy=multi-user.target'));
  const user = createServicePlan({
    ...posixInput,
    platform: 'linux',
    scope: 'user',
    home: '/home/test person',
  });
  assert.equal(
    user.definitionPath,
    '/home/test person/.config/systemd/user/qcopilots-website.service',
  );
  assert.deepEqual(user.installCommands[1], [
    'systemctl',
    '--user',
    'enable',
    'qcopilots-website.service',
  ]);
  assert.ok(user.definition.includes('WantedBy=default.target'));
});

test('services use LocalService or an explicit non-root Unix account', () => {
  const windows = createServicePlan({ ...windowsInput, platform: 'win32' });
  assert.equal(windows.account, 'NT AUTHORITY\\LocalService');
  const args = windows.installCommands[0];
  assert.equal(args[args.indexOf('obj=') + 1], 'NT AUTHORITY\\LocalService');
  const linuxUser = createServicePlan({ ...posixInput, platform: 'linux' });
  assert.equal(linuxUser.scope, 'user');
  assert.ok(!linuxUser.definition.includes('User='));
  assert.ok(!linuxUser.definition.includes('AmbientCapabilities='));
  const linuxSystem = createServicePlan({ ...posixInput, platform: 'linux', scope: 'system' });
  assert.ok(linuxSystem.definition.includes('User=website\n'));
  assert.ok(linuxSystem.definition.includes('AmbientCapabilities=CAP_NET_BIND_SERVICE\n'));
  assert.ok(linuxSystem.definition.includes('CapabilityBoundingSet=CAP_NET_BIND_SERVICE\n'));
  const mac = createServicePlan({ ...posixInput, platform: 'darwin', scope: 'system' });
  assert.ok(mac.definition.includes('<key>UserName</key><string>website</string>'));
  for (const user of ['root', '0', 'website\nUser=root', 'user;id', 'bad user', '../root']) {
    assert.throws(() => validateServiceUser(user, 'linux'), /non-root/u);
  }
  for (const user of ['LocalSystem', 'NT AUTHORITY\\SYSTEM', 'Administrator']) {
    assert.throws(() => validateServiceUser(user, 'win32'), /LocalService/u);
  }
  assert.throws(
    () => createServicePlan({ ...posixInput, platform: 'linux', scope: 'system', user: undefined }),
    /non-root/u,
  );
  assert.throws(
    () => createServicePlan({ ...posixInput, platform: 'linux', scope: 'user', uid: 0 }),
    /non-root/u,
  );
});

test('Windows ACL plan gives inherited read access and restricts writes to Caddy data', () => {
  const rules = windowsAccessRules(windowsInput);
  assert.equal(rules.length, 3);
  assert.ok(rules.every((rule) => rule.sid === 'S-1-5-19'));
  assert.deepEqual(
    rules.filter((rule) => rule.rights === 'Modify').map((rule) => rule.path),
    ['C:\\产品 site\\runtime\\caddy-data'],
  );
  assert.equal(rules[0].rights, 'ReadAndExecute');
  assert.equal(rules[0].inheritance, 'ContainerInherit, ObjectInherit');
  assert.equal(rules[2].path, windowsInput.executable);
  assert.equal(rules[2].inheritance, 'None');
  assert.ok(rules.every((rule) => !rule.path.match(/^[A-Z]:\\$/u)));
});

test('launchd uses a tokenized argv array and escapes XML', () => {
  const plist = renderLaunchdPlist({ ...posixInput, executable: '/srv/A&B/"caddy"' });
  assert.ok(plist.includes('<string>/srv/A&amp;B/&quot;caddy&quot;</string>'));
  assert.ok(plist.includes('<string>/srv/产品 site/runtime/current.json</string>'));
  const plan = createServicePlan({
    ...posixInput,
    platform: 'darwin',
    scope: 'user',
    home: '/Users/测试',
    uid: 501,
  });
  assert.equal(
    plan.definitionPath,
    '/Users/测试/Library/LaunchAgents/org.qcopilots.qcopilots-website.plist',
  );
  assert.deepEqual(plan.startCommands, [
    ['launchctl', 'bootstrap', 'gui/501', plan.definitionPath],
  ]);
  assert.ok(plan.installCommands.every((command) => !command.includes('bootstrap')));
});

test('service identifiers and paths reject unsafe or unrelated registration targets', () => {
  for (const serviceName of ['../caddy', 'has space', 'a\nExecStart=bad', 'A', '']) {
    assert.throws(() => createServicePlan({ ...posixInput, platform: 'linux', serviceName }));
  }
  assert.throws(
    () => createServicePlan({ ...posixInput, platform: 'linux', configPath: '/etc/other.json' }),
    /current.json/u,
  );
  assert.throws(
    () => createServicePlan({ ...posixInput, platform: 'linux', executable: 'caddy' }),
    /absolute/u,
  );
  assert.throws(
    () => createServicePlan({ ...posixInput, platform: 'linux', executable: '/srv/a"b/caddy' }),
    /quotes or backslashes/u,
  );
  assert.equal(
    createServicePlan({ ...posixInput, platform: 'linux', serviceName: 'a'.repeat(64) }).serviceName
      .length,
    64,
  );
  assert.throws(
    () => createServicePlan({ ...windowsInput, platform: 'win32', scope: 'user' }),
    /system scope/u,
  );
  assert.throws(
    () =>
      createServicePlan({
        ...windowsInput,
        platform: 'win32',
        executable: 'C:\\%TEMP%\\caddy.exe',
      }),
    /expansion/u,
  );
});

test('dry run requires deployed configuration and never creates a registration', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'qcopilots-service-测试 '));
  try {
    const runtimeDir = path.join(root, 'runtime');
    const configPath = path.join(runtimeDir, 'current.json');
    const executable = path.join(root, process.platform === 'win32' ? 'caddy.exe' : 'caddy');
    await mkdir(runtimeDir);
    await writeFile(executable, 'not executed');
    await writeFile(
      configPath,
      JSON.stringify({ apps: { http: { servers: { site: { listen: ['127.0.0.1:8080'] } } } } }),
    );
    const result = await service({
      action: 'install',
      runtimeDir,
      configPath,
      executable,
      dryRun: true,
    });
    assert.equal(result.dryRun, true);
    assert.equal(result.startsImmediately, false);
    assert.equal(await isInstalled(runtimeDir), null);
    await assert.rejects(
      service({ action: 'uninstall', runtimeDir, configPath, executable, dryRun: true }),
      /Nothing was removed/u,
    );
    await writeFile(configPath, '{}');
    await assert.rejects(
      service({ action: 'install', runtimeDir, configPath, executable, dryRun: true }),
      /Deploy the site/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('foreign registration cannot authorize an uninstall', async () => {
  const runtimeDir = await mkdtemp(path.join(tmpdir(), 'qcopilots-service-owner-'));
  try {
    await writeFile(
      path.join(runtimeDir, 'service-registration.json'),
      JSON.stringify({ owner: 'other-app' }),
    );
    await assert.rejects(isInstalled(runtimeDir), /Unrecognized/u);
    await writeFile(
      path.join(runtimeDir, 'service-registration.json'),
      JSON.stringify({ owner: 'qcopilots-website/service/v1', platform: 'elsewhere' }),
    );
    await assert.rejects(
      service({
        action: 'uninstall',
        runtimeDir,
        configPath: path.join(runtimeDir, 'current.json'),
        executable: process.execPath,
        dryRun: true,
      }),
      /ownership mismatch/u,
    );
  } finally {
    await rm(runtimeDir, { recursive: true, force: true });
  }
});
