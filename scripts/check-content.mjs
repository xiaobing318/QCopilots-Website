import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products } from '../src/content/products.ts';
import { ui } from '../src/content/ui.ts';
import { demoKeys } from '../src/content/demos.ts';
import { iconNames } from '../src/content/icons.ts';
import { organization } from '../src/content/site.ts';
import { technicalTerms } from '../src/lib/plain-language.mjs';
import {
  areas as mapAreas,
  breaks as mapBreaks,
} from '../src/components/demos/geometry/germany-states.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const ids = new Set();
const orders = new Set();
const technical = [];
function checkStrings(value, label) {
  if (typeof value === 'string') {
    assert(value.trim(), `${label} is empty`);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return;
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
/** English copy must not fall back to Chinese characters or full-width punctuation. */
function checkEnglish(value, label) {
  if (typeof value === 'string') {
    assert(
      !/[\p{Script=Han}，。：；（）、！？「」『』]/u.test(value),
      `${label} contains Chinese text on the English side: ${value}`,
    );
    return;
  }
  if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) checkEnglish(item, `${label}.${key}`);
}
function findTechnical(value, label) {
  if (typeof value === 'string') {
    const match = technicalTerms.exec(value);
    if (match) technical.push(`${label} contains "${match[0]}": ${value}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findTechnical(item, `${label}[${index}]`));
    return;
  }
  if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) findTechnical(item, `${label}.${key}`);
}
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

for (const product of products) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id), `Invalid product slug ${product.id}`);
  assert(!ids.has(product.id), `Duplicate product slug ${product.id}`);
  ids.add(product.id);
  assert(
    Number.isFinite(product.order) && !orders.has(product.order),
    `Duplicate order ${product.id}`,
  );
  orders.add(product.order);
  assert(['available', 'coming-soon'].includes(product.status), `Invalid status ${product.id}`);
  if (product.demo) assert(demoKeys.includes(product.demo), `Unknown demo ${product.demo}`);
  for (const [name, value] of Object.entries(product.theme))
    assert(/^#[0-9a-f]{6}$/i.test(value), `${product.id} theme.${name} must be a #rrggbb colour`);
  for (const background of ['#faf9f5', '#ffffff', '#ece7db', product.theme.wash])
    assert(
      contrast(product.theme.accentInk, background) >= 4.5,
      `${product.id} theme.accentInk needs 4.5:1 contrast on ${background}`,
    );
  assert.deepEqual(
    shape(product.locales.zh),
    shape(product.locales.en),
    `Translation structure mismatch ${product.id}`,
  );
  checkStrings(product.locales, product.id);
  checkEnglish(product.locales.en, `${product.id}.en`);
  findTechnical(product.locales, product.id);
  for (const locale of ['zh', 'en'])
    for (const highlight of product.locales[locale].highlights)
      assert(iconNames.includes(highlight.icon), `Unknown icon ${highlight.icon}`);
  // realRun is optional. The shape check above keeps it in both languages or neither,
  // and checkStrings rejects empty images, prompts, steps and facts.
  const realRun = product.locales.zh.realRun;
  if (realRun) {
    const date = realRun.recordedOn;
    const parsed = new Date(date);
    assert(
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().startsWith(date),
      `${product.id} realRun.recordedOn must be a real YYYY-MM-DD date: ${date}`,
    );
    assert.equal(
      product.locales.en.realRun.recordedOn,
      date,
      `${product.id} realRun.recordedOn must be the same in both languages`,
    );
    for (const locale of ['zh', 'en'])
      for (const image of product.locales[locale].realRun.images) {
        const file = image.file;
        assert(
          !file.includes('..') && !file.startsWith('/') && /\.(png|jpe?g)$/.test(file),
          `${product.id}.${locale} realRun image must be a .png, .jpg or .jpeg under src/assets/real-runs/: ${file}`,
        );
        await access(path.join(root, 'src/assets/real-runs', file)).catch(() =>
          assert.fail(
            `${product.id}.${locale} realRun image is missing: src/assets/real-runs/${file}`,
          ),
        );
      }
  }
  // The QCopilots map demo pairs content with generated geometry by position, so keep them in step
  // after any regeneration of src/components/demos/geometry/germany-states.ts.
  if (product.demo === 'qcopilots-qgis')
    for (const locale of ['zh', 'en']) {
      const { labels, scenes } = product.locales[locale].demo;
      const km2 = (value) => Math.round(value).toLocaleString('en-US');
      for (let n = 1; n <= 5; n += 1) {
        const label = labels[`class${n}`] ?? '';
        if (n > 1) assert(label.includes(km2(mapBreaks[n - 1])), `${locale} class${n}: ${label}`);
        if (n < 5) assert(label.includes(km2(mapBreaks[n])), `${locale} class${n}: ${label}`);
      }
      for (const scene of scenes)
        (scene.rows ?? []).forEach((row, index) =>
          assert.equal(row.label, mapAreas[index]?.name, `${locale} demo row ${index} vs geometry`),
        );
    }
  const icon = product.icon.src;
  assert(icon.startsWith('/images/') && !icon.includes('..'), `Invalid asset ${icon}`);
  await access(path.join(root, 'public', icon));
  if (product.icon.license) {
    const file = product.icon.license.file;
    assert(file.startsWith('/licenses/') && !file.includes('..'), `Invalid license file ${file}`);
    await access(path.join(root, 'public', file));
  }
  const downloads = new Set();
  assert(product.downloads.length, `${product.id} needs at least one download entry`);
  for (const entry of product.downloads) {
    assert(!downloads.has(entry.id), `Duplicate download ${entry.id}`);
    downloads.add(entry.id);
    checkStrings(entry.label, `${product.id}.${entry.id}.label`);
    if (entry.requirements) checkStrings(entry.requirements, `${entry.id}.requirements`);
    checkEnglish(entry.label.en, `${entry.id}.label.en`);
    if (entry.requirements) checkEnglish(entry.requirements.en, `${entry.id}.requirements.en`);
    if (product.status === 'coming-soon')
      assert.equal(entry.url, null, `${entry.id} cannot link a download while coming soon`);
    if (entry.url !== null) {
      const url = new URL(entry.url);
      assert(
        url.protocol === 'https:' && !url.username && !url.password,
        `Download must use HTTPS: ${entry.id}`,
      );
    }
  }
  for (const link of Object.values(product.links ?? {}))
    assert(new URL(link).protocol === 'https:', `Product links must use HTTPS: ${link}`);
}
assert.deepEqual(shape(ui.zh), shape(ui.en), 'UI translation structure mismatch');
checkStrings(ui, 'ui');
checkEnglish(ui.en, 'ui.en');
findTechnical(ui, 'ui');
assert(
  !technical.length,
  `Copy is for everyday users. Remove these technical terms:\n  ${technical.join('\n  ')}`,
);
for (const locale of ['zh', 'en'])
  for (const item of [...ui[locale].home.principles, ...ui[locale].contact.types])
    assert(iconNames.includes(item.icon), `Unknown icon ${item.icon}`);
assert(
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organization.email),
  `Invalid contact email in src/content/site.ts: ${organization.email}`,
);

// Every UI string must be used somewhere, so stale copy cannot pile up again.
async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(full);
      return /\.(astro|ts|mjs)$/.test(entry.name) ? [full] : [];
    }),
  );
  return files.flat();
}
const sources = (
  await Promise.all(
    [...(await sourceFiles(path.join(root, 'src'))), path.join(root, 'scripts/render-og.mjs')]
      .filter((file) => !file.endsWith(path.join('content', 'ui.ts')))
      .map((file) => readFile(file, 'utf8')),
  )
).join('\n');
for (const [section, values] of Object.entries(ui.en))
  for (const key of Object.keys(values))
    assert(
      new RegExp(`\\.${key}\\b`).test(sources),
      `ui.${section}.${key} is not used. Remove it from src/content/ui.ts.`,
    );

console.log(
  `Content verified: ${products.length} products, two complete languages, plain-language copy, themes, demos, real runs, icons, contact and downloads.`,
);
