#!/usr/bin/env node
import path from 'node:path';
import { root, toolchain, optionsFrom, exists, readJson, run } from './runtime/common.mjs';
import { loadConfig } from './runtime/config.mjs';
import { npmCommand, ensureCaddy } from './runtime/tools.mjs';
import {
  deployNative,
  startNative,
  stopNative,
  statusNative,
  rollbackNative,
  portAvailable,
} from './runtime/native.mjs';

const help = `QCopilots Website\n\n  setup | doctor | dev | check | build | package\n  deploy native|compose [--config config/deploy.json]\n  start|stop|status|rollback [--target native|compose] [--config path]\n  service install|uninstall [--dry-run] [--scope user|system] [--user NAME]\n\nNative overrides: --source dist --runtime-dir path --host 127.0.0.1\n                  --port 8080 --admin-port 20199 --base-path /\n\nUse scripts/site.ps1 or bash scripts/site.sh to bootstrap pinned Node.js.\nNative deploy uses the existing build. Run build first.\nService scope defaults to user on Linux/macOS and system on Windows.\n`;

async function main() {
  const args = process.argv.slice(2);
  const first = args[0] ?? 'help';
  if (['setup', 'dev', 'check', 'build', 'package'].includes(first)) {
    if (process.versions.node !== toolchain.nodeVersion)
      throw new Error(
        `Node ${toolchain.nodeVersion} is required. Use scripts/site.ps1 or bash scripts/site.sh.`,
      );
    if (first === 'package')
      await run(process.execPath, [path.join(root, 'scripts/package.mjs'), ...args.slice(1)]);
    else
      await npmCommand(
        first === 'setup'
          ? ['ci', ...args.slice(1)]
          : ['run', first, ...(args.length > 1 ? ['--', ...args.slice(1)] : [])],
      );
    return;
  }
  const { positional, options } = optionsFrom(args);
  if (options.target && !['native', 'compose'].includes(options.target))
    throw new Error('--target must be native or compose.');
  const [command = 'help', subcommand] = positional;
  if (command === 'deploy' && options.target)
    throw new Error(
      'Select deploy native or deploy compose. --target is only for start, stop, status and rollback.',
    );
  if (command === 'help' || options.help) {
    console.log(help);
    return;
  }
  if (process.versions.node !== toolchain.nodeVersion)
    throw new Error(
      `Node ${toolchain.nodeVersion} is required (running ${process.versions.node}). Use scripts/site.ps1 or bash scripts/site.sh.`,
    );
  if ((command === 'deploy' && subcommand === 'compose') || options.target === 'compose') {
    const delegated = args.slice(command === 'deploy' ? 2 : 1);
    const flag = delegated.indexOf('--target');
    if (flag !== -1) delegated.splice(flag, 2);
    await run(process.execPath, [path.join(root, 'scripts/compose.mjs'), command, ...delegated]);
    return;
  }
  const config = await loadConfig(options);
  if (command === 'doctor') {
    const status = await statusNative(config);
    console.log(
      JSON.stringify(
        {
          node: process.version,
          expectedNpm: toolchain.npmVersion,
          platform: process.platform,
          architecture: process.arch,
          root,
          lockfile: await exists(path.join(root, 'package-lock.json')),
          dependencies: await exists(path.join(root, 'node_modules')),
          staticArtifact: await exists(path.join(config.sourceDir, 'index.html')),
          config,
          deployment: status,
          ports: {
            siteAvailable: await portAvailable(config.host, config.port),
            adminAvailable: await portAvailable('127.0.0.1', config.adminPort),
          },
          network:
            'First setup needs access to nodejs.org and registry.npmjs.org. First native deploy needs github.com. HTTP_PROXY / HTTPS_PROXY are supported by bootstrap downloads.',
        },
        null,
        2,
      ),
    );
    return;
  }
  if (command === 'service') {
    if (!['install', 'uninstall'].includes(subcommand))
      throw new Error('Use service install or service uninstall.');
    const state = await readJson(path.join(config.runtimeDir, 'state.json'), null);
    if (!state?.current) throw new Error('Deploy a release before registering its OS service.');
    if (
      subcommand === 'install' &&
      !options['dry-run'] &&
      (await statusNative(config)).status === 'running'
    )
      throw new Error(
        'Run stop before service install, then use the returned OS service start command.',
      );
    const { service } = await import('./runtime/service.mjs');
    console.log(
      JSON.stringify(
        await service({
          action: subcommand,
          configPath: path.join(config.runtimeDir, 'current.json'),
          runtimeDir: config.runtimeDir,
          executable: await ensureCaddy(),
          serviceName: state.config.serviceName,
          dryRun: options['dry-run'] ?? false,
          scope: options.scope ?? (process.platform === 'win32' ? 'system' : 'user'),
          user: options.user,
        }),
        null,
        2,
      ),
    );
    return;
  }
  const actions = {
    start: startNative,
    stop: stopNative,
    status: statusNative,
    rollback: rollbackNative,
  };
  if (command === 'deploy' && subcommand === 'native')
    console.log(JSON.stringify(await deployNative(config), null, 2));
  else if (actions[command]) console.log(JSON.stringify(await actions[command](config), null, 2));
  else throw new Error(`Unknown command: ${positional.join(' ')}\n${help}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
