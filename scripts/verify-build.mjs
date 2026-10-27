import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from 'parse5';
import { products } from '../src/content/products.ts';
import { asset, basePath, route, canonicalUrl, siteUrl } from '../src/lib/site.mjs';

const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const locales = /** @type {const} */ (['zh', 'en']);
const htmlLang = (locale) => (locale === 'zh' ? 'zh-CN' : 'en');
const siteRoot = canonicalUrl(basePath, siteUrl);
const han = /\p{Script=Han}/u;
const focusable = (node, a) =>
  (node.tagName === 'a' && 'href' in a) ||
  ['button', 'input', 'select', 'textarea'].includes(node.tagName) ||
  'tabindex' in a ||
  'contenteditable' in a;

// The only external addresses a page may link to are the ones declared in product content.
const declaredExternal = new Set(
  products.flatMap((product) => [
    ...product.downloads.map((entry) => entry.url).filter(Boolean),
    ...Object.values(product.links ?? {}),
  ]),
);
for (const url of declaredExternal)
  assert.equal(new URL(url).protocol, 'https:', `Declared link must use HTTPS: ${url}`);

const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.push(file);
  }
}
await walk(root);
const relativeTo = (file) => path.relative(root, file).split(path.sep).join('/');

const attrs = (node) =>
  Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
function flatten(node) {
  return [node, ...(node.childNodes || []).flatMap(flatten)];
}
const textOf = (node) =>
  flatten(node)
    .filter((child) => child.nodeName === '#text')
    .map((child) => child.value)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
const byId = (nodes, id) => nodes.find((node) => attrs(node).id === id);

const documents = new Map();
for (const file of files.filter((file) => file.endsWith('.html'))) {
  const source = await readFile(file, 'utf8');
  const tree = parse(source);
  const nodes = flatten(tree);
  const ids = nodes.map((node) => attrs(node).id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `Duplicate id in ${relativeTo(file)}`);
  documents.set(file, { tree, nodes, ids, source });
}
const documentFor = (urlPath) => {
  assert(urlPath.startsWith(basePath), `${urlPath} is outside ${basePath}`);
  const file = path.join(root, urlPath.slice(basePath.length), 'index.html');
  const doc = documents.get(file);
  assert(doc, `Missing route ${urlPath}`);
  return doc;
};

/** Resolves a site-relative reference to a built file, and its #fragment to an element. */
async function checkLocal(value, from, checkFragment = true) {
  const relative = relativeTo(from);
  const url = new URL(value, `http://build.test${basePath}${relative}`);
  assert.equal(url.origin, 'http://build.test', `Unexpected external reference ${value}`);
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
  assert(await stat(target).catch(() => null), `Missing resource ${value} in ${relative}`);
  if (url.hash && checkFragment) {
    const doc = documents.get(target);
    if (doc)
      assert(
        doc.ids.includes(decodeURIComponent(url.hash.slice(1))),
        `Missing anchor ${value} in ${relative}`,
      );
  }
}

/** href/src values: local files, declared product links, or this site's own canonical URLs. */
async function checkReference(value, node, from) {
  const relative = relativeTo(from);
  assert(!/^\s*(javascript:|file:|[a-zA-Z]:\\)/i.test(value), `Unsafe reference ${value}`);
  if (/^(mailto:|tel:)/.test(value)) return;
  if (/^data:/.test(value)) {
    assert(node.tagName === 'img', `data: URL outside an image in ${relative}`);
    return;
  }
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value)) {
    const a = attrs(node);
    const selfLink =
      node.tagName === 'link' && ['canonical', 'alternate'].includes(a.rel) && a.href === value;
    if (selfLink) {
      assert(value.startsWith(siteRoot), `${a.rel} ${value} is not under ${siteRoot}`);
      await checkLocal(new URL(value).pathname, from, false);
      return;
    }
    assert(
      declaredExternal.has(value),
      `External reference ${value} in ${relative} is not declared in product content`,
    );
    return;
  }
  await checkLocal(value, from);
}

