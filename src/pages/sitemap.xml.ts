import type { APIRoute } from 'astro';
import { products } from '../content/products';
import { route, siteUrl, canonicalUrl } from '../lib/site.mjs';
export const GET: APIRoute = () => {
  const paths = ['zh', 'en'].flatMap((locale) => [
    route(locale),
    ...products.map((product) => route(locale, `products/${product.id}`)),
  ]);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${canonicalUrl(path, siteUrl)}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
