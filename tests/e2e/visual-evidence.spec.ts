import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { products } from '../../src/content/products';
import { collectConsoleErrors } from '../shared/checks';

// Opt-in review images, with no pixel baseline tied to marketing copy.
const output = process.env.E2E_SCREENSHOT_DIR;
const deployment = (process.env.BASE_PATH ?? '/').replace(/\//g, '') || 'root';
const notFound = { route: 'page-that-does-not-exist/', name: '404', status: 404 };
const pages = [
  ...['zh', 'en'].flatMap((locale) => [
    { route: `${locale}/`, name: `${locale}-home`, status: 200 },
    ...products.map((product) => ({
      route: `${locale}/products/${product.id}/`,
      name: `${locale}-${product.id}`,
      status: 200,
    })),
  ]),
  notFound,
];

for (const width of [390, 768, 1440]) {
  test(`capture every page at ${width}px for visual review`, async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(
      !output || browserName !== 'chromium',
      'Set E2E_SCREENSHOT_DIR to capture Chromium review images.',
    );
    test.setTimeout(120_000);
    await mkdir(output!, { recursive: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 1000 });
    const errors = collectConsoleErrors(page);
    for (const item of pages) {
      const response = await page.goto(item.route);
      expect(response?.status(), item.route).toBe(item.status);
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
      const name = `${deployment}-${item.name}-${width}.png`;
      const screenshotPath = path.join(output!, name);
      await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
      await testInfo.attach(name, { path: screenshotPath, contentType: 'image/png' });
    }
    // The 404 page reports its own status in the console.
    expect(errors.filter((error) => !/Failed to load resource.*\b404\b/.test(error))).toEqual([]);
  });
}