for (const [file, doc] of documents) {
  const relative = relativeTo(file);
  for (const node of doc.nodes) {
    const a = attrs(node);
    if (node.tagName === 'img') {
      assert('alt' in a, `Missing alt in ${relative}`);
      assert(a.width && a.height, `Image dimensions missing in ${relative}`);
    }
    if (node.tagName === 'a')
      assert(!['', '#'].includes(a.href ?? '#x'), `Dead link (href="${a.href}") in ${relative}`);
    if (node.tagName === 'script' && a.type === 'application/ld+json')
      JSON.parse(node.childNodes.map((child) => child.value || '').join(''));
    for (const attr of ['href', 'src']) if (a[attr]) await checkReference(a[attr], node, file);
    if (a.srcset)
      for (const candidate of a.srcset.split(','))
        await checkLocal(candidate.trim().split(/\s+/)[0], file, false);
  }
  assert(!/[A-Z]:[\\/]Dev[\\/]/.test(doc.source), `Local development path leaked into ${relative}`);

  // Social previews use the rendered PNG cards, never removed artwork.
  const ogImage = doc.nodes.find(
    (node) => node.tagName === 'meta' && attrs(node).property === 'og:image',
  );
  if (ogImage) {
    const content = attrs(ogImage).content;
    const match = content.match(/\/images\/og-(zh|en)\.png$/);
    assert(
      match && content === canonicalUrl(asset(`/images/og-${match[1]}.png`), siteUrl),
      `og:image ${content} must be an og-{zh,en}.png card in ${relative}`,
    );
    await checkLocal(new URL(content).pathname, file, false);
  }
}

// Removed AI artwork must not come back through any page, style or script.
for (const file of files.filter((file) => /\.(html|css|js|json|xml|txt)$/.test(file))) {
  const text = await readFile(file, 'utf8');
  assert(
    !/images\/[^"'()\s]*\.webp/.test(text),
    `${relativeTo(file)} references a removed /images/*.webp`,
  );
}
assert(
  !files.some((file) => /[\\/]images[\\/].*\.webp$/.test(file)),
  'Removed /images/*.webp artwork is still published',
);
for (const locale of locales) {
  const png = await readFile(path.join(root, 'images', `og-${locale}.png`));
  assert.deepEqual(
    [png.readUInt32BE(16), png.readUInt32BE(20)],
    [1200, 630],
    `og-${locale}.png must be 1200×630`,
  );
}

// Styles: every url() resolves, and product looks come from data, not product-named selectors.
const productSelector = new RegExp(
  [
    String.raw`\.search-`,
    ...products.map(
      (product) => String.raw`(?<![\w-])${product.id.replace(/[-]/g, String.raw`\-`)}(?![\w-])`,
    ),
  ].join('|'),
);
const styleSheets = [];
for (const css of files.filter((file) => file.endsWith('.css'))) {
  const text = await readFile(css, 'utf8');
  for (const match of text.matchAll(/url\(["']?([^"')]+)["']?\)/g))
    await checkLocal(match[1], css, false);
  styleSheets.push([relativeTo(css), text]);
}
for (const [file, doc] of documents)
  for (const node of doc.nodes.filter((node) => node.tagName === 'style'))
    styleSheets.push([relativeTo(file), textOf(node)]);
for (const [name, text] of styleSheets) {
  const selectors = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, 'url()');
  const found = selectors.match(productSelector);
  assert(!found, `${name} styles a specific product (${found?.[0]}); use product data instead`);
}

// English pages: Chinese characters only inside elements marked lang="zh-*".
const skipText = new Set(['script', 'style', 'noscript', 'template']);
const checkedAttributes = ['alt', 'title', 'aria-label', 'placeholder'];
function findChinese(node, lang, problems, page) {
  const a = attrs(node);
  const current = a.lang ?? lang;
  const allowed = current.toLowerCase().startsWith('zh');
  if (!allowed && node.tagName) {
    const names = node.tagName === 'meta' ? [...checkedAttributes, 'content'] : checkedAttributes;
    for (const name of names)
      if (a[name] && han.test(a[name]))
        problems.push(`${page}: <${node.tagName} ${name}="${a[name]}">`);
  }
  if (node.nodeName === '#text' && !allowed && han.test(node.value))
    problems.push(`${page}: "${node.value.trim().slice(0, 60)}"`);
  if (skipText.has(node.tagName)) return;
  for (const child of node.childNodes || []) findChinese(child, current, problems, page);
}
const chinese = [];
const englishRoot = path.join(root, 'en') + path.sep;
for (const [file, doc] of documents)
  if (file.startsWith(englishRoot)) findChinese(doc.tree, 'en', chinese, relativeTo(file));
assert.deepEqual(chinese, [], 'English pages contain Chinese outside lang="zh-*" elements');

// Bilingual routes, metadata and the sitemap.
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
assert(robots.includes(`Sitemap: ${canonicalUrl(asset('/sitemap.xml'), siteUrl)}`));
const indexedSlugs = ['', ...products.map((product) => `products/${product.id}`)];
const meta = (doc, key, value) =>
  doc.nodes.find((node) => node.tagName === 'meta' && attrs(node)[key] === value);
