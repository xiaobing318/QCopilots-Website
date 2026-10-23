import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from 'parse5';
import { products } from '../src/content/products.ts';
import { basePath, route, canonicalUrl, siteUrl } from '../src/lib/site.mjs';

const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const documents = new Map();
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.push(file);
  }
}
await walk(root);
const attrs = (node) =>
  Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
function flatten(node) {
  return [node, ...(node.childNodes || []).flatMap(flatten)];
}
for (const file of files.filter((file) => file.endsWith('.html'))) {
  const source = await readFile(file, 'utf8');
  const nodes = flatten(parse(source));
  const ids = nodes.map((node) => attrs(node).id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `Duplicate id in ${file}`);
  documents.set(file, { nodes, ids, source });
}
async function checkReference(value, from, checkFragment = true) {
  if (!value || /^(https?:|mailto:|tel:|data:)/.test(value)) return;
  assert(!/^(javascript:|file:|[a-zA-Z]:\\)/.test(value), `Unsafe/local reference ${value}`);
  const relative = path.relative(root, from).split(path.sep).join('/');
  const context = `http://build.test${basePath}${relative}`;
  const url = new URL(value, context);
  assert.equal(url.origin, 'http://build.test', `Unexpected external protocol: ${value}`);
  assert(url.pathname.startsWith(basePath), `Reference escapes BASE_PATH: ${value} in ${relative}`);
  const filepath = path.resolve(
    root,
    decodeURIComponent(url.pathname.slice(basePath.length)) || '.',
  );
  assert(
    filepath === root || filepath.startsWith(root + path.sep),
    `Reference escapes output: ${value}`,
  );
  const info = await stat(filepath).catch(() => null);
  assert(info, `Missing resource ${value} in ${relative}`);
  const target = info.isDirectory() ? path.join(filepath, 'index.html') : filepath;
  await stat(target);
  if (url.hash && checkFragment) {
    const doc = documents.get(target);
    if (doc)
      assert(
        doc.ids.includes(decodeURIComponent(url.hash.slice(1))),
        `Missing anchor ${value} in ${relative}`,
      );
  }
}
for (const [file, doc] of documents) {
  for (const node of doc.nodes) {
    const a = attrs(node);
    if (node.tagName === 'img') {
      assert('alt' in a, `Missing alt in ${file}`);
      assert(a.width && a.height, `Image dimensions missing in ${file}`);
    }
    if (node.tagName === 'script' && a.type === 'application/ld+json')
      JSON.parse(node.childNodes.map((child) => child.value || '').join(''));
    for (const attr of ['href', 'src']) if (a[attr]) await checkReference(a[attr], file);
    if (a.srcset)
      for (const source of a.srcset.split(','))
        await checkReference(source.trim().split(/\s+/)[0], file, false);
  }
  assert(!/[A-Z]:[\\/]Dev[\\/]/.test(doc.source), `Local development path leaked into ${file}`);
}
for (const css of files.filter((file) => file.endsWith('.css'))) {
  const text = await readFile(css, 'utf8');
  for (const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g))
    await checkReference(match[1], css, false);
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const locale of ['zh', 'en']) {
  for (const slug of ['', ...products.map((product) => `products/${product.id}`)]) {
    const urlPath = route(locale, slug);
    const file = path.join(root, urlPath.slice(basePath.length), 'index.html');
    const doc = documents.get(file);
    assert(doc, `Missing route ${urlPath}`);
    const find = (tag) => doc.nodes.filter((node) => node.tagName === tag);
    assert.equal(find('h1').length, 1, `Expected one h1 in ${urlPath}`);
    assert.equal(attrs(find('html')[0]).lang, locale === 'zh' ? 'zh-CN' : 'en');
    assert(find('title').length === 1, `Missing title in ${urlPath}`);
    assert(
      find('meta').some(
        (node) => attrs(node).name === 'description' && attrs(node).content?.length > 20,
      ),
      `Missing description ${urlPath}`,
    );
    const canonical = find('link').find((node) => attrs(node).rel === 'canonical');
    assert.equal(attrs(canonical).href, canonicalUrl(urlPath, siteUrl));
    for (const language of ['zh-CN', 'en', 'x-default'])
      assert(
        find('link').some((node) => attrs(node).hreflang === language),
        `Missing hreflang ${language}`,
      );
    assert(sitemap.includes(canonicalUrl(urlPath, siteUrl)), `Sitemap missing ${urlPath}`);
    if (slug) {
      const product = products.find((item) => slug === `products/${item.id}`);
      for (const entry of product.downloads) {
        if (entry.url)
          assert(
            find('a').some(
              (node) =>
                attrs(node)['data-testid'] === 'download-link' && attrs(node).href === entry.url,
            ),
            `Missing download ${entry.id}`,
          );
      }
      assert.equal(
        find('button').filter(
          (node) =>
            attrs(node)['data-testid'] === 'download-unavailable' && 'disabled' in attrs(node),
        ).length,
        product.downloads.filter((entry) => entry.url === null).length,
        `Incorrect unavailable download state ${slug}`,
      );
    }
  }
}
assert(documents.has(path.join(root, '404.html')), 'Missing 404 page');
console.log(
  `Verified ${documents.size} HTML documents, all local resources, anchors, bilingual SEO and download states at ${basePath}`,
);
