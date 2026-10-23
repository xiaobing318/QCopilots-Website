import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products } from '../src/content/products.ts';
import { ui } from '../src/content/ui.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const ids = new Set();
function checkStrings(value, label) {
  if (typeof value === 'string') {
    assert(value.trim(), `${label} is empty`);
    return;
  }
  if (Array.isArray(value)) {
    assert(value.length, `${label} has no entries`);
    value.forEach((item, index) => checkStrings(item, `${label}[${index}]`));
    return;
  }
  for (const [key, item] of Object.entries(value)) checkStrings(item, `${label}.${key}`);
}
function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape(value[key])]),
    );
  return typeof value;
}
for (const product of products) {
  assert(/^[a-z0-9-]+$/.test(product.id), `Invalid product slug ${product.id}`);
  assert(!ids.has(product.id), `Duplicate product slug ${product.id}`);
  ids.add(product.id);
  assert.deepEqual(
    shape(product.locales.zh),
    shape(product.locales.en),
    `Translation structure mismatch ${product.id}`,
  );
  checkStrings(product.locales, product.id);
  for (const image of [product.icon, product.heroImage]) {
    assert(image.startsWith('/images/') && !image.includes('..'), `Invalid asset ${image}`);
    await access(path.join(root, 'public', image));
  }
  const downloads = new Set();
  for (const entry of product.downloads) {
    assert(!downloads.has(entry.id), `Duplicate download ${entry.id}`);
    downloads.add(entry.id);
    checkStrings(entry.label, `${product.id}.${entry.id}.label`);
    if (entry.requirements) checkStrings(entry.requirements, `${entry.id}.requirements`);
    if (entry.url !== null) {
      const url = new URL(entry.url);
      assert(
        url.protocol === 'https:' && !url.username && !url.password,
        `Download must use HTTPS: ${entry.id}`,
      );
    }
  }
}
assert.deepEqual(shape(ui.zh), shape(ui.en), 'UI translation structure mismatch');
checkStrings(ui, 'ui');
for (const locale of ['zh', 'en'])
  for (const scenario of ui[locale].home.scenarios)
    assert(ids.has(scenario.productId), 'Unknown product in scenario');
console.log(
  `Content verified: ${products.length} products, two complete languages, valid asset and download declarations.`,
);
