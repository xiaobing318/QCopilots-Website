import type { APIRoute } from 'astro';
import { execFileSync } from 'node:child_process';
import { basePath } from '../lib/site.mjs';
let buildId = process.env.GITHUB_SHA || process.env.BUILD_ID || 'local';
if (buildId === 'local') {
  try {
    buildId = execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    /* Source archives need no Git installation. */
  }
}
export const GET: APIRoute = () =>
  new Response(JSON.stringify({ buildId, basePath }), {
    headers: { 'Content-Type': 'application/json' },
  });
