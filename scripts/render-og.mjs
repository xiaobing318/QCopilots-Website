#!/usr/bin/env node
// Renders public/images/og-{zh,en}.png (1200x630) from the site's own fonts, colours and line art.
// Run after changing the home headline: node scripts/site.mjs run render:og
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { ui } from '../src/content/ui.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const font = (file) => pathToFileURL(path.join(root, 'node_modules', file)).href;
const art = (await readFile(path.join(root, 'src/components/LineArt.astro'), 'utf8'))
  .match(/<svg[\s\S]*?<\/svg>/)[0]
  .replace(/class:list=\{[^}]*\}\s*/, 'class="art" ');
const icon = await readFile(path.join(root, 'public/images/qcopilots-icon.svg'), 'utf8');

function page(locale) {
  const t = ui[locale];
  const display = "'Newsreader Variable','Noto Serif SC Variable',serif";
  return `<!doctype html><html lang="${locale === 'zh' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8">
<link rel="stylesheet" href="${font('@fontsource-variable/newsreader/opsz.css')}">
<link rel="stylesheet" href="${font('@fontsource-variable/noto-serif-sc/index.css')}">
<link rel="stylesheet" href="${font('@fontsource-variable/noto-sans-sc/index.css')}"><style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px}
body{display:grid;grid-template-columns:1.35fr 1fr;align-items:center;gap:40px;padding:72px 80px;background:#faf9f5;color:#3b3832;font-family:'Noto Sans SC Variable',sans-serif}
.brand{display:flex;align-items:center;gap:16px;font-family:${display};font-size:34px;color:#1f1e1b}.brand svg{width:52px;height:52px}
h1{margin:44px 0 24px;font-family:${display};font-weight:${locale === 'zh' ? 600 : 440};font-size:${locale === 'zh' ? 58 : 66}px;line-height:${locale === 'zh' ? 1.3 : 1.06};letter-spacing:${locale === 'zh' ? '0.02em' : '-0.02em'};color:#1f1e1b}
h1 span{display:block}h1 span+span{color:#67625a}p{margin:0;font-size:24px;color:#67625a}
.art{width:100%;color:#c4643f}.art .contours path{stroke:#67625a;stroke-opacity:.4}.art .route{stroke-dasharray:2 7}.art .pin-dot{fill:currentColor}.art .wave{stroke-width:2}
</style></head><body><div><div class="brand">${icon}<span>QCopilots</span></div>
<h1><span>${t.home.title[0]}</span><span>${t.home.title[1]}</span></h1><p>${t.home.eyebrow}</p></div>${art}</body></html>`;
}

const work = await mkdtemp(path.join(os.tmpdir(), 'qcopilots-og-'));
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1200, height: 630 } });
  const tab = await context.newPage();
  for (const locale of ['zh', 'en']) {
    const file = path.join(work, `${locale}.html`);
    await writeFile(file, page(locale));
    await tab.goto(pathToFileURL(file).href);
    await tab.evaluate(() => document.fonts.ready);
    const out = path.join(root, `public/images/og-${locale}.png`);
    await tab.screenshot({ path: out, type: 'png' });
    console.log(`Rendered ${path.relative(root, out)}`);
  }
} finally {
  await browser.close();
  await rm(work, { recursive: true, force: true });
}
