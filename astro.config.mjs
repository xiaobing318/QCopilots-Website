import { defineConfig } from 'astro/config';
import { basePath, siteUrl } from './src/lib/site.mjs';

export default defineConfig({
  site: siteUrl,
  base: basePath,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  server: { host: '127.0.0.1', port: 4321 },
  vite: { build: { assetsInlineLimit: 0 } },
});
