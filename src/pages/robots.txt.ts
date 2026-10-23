import type { APIRoute } from 'astro';
import { asset, siteUrl, canonicalUrl } from '../lib/site.mjs';
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nSitemap: ${canonicalUrl(asset('/sitemap.xml'), siteUrl)}\n`,
    { headers: { 'Content-Type': 'text/plain' } },
  );
