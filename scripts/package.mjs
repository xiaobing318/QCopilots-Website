import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as tar from 'tar';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const options = { source: 'dist', out: 'artifacts' };
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace(/^--/, '');
  if (!(key in options) || !args[i + 1] || args[i + 1].startsWith('--')) {
    throw new Error('Usage: package [--source dist] [--out artifacts]');
  }
  options[key] = args[i + 1];
}

const source = path.resolve(root, options.source);
const out = path.resolve(root, options.out);
if (out === source || out.startsWith(`${source}${path.sep}`)) {
  throw new Error('Package output must be outside the static source directory.');
}
const files = [];
async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks cannot be packaged: ${name}`);
    if (entry.isDirectory()) await collect(path.join(directory, entry.name), name);
    else if (entry.isFile()) files.push(name);
    else throw new Error(`Unsupported file: ${name}`);
  }
}
await collect(source);
files.sort();
if (!files.includes('index.html') || !files.includes('404.html')) {
  throw new Error('Build the complete static website before packaging.');
}
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
let commit = 'uncommitted';
let dirty = null;
try {
  commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  dirty = Boolean(
    execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim(),
  );
} catch {
  // A source archive can be built on a machine without Git.
}
let build = null;
try {
  build = JSON.parse(await readFile(path.join(source, 'build-info.json'), 'utf8'));
} catch {
  throw new Error('build-info.json is missing or invalid. Run the production build first.');
}
const name = `qcopilots-website-${manifest.version}-${commit.slice(0, 12)}`;
await mkdir(out, { recursive: true });
const archive = path.join(out, `${name}.tar.gz`);
await tar.c(
  {
    cwd: source,
    file: archive,
    gzip: true,
    portable: true,
    noMtime: true,
    follow: false,
  },
  files,
);
const entries = [];
await tar.t({ file: archive, onReadEntry: (entry) => entries.push(entry.path) });
if (entries.length !== files.length || entries.some((entry, index) => entry !== files[index])) {
  throw new Error('Archive verification failed.');
}
const digest = createHash('sha256')
  .update(await readFile(archive))
  .digest('hex');
const metadata = {
  name: manifest.name,
  version: manifest.version,
  commit,
  dirty,
  build,
  archive: path.basename(archive),
  sha256: digest,
  bytes: (await stat(archive)).size,
  files: files.length,
};
await writeFile(`${archive}.sha256`, `${digest}  ${path.basename(archive)}\n`);
await writeFile(path.join(out, `${name}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata, null, 2));