function checkPageMetadata(doc, locale, slug, urlPath, { indexed }) {
  const find = (tag) => doc.nodes.filter((node) => node.tagName === tag);
  assert.equal(find('h1').length, 1, `Expected one h1 in ${urlPath}`);
  assert(textOf(find('h1')[0]), `Empty h1 in ${urlPath}`);
  assert.equal(attrs(find('html')[0]).lang, htmlLang(locale), `html lang in ${urlPath}`);
  assert.equal(find('title').length, 1, `Missing title in ${urlPath}`);
  assert(textOf(find('title')[0]), `Empty title in ${urlPath}`);
  assert(attrs(meta(doc, 'name', 'description') ?? {}).content?.trim(), `Description ${urlPath}`);
  const links = find('link').map(attrs);
  const canonical = canonicalUrl(route(locale, slug), siteUrl);
  assert.equal(links.find((link) => link.rel === 'canonical')?.href, canonical, urlPath);
  for (const [hreflang, target] of [
    ['zh-CN', 'zh'],
    ['en', 'en'],
    ['x-default', 'zh'],
  ])
    assert.equal(
      links.find((link) => link.rel === 'alternate' && link.hreflang === hreflang)?.href,
      canonicalUrl(route(target, slug), siteUrl),
      `hreflang ${hreflang} in ${urlPath}`,
    );
  assert.equal(attrs(meta(doc, 'property', 'og:url') ?? {}).content, canonical, urlPath);
  assert.equal(
    attrs(meta(doc, 'property', 'og:image') ?? {}).content,
    canonicalUrl(asset(`/images/og-${locale}.png`), siteUrl),
    `og:image in ${urlPath}`,
  );
  const robotsMeta = attrs(meta(doc, 'name', 'robots') ?? {}).content ?? '';
  assert.equal(robotsMeta.includes('noindex'), !indexed, `robots meta in ${urlPath}`);
  assert.equal(sitemapUrls.includes(canonical), indexed, `Sitemap entry for ${urlPath}`);
  return find;
}
const expectedSitemap = locales.flatMap((locale) =>
  indexedSlugs.map((slug) => canonicalUrl(route(locale, slug), siteUrl)),
);
assert.deepEqual(
  [...sitemapUrls].sort(),
  [...expectedSitemap].sort(),
  'Sitemap must list exactly the home and product pages',
);

