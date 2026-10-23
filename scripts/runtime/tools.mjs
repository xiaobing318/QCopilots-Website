import { mkdir, chmod, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { root, toolchain, exists, run, sha256, within } from './common.mjs';

export async function ensureCaddy() {
  const key = `caddy-${process.platform}-${process.arch}`;
  const url = toolchain[`${key}-url`];
  const expected = toolchain[`${key}-sha256`];
  if (!url || !expected)
    throw new Error(
      `No verified Caddy archive for ${process.platform}/${process.arch}. Supported: Windows, Linux, macOS on x64 and arm64.`,
    );
  const directory = path.join(root, '.tools', `${key}-${toolchain.caddyVersion}`);
  const executable = path.join(directory, process.platform === 'win32' ? 'caddy.exe' : 'caddy');
  if (await exists(executable)) return executable;
  const tools = path.join(root, '.tools');
  await mkdir(tools, { recursive: true });
  const temporary = path.join(tools, `caddy-download-${randomUUID()}`);
  await mkdir(temporary);
  const archive = path.join(temporary, url.endsWith('.zip') ? 'caddy.zip' : 'caddy.tar.gz');
  try {
    console.log(
      `Downloading Caddy ${toolchain.caddyVersion} (${process.platform}/${process.arch})...`,
    );
    if (process.platform === 'win32') {
      await run(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $r=@{Uri=$env:QC_DOWNLOAD_URL;OutFile=$env:QC_DOWNLOAD_FILE;UseBasicParsing=$true}; if($env:HTTPS_PROXY){$r.Proxy=$env:HTTPS_PROXY} elseif($env:HTTP_PROXY){$r.Proxy=$env:HTTP_PROXY}; Invoke-WebRequest @r",
        ],
        { env: { ...process.env, QC_DOWNLOAD_URL: url, QC_DOWNLOAD_FILE: archive } },
      );
    } else
      await run('curl', [
        '--fail',
        '--location',
        '--retry',
        '3',
        '--connect-timeout',
        '20',
        url,
        '-o',
        archive,
      ]);
    if ((await sha256(archive)) !== expected)
      throw new Error('Caddy archive checksum mismatch. The download was rejected.');
    const extracted = path.join(temporary, 'extracted');
    await mkdir(extracted);
    if (process.platform === 'win32') {
      await run(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory($env:QC_ARCHIVE, $env:QC_EXTRACT)",
        ],
        { env: { ...process.env, QC_ARCHIVE: archive, QC_EXTRACT: extracted } },
      );
    } else await run('tar', ['-xzf', archive, '-C', extracted]);
    const extractedExe = path.join(extracted, process.platform === 'win32' ? 'caddy.exe' : 'caddy');
    if (!(await exists(extractedExe)))
      throw new Error('Official Caddy archive did not contain the expected executable.');
    await chmod(extractedExe, 0o755);
    await rename(extracted, directory);
    return executable;
  } finally {
    if (!within(tools, temporary)) throw new Error('Unsafe cleanup path refused.');
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function npmCommand(args) {
  const bin = path.dirname(process.execPath);
  const candidates = [
    path.join(bin, 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(bin, '../lib/node_modules/npm/bin/npm-cli.js'),
    process.env.npm_execpath,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ''}` };
      const version = await run(process.execPath, [candidate, '--version'], { env, stdio: 'pipe' });
      if (version !== toolchain.npmVersion) continue;
      return run(process.execPath, [candidate, ...args], { env });
    }
  }
  throw new Error(
    `npm ${toolchain.npmVersion} is required. Run scripts/site.ps1 or bash scripts/site.sh to use the complete pinned runtime.`,
  );
}
