import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { products } from '../../src/content/products';

const locales = ['zh', 'en'] as const;
const productSlugs = products.map((product) => product.id);
const routes = locales.flatMap((locale) => [
  `${locale}/`,
  ...productSlugs.map((product) => `${locale}/products/${product}/`),
]);

for (const route of routes) {
  test(`${route} has usable content, language metadata, and no serious accessibility issues`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${route.slice(0, 2)}`));
    await expect(page).toHaveTitle(/\S+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      /\/en\//,
    );
    await expect(page.locator('link[rel="alternate"][hreflang^="zh"]')).toHaveAttribute(
      'href',
      /\/zh\//,
    );

    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const severe = accessibility.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    );
    expect(
      severe,
      JSON.stringify(
        severe.map(({ id, impact, help, nodes }) => ({
          id,
          impact,
          help,
          targets: nodes.map(({ target }) => target),
        })),
        null,
        2,
      ),
    ).toEqual([]);
  });
}

test('the entry page defaults to Chinese and remembers an explicit language choice', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page).toHaveURL(/\/zh\/$/);
  await languageLink(page, 'en').click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.goto('./');
  await expect(page).toHaveURL(/\/en\/$/);
  await page.goto('zh/');
  await expect(page).toHaveURL(/\/zh\/$/);
});

test('language switching preserves the current product and chapter', async ({ page }) => {
  for (const product of productSlugs) {
    await page.goto(`zh/products/${product}/#faq`);
    await languageLink(page, 'en').click();
    await expect(page).toHaveURL(new RegExp(`/en/products/${product}/#faq$`));
    await expect(page.locator('#faq')).toBeInViewport();
    await languageLink(page, 'zh').click();
    await expect(page).toHaveURL(new RegExp(`/zh/products/${product}/#faq$`));
  }
});

