import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { products } from '../../src/content/products';

// Opt-in review artifacts, with no pixel baseline tied to marketing copy.
test('capture successful responsive pages for visual review', async ({
  page,
  browserName,
}, testInfo) => {
  const output = process.env.E2E_SCREENSHOT_DIR;
  test.skip(
    !output || browserName !== 'chromium',
    'Set E2E_SCREENSHOT_DIR to capture Chromium review images.',
  );
  test.setTimeout(120_000);
  await mkdir(output!, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const routes = ['zh', 'en'].flatMap((locale) => [
    { route: `${locale}/`, name: `${locale}-home` },
    ...products.map((product) => ({
      route: `${locale}/products/${product.id}/`,
      name: `${locale}-${product.id}`,
    })),
  ]);
  const cases = [
    ...routes.map((route) => ({ ...route, width: 1280, label: 'desktop' })),
    ...routes.map((route) => ({ ...route, width: 390, label: 'mobile' })),
    { route: 'zh/', name: 'zh-home', width: 941, label: 'mock-comparison' },
  ];
  const deployment = (process.env.BASE_PATH ?? '/').replace(/\//g, '') || 'root';
  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: 1000 });
    const response = await page.goto(item.route);
    expect(response?.ok()).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img:visible').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element) =>
              element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const name = `${deployment}-${item.name}-${item.label}-${item.width}.png`;
    const screenshotPath = path.join(output!, name);
    await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
    await testInfo.attach(name, { path: screenshotPath, contentType: 'image/png' });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('zh/');
  await page.evaluate(() => document.fonts.ready);
  const previewPath = path.join(
    output!,
    `${deployment === 'root' ? '' : `${deployment}-`}home-desktop-preview.png`,
  );
  await page.screenshot({ path: previewPath, animations: 'disabled' });
  await testInfo.attach('home-desktop-preview', { path: previewPath, contentType: 'image/png' });
  expect(errors).toEqual([]);
});
