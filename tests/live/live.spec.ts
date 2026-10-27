import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/** Site paths relative to the base URL, read from the published sitemap. */
async function sitePaths(request: APIRequestContext, baseURL: string) {
  const response = await request.get('sitemap.xml');
  expect(response.status()).toBe(200);
  const basePath = new URL(baseURL).pathname;
  return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, location]) => {
    const pathname = new URL(location).pathname;
    expect(pathname.startsWith(basePath), `${location} is outside ${basePath}`).toBe(true);
    return pathname.slice(basePath.length);
  });
}

/** Collects what a visitor would notice: script errors, broken files and requests to other sites. */
function watch(page: Page, origin: string) {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console error: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin)
      problems.push(`third-party request: ${request.url()}`);
  });
  page.on('response', (response) => {
    if (new URL(response.url()).origin === origin && response.status() >= 400)
      problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return problems;
}

test('every page in the sitemap opens cleanly', async ({ page, request, baseURL }) => {
  const problems = watch(page, new URL(baseURL!).origin);
  const paths = await sitePaths(request, baseURL!);
  expect(paths.length).toBeGreaterThanOrEqual(4);
  for (const path of paths) {
    await test.step(path, async () => {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        new RegExp(`^${path.slice(0, 2)}`),
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new URL(path, baseURL).href,
      );
      await page.evaluate(() => document.fonts.ready);
      const sideways = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(sideways, `${path} scrolls sideways`).toBeLessThanOrEqual(1);
    });
  }
  expect(problems).toEqual([]);
});

test('the entry page opens a language home and remembers a choice', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveURL(/\/(zh|en)\/$/);
  await page.evaluate(() => localStorage.setItem('qcopilots-locale', 'en'));
  await page.goto('./?source=live-check#products');
  await expect(page).toHaveURL(/\/en\/\?source=live-check#products$/);
});

test('switching language keeps the product and chapter', async ({ page, request, baseURL }) => {
  const products = (await sitePaths(request, baseURL!)).filter((path) =>
    path.startsWith('zh/products/'),
  );
  expect(products.length).toBeGreaterThan(0);
  for (const path of products) {
    const english = path.replace(/^zh\//, 'en/');
    await page.goto(`${path}#faq`);
    await page.getByTestId('language-switch').click();
    await expect(page).toHaveURL(new RegExp(`/${english}#faq$`));
    await expect(page.locator('#faq')).toBeInViewport();
    await page.getByTestId('language-switch').click();
    await expect(page).toHaveURL(new RegExp(`/${path}#faq$`));
  }
});

test('a missing address shows a recovery page', async ({ page }) => {
  const response = await page.goto(`missing-${Date.now()}/`);
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main a[href$="/zh/"]').first()).toBeVisible();
  await expect(page.locator('main a[href$="/en/"]').first()).toBeVisible();
});

test('service files are published', async ({ request }) => {
  for (const file of ['robots.txt', 'sitemap.xml', 'healthz', 'build-info.json'])
    expect((await request.get(file)).status(), file).toBe(200);
});

test('the phone menu opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone layout only.');
  await page.goto('zh/');
  const toggle = page.getByTestId('mobile-menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-nav a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