test('mobile navigation opens, reaches a product, and can close with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('en/');
  const toggle = page.locator('header button[aria-controls][aria-expanded]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const menuId = await toggle.getAttribute('aria-controls');
  expect(menuId).toBeTruthy();
  const navigation = page.locator(`[id="${menuId}"]`);
  await expect(navigation).toBeVisible();
  await navigation.locator('a[href$="/en/products/qcopilots-search/"]').click();
  await expect(page).toHaveURL(/\/en\/products\/qcopilots-search\/$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('opening mobile navigation moves keyboard focus into its visible links', async ({
  page,
  browserName,
}) => {
  test.skip(
    process.platform === 'win32' && browserName === 'webkit',
    'Windows WebKit defaults disable tabbing to links.',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('en/products/qcopilots-search/');
  const toggle = page.getByTestId('mobile-menu-toggle');
  const navigation = page.locator('#primary-nav');
  await expect(toggle).toBeVisible();
  await expect(navigation).toBeHidden();
  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press('Tab');
    if (await toggle.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const links = navigation.locator('a');
  await expect(links.first()).toHaveText('Products');
  await expect(links.first()).toBeFocused();
  for (const link of (await links.all()).slice(1)) {
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    await expect(link).toBeVisible();
    expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await expect(toggle).toBeFocused();
});

test.describe('mobile navigation without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of locales) {
    test(`${locale} exposes usable product links without an inactive menu button`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${locale}/`);
      await expect(page.getByTestId('mobile-menu-toggle')).toBeHidden();
      const navigation = page.locator('#primary-nav');
      await expect(navigation).toBeVisible();
      for (const link of await navigation.locator('a').all()) await expect(link).toBeVisible();
      await navigation.locator(`a[href$="/${locale}/products/qcopilots-search/"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/products/qcopilots-search/$`));
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#primary-nav')).toBeVisible();
    });
  }
});

for (const width of [768, 390]) {
  test(`English chapter links remain readable and keyboard reachable at ${width}px`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      process.platform === 'win32' && browserName === 'webkit',
      'Windows WebKit defaults disable tabbing to links.',
    );
    await page.setViewportSize({ width, height: 844 });
    await page.goto('en/products/qcopilots-search/#downloads');
    await page.evaluate(() => document.fonts.ready);
    const navigation = page.locator('.product-subnav .container');
    const links = navigation.locator('a');
    const clippedPixels = (index: number) =>
      links.nth(index).evaluate((element) => {
        const link = element.getBoundingClientRect();
        const container = element.parentElement!;
        const viewport = container.getBoundingClientRect();
        return Math.max(
          0,
          viewport.left - link.left,
          link.right - (viewport.left + container.clientWidth),
        );
      });

    // Check the initial layout before focus can automatically scroll a clipped link into view.
    await expect(links.first()).toHaveText('What you can do');
    await expect.poll(() => navigation.evaluate((element) => element.scrollLeft)).toBe(0);
    await expect.poll(() => clippedPixels(0)).toBeLessThanOrEqual(1);
    await links.first().focus();
    const count = await links.count();
    for (let index = 0; index < count; index += 1) {
      if (index > 0) await page.keyboard.press('Tab');
      await expect(links.nth(index)).toBeFocused();
      await expect.poll(() => clippedPixels(index)).toBeLessThanOrEqual(1);
      await expect(links.nth(index)).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
      const focusRingOverflow = await links.nth(index).evaluate((element) => {
        const style = getComputedStyle(element);
        return parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
      });
      expect(focusRingOverflow).toBeLessThanOrEqual(0);
    }
    await expect(links.last()).toHaveText('Get the product');
  });
}

test('FAQ answers can be expanded by keyboard', async ({ page }) => {
  await page.goto('en/products/qcopilots/');
  const question = page.locator('#faq details').first();
  const summary = question.locator('summary');
  await expect(summary).toBeVisible();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(question).toHaveAttribute('open', '');
  await expect(question).not.toHaveText(await summary.innerText());
  await page.keyboard.press('Enter');
  await expect(question).not.toHaveAttribute('open');
});

test('download sections reflect availability without dead links', async ({ page }) => {
  for (const locale of locales) {
    for (const product of products) {
      await page.goto(`${locale}/products/${product.id}/`);
      const downloads = page.locator('#downloads');
      await expect(downloads).toBeVisible();
      await expect(downloads.locator('a[href=""], a[href="#"]')).toHaveCount(0);
      const cards = downloads.locator('article');
      await expect(cards).toHaveCount(product.downloads.length);
      for (const [index, entry] of product.downloads.entries()) {
        const card = cards.nth(index);
        await expect(
          card.getByRole('heading', { name: entry.label[locale], exact: true }),
        ).toBeVisible();
        if (entry.url) {
          await expect(card.getByTestId('download-link')).toHaveAttribute('href', entry.url);
          await expect(card.getByTestId('download-unavailable')).toHaveCount(0);
        } else {
          await expect(card.getByTestId('download-unavailable')).toBeDisabled();
          await expect(card.getByTestId('download-link')).toHaveCount(0);
        }
        for (const metadata of [entry.architecture, entry.version, entry.checksum]) {
          if (metadata) await expect(card.getByText(metadata, { exact: true })).toBeVisible();
        }
      }
    }
  }
});

test('the focused skip link is visible and Enter reaches main content', async ({ page }) => {
  await page.goto('en/');
  const skipLink = page.locator('a.skip-link');
  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('Tab navigation exposes visible focus in document order', async ({ page, browserName }) => {
  // Windows WebKit skips anchors even in a minimal HTML document, including with Alt+Tab.
  // Preserve the real Tab test on Linux CI and test focused-link activation separately everywhere.
  // https://github.com/microsoft/playwright/issues/5609
  test.skip(
    process.platform === 'win32' && browserName === 'webkit',
    'Windows WebKit defaults disable tabbing to links.',
  );
  await page.goto('en/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
  await expect(focused).toHaveAttribute('href', /^#/);
  await expect(focused).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    expect(
      await page.locator(':focus').evaluate((element) => element.matches(':focus-visible')),
    ).toBe(true);
  }
});

test('reduced-motion preference disables continuous motion and smooth scrolling', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('en/');
  const motion = await page.evaluate(() => {
    const elements = [document.documentElement, ...Array.from(document.querySelectorAll('body *'))];
    return elements.flatMap((element) => {
      const style = getComputedStyle(element);
      const continuous =
        style.animationName !== 'none' && style.animationIterationCount === 'infinite';
      const longAnimation = style.animationDuration
        .split(',')
        .some((duration) => parseFloat(duration) > 0.01);
      return style.scrollBehavior === 'smooth' || (continuous && longAnimation)
        ? [`${element.tagName}.${element.className}`]
        : [];
    });
  });
  expect(motion).toEqual([]);
});

test('pages stay within mobile and desktop viewports', async ({ page }) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['zh/', 'en/products/qcopilots/', 'en/products/qcopilots-search/']) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('all internal links and browser resources resolve under the configured base path', async ({
  page,
  request,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const basePath = new URL(baseURL!).pathname;
  const failures: string[] = [];
  const links = new Set<string>();
  page.on('pageerror', (error) => failures.push(`Uncaught error: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`Console error: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.url().startsWith(`${origin}/`) && response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (failed) => {
    if (failed.url().startsWith(`${origin}/`))
      failures.push(`${failed.failure()?.errorText} ${failed.url()}`);
  });
  for (const route of routes) {
    await page.goto(route);
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
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== origin) continue;
      expect(url.pathname.startsWith(basePath), `${href} escaped BASE_PATH ${basePath}`).toBe(true);
      url.hash = '';
      links.add(url.href);
    }
  }
  for (const href of links) {
    const response = await request.get(href);
    expect(response.ok(), `${response.status()} ${href}`).toBe(true);
  }
  expect(failures).toEqual([]);
});

test('missing pages return the custom 404 and provide a usable home link', async ({
  page,
  baseURL,
}) => {
  const response = await page.goto('page-that-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  const expectedHome = new URL('zh/', baseURL).pathname;
  await page.locator(`main a[href="${expectedHome}"]`).click();
  await expect(page).toHaveURL(/\/zh\/$/);
});

function languageLink(page: Page, locale: 'zh' | 'en') {
  return page.locator(`header a[hreflang^="${locale}"]:visible`).first();
}
