import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const toolchain = JSON.parse(
  await readFile(path.join(root, 'config/toolchain.json'), 'utf8'),
);
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}
export async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}
export async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, file);
}
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      stdio: 'inherit',
      ...options,
    });
    let output = '';
    child.stdout?.on('data', (data) => {
      output += data;
    });
    child.stderr?.on('data', (data) => {
      output += data;
    });
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0
        ? resolve(output.trim())
        : reject(new Error(`${command} exited ${code ?? signal}${output ? `\n${output}` : ''}`)),
    );
  });
}
export function within(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return (
    relative !== '' &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== '..' &&
    !path.isAbsolute(relative)
  );
}
export async function sha256(file) {
  return createHash('sha256')
    .update(await readFile(file))
    .digest('hex');
}
export function optionsFrom(args) {
  const options = {};
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (['dry-run', 'json', 'help'].includes(key)) options[key] = true;
    else {
      if (!args[index + 1] || args[index + 1].startsWith('--'))
        throw new Error(`Missing value for ${arg}`);
      options[key] = args[++index];
    }
  }
  return { options, positional };
}
