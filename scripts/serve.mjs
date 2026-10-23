import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeBase } from '../src/lib/site.mjs';

const args = process.argv.slice(2);
const value = (key, fallback) => (args.includes(key) ? args[args.indexOf(key) + 1] : fallback);
const root = path.resolve(value('--source', fileURLToPath(new URL('../dist', import.meta.url))));
const base = normalizeBase(process.env.BASE_PATH || '/');
const port = Number(value('--port', process.env.PORT || '4322'));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    if (base !== '/' && url.pathname === base.slice(0, -1)) {
      response.writeHead(308, { Location: base });
      response.end();
      return;
    }
    if (!url.pathname.startsWith(base)) throw new Error('Outside base');
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    const filename = path.resolve(root, relative || '.');
    if (filename !== root && !filename.startsWith(root + path.sep)) throw new Error('Outside root');
    let target = filename;
    const info = await stat(target);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        response.writeHead(308, { Location: url.pathname + '/' + url.search });
        response.end();
        return;
      }
      target = path.join(target, 'index.html');
    }
    const data = await readFile(target);
    response.writeHead(200, {
      'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch {
    response.writeHead(404, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    response.end(await readFile(path.join(root, '404.html')).catch(() => Buffer.from('Not found')));
  }
});
server.listen(port, '127.0.0.1', () =>
  console.log(`Static test server: http://127.0.0.1:${port}${base}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  });
