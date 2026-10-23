import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstat, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { homedir, userInfo } from 'node:os';
import path from 'node:path';

const OWNER = 'qcopilots-website/service/v1';
const MARKER = 'service-registration.json';
const LOCAL_SERVICE = 'NT AUTHORITY\\LocalService';
const LOCAL_SERVICE_SID = 'S-1-5-19';

function clean(value, label) {
  if (typeof value !== 'string' || !value || /[\0-\x1f\x7f]/u.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

function name(value) {
  if (!/^[a-z][a-z0-9-]{2,63}$/u.test(value)) {
    throw new Error(
      'serviceName must start with a lowercase letter and contain only lowercase letters, digits and hyphens (3–64 characters).',
    );
  }
  return value;
}

function xml(value) {
  return clean(value, 'XML value').replace(
    /[<>&"']/gu,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character],
  );
}

export function validateServiceUser(user, platform = process.platform) {
  if (platform === 'win32') {
    if (
      user &&
      user.toLowerCase() !== LOCAL_SERVICE.toLowerCase() &&
      user.toLowerCase() !== 'localservice'
    )
      throw new Error('Windows website services must run as NT AUTHORITY\\LocalService.');
    return LOCAL_SERVICE;
  }
  if (
    typeof user !== 'string' ||
    !/^[A-Za-z_][A-Za-z0-9_.-]{0,63}$/u.test(user) ||
    user.toLowerCase() === 'root'
  )
    throw new Error(
      'Choose an existing non-root service account with --user (or invoke system installation through sudo as a non-root user).',
    );
  return user;
}

// systemd has its own quoting and %-specifiers. No shell is used.
function systemd(value) {
  const escaped = clean(value, 'systemd value')
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('%', '%%');
  return `"${escaped}"`;
}

export function quoteWindowsArgument(value) {
  return `"${clean(value, 'Windows argument')
    .replace(/(\\*)"/gu, '$1$1\\"')
    .replace(/(\\+)$/u, '$1$1')}"`;
}

export function renderWindowsService({ executable, configPath }) {
  // Caddy v2.11.7 implements SCM in service_windows.go. No wrapper is required.
  // https://caddyserver.com/docs/running#windows-service
  return `${quoteWindowsArgument(executable)} run --config ${quoteWindowsArgument(configPath)}`;
}

export function renderSystemdUnit({ executable, configPath, runtimeDir, scope = 'user', user }) {
  if (/["'\\]/u.test(executable))
    throw new Error(
      'systemd executable paths cannot contain quotes or backslashes. Move the Caddy executable to a compatible path.',
    );
  // The ':' executable prefix disables environment substitution in all arguments.
  // Doubling dollars is incorrect for the executable path, which is resolved first.
  const account =
    scope === 'system'
      ? `User=${validateServiceUser(user, 'linux')}\nAmbientCapabilities=CAP_NET_BIND_SERVICE\nCapabilityBoundingSet=CAP_NET_BIND_SERVICE\n`
      : '';
  return `# Managed by ${OWNER}\n[Unit]\nDescription=QCopilots website\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=notify\n${account}ExecStart=${[`:${executable}`, 'run', '--config', configPath].map(systemd).join(' ')}\nExecReload=${[`:${executable}`, 'reload', '--config', configPath].map(systemd).join(' ')}\nWorkingDirectory=${systemd(runtimeDir)}\nRestart=on-failure\nRestartSec=5s\nTimeoutStopSec=30s\nNoNewPrivileges=true\n\n[Install]\nWantedBy=${scope === 'user' ? 'default.target' : 'multi-user.target'}\n`;
}

export function renderLaunchdPlist({
  executable,
  configPath,
  runtimeDir,
  serviceName = 'qcopilots-website',
  scope = 'user',
  user,
}) {
  const label = `org.qcopilots.${name(serviceName)}`;
  const account =
    scope === 'system'
      ? `  <key>UserName</key><string>${xml(validateServiceUser(user, 'darwin'))}</string>\n`
      : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<!-- Managed by ${OWNER} -->\n<plist version="1.0"><dict>\n  <key>Label</key><string>${xml(label)}</string>\n${account}  <key>ProgramArguments</key><array>\n${[executable, 'run', '--config', configPath].map((value) => `    <string>${xml(value)}</string>`).join('\n')}\n  </array>\n  <key>WorkingDirectory</key><string>${xml(runtimeDir)}</string>\n  <key>RunAtLoad</key><true/>\n  <key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict>\n  <key>ThrottleInterval</key><integer>10</integer>\n  <key>StandardOutPath</key><string>${xml(path.posix.join(runtimeDir, 'service.stdout.log'))}</string>\n  <key>StandardErrorPath</key><string>${xml(path.posix.join(runtimeDir, 'service.stderr.log'))}</string>\n</dict></plist>\n`;
}

/** Pure renderer. Commands are argv arrays and must never be passed to a shell. */
export function createServicePlan({
  configPath,
  runtimeDir,
  executable,
  serviceName = 'qcopilots-website',
  platform = process.platform,
  scope = platform === 'win32' ? 'system' : 'user',
  user,
  home = homedir(),
  uid = process.getuid?.() ?? 1000,
}) {
  name(serviceName);
  if (!['system', 'user'].includes(scope)) throw new Error('Service scope must be system or user.');
  if (!['win32', 'linux', 'darwin'].includes(platform))
    throw new Error(`Services are unsupported on ${platform}.`);
  if (platform === 'win32' && scope !== 'system')
    throw new Error('Windows services require system scope.');
  const account = validateServiceUser(
    platform === 'win32' ? user : (user ?? (scope === 'user' ? userInfo().username : undefined)),
    platform,
  );
  if (platform !== 'win32' && scope === 'user' && uid === 0)
    throw new Error('User services must be installed from a non-root login session.');
  const paths = platform === 'win32' ? path.win32 : path.posix;
  for (const [key, value] of Object.entries({ configPath, runtimeDir, executable })) {
    if (!paths.isAbsolute(clean(value, key))) throw new Error(`${key} must be an absolute path.`);
    if (platform === 'win32' && value.includes('%'))
      throw new Error('Windows service paths cannot contain % environment expansion markers.');
  }
  configPath = paths.normalize(configPath);
  runtimeDir = paths.normalize(runtimeDir);
  executable = paths.normalize(executable);
  if (configPath !== paths.join(runtimeDir, 'current.json'))
    throw new Error('The service must use runtimeDir/current.json from a deployed site.');
  const input = { executable, configPath, runtimeDir, serviceName, scope, user: account };
  const base = {
    owner: OWNER,
    platform,
    scope,
    serviceName,
    configPath,
    runtimeDir,
    executable,
    account,
    markerPath: paths.join(runtimeDir, MARKER),
  };
  if (platform === 'win32') {
    const definition = renderWindowsService(input);
    return {
      ...base,
      definition,
      definitionPath: null,
      accessRules: windowsAccessRules(input),
      installCommands: [
        [
          'sc.exe',
          'create',
          serviceName,
          'start=',
          'auto',
          'binPath=',
          definition,
          'obj=',
          account,
          'DisplayName=',
          'QCopilots website',
        ],
      ],
      startCommands: [['sc.exe', 'start', serviceName]],
      stopCommands: [['sc.exe', 'stop', serviceName]],
      removeCommands: [['sc.exe', 'delete', serviceName]],
    };
  }
  if (platform === 'linux') {
    const unit = `${serviceName}.service`;
    const prefix = scope === 'user' ? ['systemctl', '--user'] : ['systemctl'];
    return {
      ...base,
      definition: renderSystemdUnit(input),
      definitionPath: paths.join(
        scope === 'user' ? paths.join(home, '.config/systemd/user') : '/etc/systemd/system',
        unit,
      ),
      installCommands: [
        [...prefix, 'daemon-reload'],
        [...prefix, 'enable', unit],
      ],
      startCommands: [[...prefix, 'start', unit]],
      stopCommands: [[...prefix, 'stop', unit]],
      removeCommands: [[...prefix, 'disable', '--now', unit]],
      afterRemoveCommands: [[...prefix, 'daemon-reload']],
    };
  }
  const label = `org.qcopilots.${serviceName}`;
  const domain = scope === 'user' ? `gui/${uid}` : 'system';
  const definitionPath = paths.join(
    scope === 'user' ? paths.join(home, 'Library/LaunchAgents') : '/Library/LaunchDaemons',
    `${label}.plist`,
  );
  return {
    ...base,
    definition: renderLaunchdPlist(input),
    definitionPath,
    domain,
    label,
    installCommands: [['launchctl', 'enable', `${domain}/${label}`]],
    startCommands: [['launchctl', 'bootstrap', domain, definitionPath]],
    stopCommands: [['launchctl', 'bootout', `${domain}/${label}`]],
    removeCommands: [['launchctl', 'disable', `${domain}/${label}`]],
  };
}

/** Only the data directory is writable. Future releases inherit runtime read access. */
export function windowsAccessRules({ runtimeDir, executable }) {
  return [
    {
      path: path.win32.normalize(runtimeDir),
      sid: LOCAL_SERVICE_SID,
      rights: 'ReadAndExecute',
      inheritance: 'ContainerInherit, ObjectInherit',
    },
    {
      path: path.win32.join(runtimeDir, 'caddy-data'),
      sid: LOCAL_SERVICE_SID,
      rights: 'Modify',
      inheritance: 'ContainerInherit, ObjectInherit',
    },
    {
      path: path.win32.normalize(executable),
      sid: LOCAL_SERVICE_SID,
      rights: 'ReadAndExecute',
      inheritance: 'None',
    },
  ];
}

function powershell(script, payload) {
  const preamble = `$ErrorActionPreference = 'Stop'\n[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)\n`;
  const data = payload
    ? `$p = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(JSON.stringify(payload)).toString('base64')}')) | ConvertFrom-Json\n`
    : '';
  return run([
    'powershell.exe',
    '-NoProfile',
    '-NonInteractive',
    '-EncodedCommand',
    Buffer.from(preamble + data + script, 'utf16le').toString('base64'),
  ]);
}

function aclSnapshot(rule) {
  const script = `$acl = Get-Acl -LiteralPath $p.path\n$before = $acl.GetSecurityDescriptorSddlForm([Security.AccessControl.AccessControlSections]::Access)\n$sid = New-Object Security.Principal.SecurityIdentifier($p.sid)\n$rule = New-Object Security.AccessControl.FileSystemAccessRule($sid, [Security.AccessControl.FileSystemRights]$p.rights, [Security.AccessControl.InheritanceFlags]$p.inheritance, [Security.AccessControl.PropagationFlags]::None, [Security.AccessControl.AccessControlType]::Allow)\n$acl.AddAccessRule($rule)\n[PSCustomObject]@{ before = $before; after = $acl.GetSecurityDescriptorSddlForm([Security.AccessControl.AccessControlSections]::Access) } | ConvertTo-Json -Compress`;
  return { ...rule, ...JSON.parse(powershell(script, rule).stdout.trim()) };
}

function changeAcl(entry, reverse = false) {
  const script = `$acl = Get-Acl -LiteralPath $p.path\n$current = $acl.GetSecurityDescriptorSddlForm([Security.AccessControl.AccessControlSections]::Access)\nif ($current -eq $p.desired) { exit 0 }\nif ($current -ne $p.expected) { throw ('ACL changed since registration: ' + $p.path + '. Existing permissions were preserved.') }\n$acl.SetSecurityDescriptorSddlForm($p.desired, [Security.AccessControl.AccessControlSections]::Access)\nSet-Acl -LiteralPath $p.path -AclObject $acl`;
  powershell(script, {
    path: entry.path,
    expected: reverse ? entry.after : entry.before,
    desired: reverse ? entry.before : entry.after,
  });
}

async function saveRegistration(plan, record, flag = 'w') {
  await writeFile(plan.markerPath, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600, flag });
}

async function grantWindowsAccess(plan, record) {
  await mkdir(path.join(plan.runtimeDir, 'caddy-data'), { recursive: true });
  record.acl ??= [];
  for (const rule of plan.accessRules) {
    const metadata = await lstat(rule.path);
    if (metadata.isSymbolicLink())
      throw new Error(`Service ACL targets must not be symbolic links: ${rule.path}`);
    let entry = record.acl.find((candidate) => candidate.path === rule.path);
    if (!entry) {
      entry = aclSnapshot(rule);
      record.acl.push(entry);
      // Persist the original DACL before applying any change, including interrupted installs.
      await saveRegistration(plan, record);
    }
    changeAcl(entry);
  }
}

async function restoreWindowsAccess(plan, registration) {
  for (const entry of [...(registration.acl ?? [])].reverse()) {
    const permitted = plan.accessRules.find((rule) => rule.path === entry.path);
    if (!permitted || ['sid', 'rights', 'inheritance'].some((key) => permitted[key] !== entry[key]))
      throw new Error('Service ACL ownership mismatch. No unrelated permission was changed.');
    if ((await lstat(entry.path)).isSymbolicLink())
      throw new Error(`Refusing to restore ACL through a symbolic link: ${entry.path}`);
    changeAcl(entry, true);
  }
}

function resolveAccount({ platform, scope, user, action, registration }) {
  if (platform === 'win32') return validateServiceUser(user, platform);
  const selected = validateServiceUser(
    user ??
      registration?.account ??
      (scope === 'system'
        ? process.getuid?.() === 0
          ? process.env.SUDO_USER
          : undefined
        : userInfo().username),
    platform,
  );
  if (scope === 'user' && (process.getuid?.() === 0 || selected !== userInfo().username))
    throw new Error(
      'Install a user service from that non-root user’s login session, without sudo.',
    );
  if (action === 'install') {
    const uid = Number(run(['id', '-u', selected]).stdout.trim());
    if (!Number.isSafeInteger(uid) || uid <= 0)
      throw new Error('The service account must exist and have a non-zero UID.');
  }
  return selected;
}

async function unixAccessPreflight(plan) {
  const config = JSON.parse(await readFile(plan.configPath, 'utf8'));
  const roots = new Set();
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.handler === 'vars' && typeof value.root === 'string') roots.add(value.root);
    for (const child of Object.values(value)) visit(child);
  }
  visit(config.apps.http);
  const dataDir = path.join(plan.runtimeDir, 'caddy-data');
  await mkdir(dataDir, { recursive: true });
  const prefix =
    plan.scope === 'system'
      ? plan.platform === 'linux'
        ? ['runuser', '-u', plan.account, '--']
        : ['sudo', '-n', '-u', plan.account, '--']
      : [];
  // All paths are positional arguments, never interpolated into shell source.
  const probe =
    'set -eu\ntest -x "$1"\ntest -r "$2"\ncd "$3"\nprobe=$(mktemp "$4/.service-access.XXXXXX")\nrm -f "$probe"\nshift 4\nfor root do test -r "$root/index.html"; done';
  try {
    run([
      ...prefix,
      '/bin/sh',
      '-c',
      probe,
      'service-access',
      plan.executable,
      plan.configPath,
      plan.runtimeDir,
      dataDir,
      ...roots,
    ]);
    run([...prefix, plan.executable, 'validate', '--config', plan.configPath]);
  } catch (error) {
    throw new Error(
      `Service account ${plan.account} cannot access the deployment. It needs executable/config/release read access and write access only to ${dataDir}. Prepare those permissions and retry. ${error.message}`,
    );
  }
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function regularFile(file, optional = false) {
  try {
    const metadata = await lstat(file);
    if (!metadata.isFile() || metadata.isSymbolicLink())
      throw new Error(`Expected a regular file, refusing to follow links: ${file}`);
    return true;
  } catch (error) {
    if (optional && error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function isInstalled(runtimeDir) {
  const file = path.join(runtimeDir, MARKER);
  if (!(await regularFile(file, true))) return null;
  const registration = JSON.parse(await readFile(file, 'utf8'));
  if (registration.owner !== OWNER) throw new Error(`Unrecognized service registration: ${file}`);
  return registration;
}

function run(command, acceptable = [0]) {
  const result = spawnSync(command[0], command.slice(1), {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 30_000,
    shell: false,
  });
  if (result.error) throw result.error;
  if (!acceptable.includes(result.status))
    throw new Error(
      `${command[0]} ${command[1]} failed (${result.status}): ${result.stderr || result.stdout}`,
    );
  return result;
}

async function assertRegistration(plan, registration) {
  for (const key of [
    'owner',
    'platform',
    'scope',
    'serviceName',
    'configPath',
    'runtimeDir',
    'executable',
    'account',
    'definitionPath',
  ]) {
    if (registration[key] !== plan[key])
      throw new Error(
        `Service ownership mismatch for ${key}. Use the original deployment configuration.`,
      );
  }
  if (registration.definitionHash !== digest(plan.definition))
    throw new Error('Service definition differs from the registered configuration.');
  if (plan.definitionPath) {
    if (!(await regularFile(plan.definitionPath, registration.status === 'installing'))) return;
    if ((await readFile(plan.definitionPath, 'utf8')) !== plan.definition)
      throw new Error(
        'The installed service definition was modified. Refusing to overwrite or remove it.',
      );
  }
}

function windowsRegistration(plan) {
  const query = run(['sc.exe', 'qc', plan.serviceName], [0, 1060]);
  if (query.status === 1060) return false;
  // reg.exe uses the active code page, which corrupts Chinese paths when decoded
  // as UTF-8. Read the registry as JSON with an explicit UTF-8 console instead.
  const script = `[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)\nGet-ItemProperty -LiteralPath 'Registry::HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\${plan.serviceName}' -ErrorAction Stop | Select-Object ImagePath, ObjectName | ConvertTo-Json -Compress`;
  const registry = run([
    'powershell.exe',
    '-NoProfile',
    '-NonInteractive',
    '-EncodedCommand',
    Buffer.from(script, 'utf16le').toString('base64'),
  ]);
  const registered = JSON.parse(registry.stdout.trim());
  if (
    registered.ImagePath !== plan.definition ||
    registered.ObjectName?.toLowerCase() !== LOCAL_SERVICE.toLowerCase()
  )
    throw new Error(
      'An existing Windows service has a different executable or configuration. Refusing to modify it.',
    );
  return true;
}

function unixRegistration(plan, registration) {
  if (plan.platform === 'linux') {
    const prefix = plan.scope === 'user' ? ['systemctl', '--user'] : ['systemctl'];
    const fragment = run([
      ...prefix,
      'show',
      `${plan.serviceName}.service`,
      '--property=FragmentPath',
      '--value',
    ]).stdout.trim();
    if (fragment && (!registration || fragment !== plan.definitionPath))
      throw new Error('An existing systemd service is not owned by this deployment.');
  } else if (plan.platform === 'darwin') {
    const loaded = run(['launchctl', 'print', `${plan.domain}/${plan.label}`], [0, 113]);
    if (loaded.status === 0) {
      const source = loaded.stdout.match(/^\s*path = (.+)$/mu)?.[1].trim();
      if (!registration || source !== plan.definitionPath)
        throw new Error('An existing launchd job is not owned by this deployment.');
      return true;
    }
  }
  return false;
}

/** Explicit installation only. Never called by setup, deployment, or normal start. */
export async function service({
  action,
  configPath,
  runtimeDir,
  executable,
  serviceName = 'qcopilots-website',
  dryRun = false,
  scope = process.platform === 'win32' ? 'system' : 'user',
  user,
}) {
  if (!['install', 'uninstall'].includes(action))
    throw new Error('Service action must be install or uninstall.');
  const registration = await isInstalled(runtimeDir);
  const account = resolveAccount({ platform: process.platform, scope, user, action, registration });
  const plan = createServicePlan({
    configPath,
    runtimeDir,
    executable,
    serviceName,
    scope,
    user: account,
  });
  if (registration) await assertRegistration(plan, registration);
  if (action === 'uninstall' && !registration)
    throw new Error('No service owned by this deployment is registered. Nothing was removed.');
  if (action === 'install') {
    await regularFile(configPath);
    await regularFile(executable);
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    if (!config.apps?.http?.servers || Object.keys(config.apps.http.servers).length === 0)
      throw new Error('Deploy the site before installing its service.');
    if (
      process.platform === 'linux' &&
      scope === 'user' &&
      Object.values(config.apps.http.servers).some((server) =>
        server.listen?.some((address) => /:(?:80|443)$/u.test(address)),
      )
    )
      throw new Error(
        'Public HTTP/HTTPS ports need Linux system scope with a non-root --user, or an administrator-managed reverse proxy on high ports.',
      );
    if (!registration && plan.definitionPath && (await regularFile(plan.definitionPath, true)))
      throw new Error(
        'A service definition already exists without this deployment ownership record.',
      );
  }
  if (dryRun)
    return {
      ...plan,
      action,
      dryRun: true,
      installed: Boolean(registration),
      startsImmediately: false,
    };

  const windowsExists = plan.platform === 'win32' ? windowsRegistration(plan) : false;
  if (windowsExists && !registration)
    throw new Error('An existing Windows service is not owned by this deployment.');
  const launchdLoaded = plan.platform !== 'win32' ? unixRegistration(plan, registration) : false;
  if (action === 'install') {
    if (plan.platform !== 'win32') await unixAccessPreflight(plan);
    else run([executable, 'validate', '--config', configPath]);
    await mkdir(runtimeDir, { recursive: true });
    const record = {
      ...plan,
      acl: registration?.acl,
      definitionHash: digest(plan.definition),
      status: 'installing',
    };
    // Save recovery information before changing the system service manager.
    await writeFile(plan.markerPath, `${JSON.stringify(record, null, 2)}\n`, {
      mode: 0o600,
      flag: registration ? 'w' : 'wx',
    });
    if (plan.platform === 'win32') await grantWindowsAccess(plan, record);
    if (plan.definitionPath && !(await regularFile(plan.definitionPath, true))) {
      await mkdir(path.dirname(plan.definitionPath), { recursive: true });
      await writeFile(plan.definitionPath, plan.definition, { mode: 0o644, flag: 'wx' });
    }
    for (const command of plan.installCommands) {
      if (!(plan.platform === 'win32' && windowsExists)) run(command);
    }
    record.status = 'installed';
    await writeFile(plan.markerPath, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    return { ...record, installed: true, startsImmediately: false };
  }

  if (plan.platform === 'win32' && windowsExists) {
    run(plan.stopCommands[0], [0, 1062]);
    run(plan.removeCommands[0]);
  } else if (plan.platform === 'darwin') {
    if (launchdLoaded) run(plan.stopCommands[0]);
    for (const command of plan.removeCommands) run(command);
  } else if (plan.platform === 'linux' && (await regularFile(plan.definitionPath, true))) {
    for (const command of plan.removeCommands) run(command);
  }
  if (plan.definitionPath && (await regularFile(plan.definitionPath, true))) {
    // The exact regular file and contents were verified above. Never delete directories.
    await unlink(plan.definitionPath);
    for (const command of plan.afterRemoveCommands ?? []) run(command);
  }
  if (plan.platform === 'win32') await restoreWindowsAccess(plan, registration);
  await unlink(plan.markerPath);
  return { ...plan, installed: false, removed: true };
}