for (const locale of locales) {
  // Home: one card per product, with decorative demo thumbnails.
  const home = documentFor(route(locale));
  checkPageMetadata(home, locale, '', route(locale), { indexed: true });
  for (const id of ['products', 'use-cases', 'privacy'])
    assert(home.ids.includes(id), `Home ${locale} is missing #${id}`);
  const thumbs = home.nodes.filter((node) => attrs(node)['data-variant'] === 'thumb');
  assert.equal(thumbs.length, products.length, `Home ${locale} needs one demo thumb per product`);
  for (const thumb of thumbs) {
    assert.equal(attrs(thumb)['aria-hidden'], 'true', `Demo thumb must be aria-hidden`);
    const reachable = flatten(thumb).filter((node) => node.tagName && focusable(node, attrs(node)));
    assert.equal(reachable.length, 0, `Focusable content inside a home demo thumb (${locale})`);
  }

  for (const product of products) {
    const slug = `products/${product.id}`;
    const urlPath = route(locale, slug);
    const doc = documentFor(urlPath);
    const find = checkPageMetadata(doc, locale, slug, urlPath, { indexed: true });
    for (const id of ['overview', 'features', 'use-cases', 'workflow', 'privacy', 'faq'])
      assert(doc.ids.includes(id), `${urlPath} is missing #${id}`);

    // One illustrative demo, hidden from assistive technology and unreachable by keyboard.
    const figures = find('figure').filter(
      (node) => 'data-demo' in attrs(node) && attrs(node)['data-variant'] === 'full',
    );
    assert.equal(figures.length, 1, `${urlPath} needs exactly one full demo`);
    const figureNodes = flatten(figures[0]);
    const stages = figureNodes.filter((node) => 'data-demo-stage' in attrs(node));
    assert.equal(stages.length, 1, `${urlPath} demo needs one [data-demo-stage]`);
    const stage = attrs(stages[0]);
    assert.equal(stage['aria-hidden'], 'true', `${urlPath} demo stage must be aria-hidden`);
    assert('inert' in stage, `${urlPath} demo stage must be inert`);
    const caption = figureNodes.find((node) => node.tagName === 'figcaption');
    assert(caption && textOf(caption), `${urlPath} demo needs a caption`);
    const stageNodes = flatten(stages[0]).slice(1);
    const reachable = stageNodes.filter((node) => node.tagName && focusable(node, attrs(node)));
    assert.deepEqual(
      reachable.map((node) => node.tagName),
      [],
      `${urlPath} demo stage contains focusable elements`,
    );
    const scenes = stageNodes.filter((node) => 'data-scene' in attrs(node));
    assert(scenes.length > 0, `${urlPath} demo has no [data-scene]`);
    for (const scene of scenes) {
      const a = attrs(scene);
      assert.equal('hidden' in a, a['data-scene'] !== '0', `${urlPath} scene ${a['data-scene']}`);
    }

    // Downloads mirror the product registry: links when published, a clear pending state otherwise.
    const downloads = byId(doc.nodes, 'downloads');
    assert(downloads, `${urlPath} is missing #downloads`);
    const cards = flatten(downloads).filter((node) => node.tagName === 'article');
    assert.equal(cards.length, product.downloads.length, `${urlPath} download count`);
    product.downloads.forEach((entry, index) => {
      const card = attrs(cards[index]);
      const inside = flatten(cards[index]);
      const buttons = inside.filter((node) => /\bbutton\b/.test(attrs(node).class ?? ''));
      assert.equal(card['data-download'], entry.id, `${urlPath} download order`);
      assert(textOf(cards[index]).includes(entry.label[locale]), `${entry.id} label`);
      if (entry.url) {
        assert.equal(card['data-state'], 'available', `${entry.id} state`);
        assert(
          buttons.some((node) => node.tagName === 'a' && attrs(node).href === entry.url),
          `${urlPath} is missing the ${entry.id} download link`,
        );
      } else {
        assert.equal(card['data-state'], 'pending', `${entry.id} state`);
        assert(
          buttons.some(
            (node) => node.tagName === 'span' && attrs(node)['aria-disabled'] === 'true',
          ),
          `${urlPath} needs a disabled ${entry.id} placeholder`,
        );
        assert(!inside.some((node) => node.tagName === 'a'), `${entry.id} links while pending`);
      }
    });
  }

  // Licenses: not indexed, and each notice links to a published text file.
  const licensesPath = route(locale, 'licenses');
  const licenses = documentFor(licensesPath);
  checkPageMetadata(licenses, locale, 'licenses', licensesPath, { indexed: false });
  const notices = licenses.nodes
    .filter((node) => node.tagName === 'a')
    .map((node) => attrs(node).href)
    .filter((href) => href?.startsWith(asset('/licenses/')));
  assert(notices.length > 0, `${licensesPath} lists no license files`);
  for (const href of notices) {
    assert(href.endsWith('.txt'), `${href} must be a .txt notice`);
    await checkLocal(href, path.join(root, licensesPath.slice(basePath.length), 'index.html'));
  }
}

// 404: Chinese layout with an English explanation and both homes.
const notFound = documents.get(path.join(root, '404.html'));
assert(notFound, 'Missing 404 page');
const notFoundNodes = notFound.nodes;
assert.equal(attrs(notFoundNodes.find((node) => node.tagName === 'html')).lang, 'zh-CN');
assert.equal(notFoundNodes.filter((node) => node.tagName === 'h1').length, 1, '404 h1');
assert(
  notFoundNodes.some((node) => node.tagName === 'p' && attrs(node).lang === 'en' && textOf(node)),
  '404 needs an English explanation',
);
assert(attrs(meta(notFound, 'name', 'robots') ?? {}).content?.includes('noindex'), '404 noindex');
for (const locale of locales)
  assert(
    notFoundNodes.some((node) => node.tagName === 'a' && attrs(node).href === route(locale)),
    `404 must link to ${route(locale)}`,
  );

// Entry page: stored choice, then browser language; without JavaScript, Chinese.
const entry = documents.get(path.join(root, 'index.html'));
assert(entry, 'Missing entry page');
assert(entry.source.includes('qcopilots-locale'), 'Entry page must honour the stored language');
for (const locale of locales) {
  assert(entry.source.includes(JSON.stringify(route(locale))), `Entry script target ${locale}`);
  assert(
    entry.nodes.some((node) => node.tagName === 'a' && attrs(node).href === route(locale)),
    `Entry page must link to ${route(locale)}`,
  );
}
assert(
  entry.source.includes(`http-equiv="refresh" content="0;url=${route('zh')}"`),
  'Entry page needs a no-script refresh to the Chinese home',
);
assert(attrs(meta(entry, 'name', 'robots') ?? {}).content?.includes('noindex'), 'Entry noindex');

console.log(
  `Verified ${documents.size} HTML documents at ${basePath}: local resources, anchors, external links, bilingual SEO, sitemap, English purity, demos, downloads, licenses and styles.`,
);
