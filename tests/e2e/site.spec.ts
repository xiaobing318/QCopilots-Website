import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { products } from '../../src/content/products';
import { ui } from '../../src/content/ui';
import {
  chineseOutsideZh,
  collectConsoleErrors,
  collectRequests,
  horizontalOverflow,
} from '../shared/checks';

const locales = ['zh', 'en'] as const;
type Locale = (typeof locales)[number];
const htmlLang = (locale: Locale) => (locale === 'zh' ? 'zh-CN' : 'en');
const pageRoutes = locales.flatMap((locale) => [
  { locale, slug: '' },
  ...products.map((product) => ({ locale, slug: `products/${product.id}/` })),
  { locale, slug: 'licenses/' },
]);
const routes = pageRoutes.map(({ locale, slug }) => `${locale}/${slug}`);
const englishRoutes = routes.filter((route) => route.startsWith('en/'));
const notFoundRoute = 'page-that-does-not-exist/';
const lastProduct = products[products.length - 1];
const chapterIds = ['overview', 'features', 'use-cases', 'workflow', 'privacy', 'faq', 'downloads'];
const chapterLabels = (locale: Locale) => {
  const { sections } = ui[locale].product;
  return [
    sections.overview,
    sections.features,
    sections.examples,
    sections.workflow,
    sections.privacy,
    sections.faq,
    sections.downloads,
  ];
};
const skipWindowsWebKitTabbing = (browserName: string) =>
  test.skip(
    process.platform === 'win32' && browserName === 'webkit',
    'Windows WebKit defaults disable tabbing to links.',
  );
const pathnameOf = (href: string | null) => new URL(href ?? '', 'http://x').pathname;
/** The 404 page reports its own status in the console; any other 404 shows up in the request log. */
const withoutExpected404 = (errors: string[]) =>
  errors.filter((error) => !/Failed to load resource.*\b404\b/.test(error));

async function expectNoSeriousAccessibilityIssues(page: Page) {
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
}

for (const { locale, slug } of pageRoutes) {
  const route = `${locale}/${slug}`;
  test(`${route} has usable content, language metadata, and no serious accessibility issues`, async ({
    page,
    baseURL,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', htmlLang(locale));
    await expect(page).toHaveTitle(/\S+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
    const expected = (target: Locale) => new URL(`${target}/${slug}`, baseURL).pathname;
    const href = (selector: string) => page.locator(selector).getAttribute('href');
    expect(pathnameOf(await href('link[rel="canonical"]'))).toBe(expected(locale));
    expect(await href('link[rel="canonical"]')).toMatch(/^https?:\/\//);
    expect(pathnameOf(await href('link[rel="alternate"][hreflang="zh-CN"]'))).toBe(expected('zh'));
    expect(pathnameOf(await href('link[rel="alternate"][hreflang="en"]'))).toBe(expected('en'));
    expect(pathnameOf(await href('link[rel="alternate"][hreflang="x-default"]'))).toBe(
      expected('zh'),
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      new RegExp(`/images/og-${locale}\\.png$`),
    );
    await expect(page.locator('meta[name="robots"]')).toHaveCount(slug === 'licenses/' ? 1 : 0);
    await expectNoSeriousAccessibilityIssues(page);
  });
}

test.describe('entry page language choice', () => {
  for (const [browserLocale, expected] of [
    ['zh-CN', 'zh'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
  ] as const) {
    test.describe(`browser language ${browserLocale}`, () => {
      test.use({ locale: browserLocale });

      test(`opens the ${expected} home`, async ({ page }) => {
        await page.goto('./');
        await expect(page).toHaveURL(new RegExp(`/${expected}/$`));
        await expect(page.locator('html')).toHaveAttribute('lang', htmlLang(expected));
      });

      test('a stored choice wins over the browser language', async ({ page }) => {
        const stored = expected === 'zh' ? 'en' : 'zh';
        await page.addInitScript((value) => {
          localStorage.setItem('qcopilots-locale', value);
        }, stored);
        await page.goto('./');
        await expect(page).toHaveURL(new RegExp(`/${stored}/$`));
      });
    });
  }

  test('redirects keep query parameters and chapter, then remember a switch', async ({
    page,
    baseURL,
  }) => {
    const suffix = '?source=e2e-audit&label=hello%20world#products';
    await page.goto(`./${suffix}`);
    await expect(page).toHaveURL(new URL(`en/${suffix}`, baseURL).href);
    await expect(page.locator('#products')).toBeInViewport();
    await page.getByTestId('language-switch').click();
    await expect(page).toHaveURL(new URL(`zh/${suffix}`, baseURL).href);
    await page.goto(`./${suffix}`);
    await expect(page).toHaveURL(new URL(`zh/${suffix}`, baseURL).href);
    await expect(page.locator('#products')).toBeInViewport();
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false, locale: 'en-US' });

    test('falls back to the Chinese home', async ({ page }) => {
      await page.goto('./');
      await expect(page).toHaveURL(/\/zh\/$/);
    });
  });
});

test('language links keep the product, query and chapter in both directions', async ({
  page,
  baseURL,
}) => {
  for (const product of products) {
    const suffix = `products/${product.id}/?source=e2e-audit#faq`;
    await page.goto(`zh/${suffix}`);
    await page.getByTestId('language-switch').click();
    await expect(page).toHaveURL(new URL(`en/${suffix}`, baseURL).href);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#faq')).toBeInViewport();
    expect(await page.evaluate(() => localStorage.getItem('qcopilots-locale'))).toBe('en');
    await page.getByTestId('language-switch').click();
    await expect(page).toHaveURL(new URL(`zh/${suffix}`, baseURL).href);
    await expect(page.locator('#faq')).toBeInViewport();
  }
  // Footer language links follow the same rules, including after an in-page jump.
  await page.goto(`en/products/${lastProduct.id}/?source=footer`);
  await page.locator('.product-subnav a[href="#downloads"]').click();
  await page.locator('footer a[data-locale="zh"]').click();
  await expect(page).toHaveURL(
    new URL(`zh/products/${lastProduct.id}/?source=footer#downloads`, baseURL).href,
  );
});

test('header navigation names every product and marks the current page', async ({ page }) => {
  for (const locale of locales) {
    for (const product of products) {
      await page.goto(`${locale}/products/${product.id}/`);
      const navigation = page.locator('#primary-nav');
      await expect(navigation.locator('a').first()).toHaveText(ui[locale].nav.products);
      for (const other of products) {
        const link = navigation.getByRole('link', {
          name: other.locales[locale].name,
          exact: true,
        });
        if (other.id === product.id) await expect(link).toHaveAttribute('aria-current', 'page');
        else await expect(link).not.toHaveAttribute('aria-current');
      }
    }
  }
});

test('mobile navigation opens, reaches a product, and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('en/');
  const toggle = page.getByTestId('mobile-menu-toggle');
  const navigation = page.locator('#primary-nav');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-controls', 'primary-nav');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-label', ui.en.nav.menu);
  await expect(navigation).toBeHidden();
  // Exactly one icon shows: the menu glyph while closed, the close glyph while open.
  await expect(toggle.locator('.menu-open-icon')).toBeVisible();
  await expect(toggle.locator('.menu-close-icon')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAttribute('aria-label', ui.en.nav.close);
  await expect(toggle.locator('.menu-open-icon')).toBeHidden();
  await expect(toggle.locator('.menu-close-icon')).toBeVisible();
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: lastProduct.locales.en.name, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/en/products/${lastProduct.id}/$`));
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await toggle.click();
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('opening mobile navigation by keyboard moves focus into its visible links', async ({
  page,
  browserName,
}) => {
  skipWindowsWebKitTabbing(browserName);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`en/products/${lastProduct.id}/`);
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
  await expect(links).toHaveCount(products.length + 1);
  await expect(links.first()).toHaveText(ui.en.nav.products);
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
    test(`${locale} shows the product links and no inactive menu button`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${locale}/`);
      await expect(page.getByTestId('mobile-menu-toggle')).toBeHidden();
      const navigation = page.locator('#primary-nav');
      await expect(navigation).toBeVisible();
      for (const link of await navigation.locator('a').all()) await expect(link).toBeVisible();
      await navigation
        .getByRole('link', { name: lastProduct.locales[locale].name, exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/products/${lastProduct.id}/$`));
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#primary-nav')).toBeVisible();
    });
  }
});

for (const width of [768, 390]) {
  test(`chapter links stay readable and keyboard reachable at ${width}px`, async ({
    page,
    browserName,
  }) => {
    skipWindowsWebKitTabbing(browserName);
    await page.setViewportSize({ width, height: 844 });
    for (const locale of locales) {
      for (const product of products) {
        await page.goto(`${locale}/products/${product.id}/#downloads`);
        await page.evaluate(() => document.fonts.ready);
        const navigation = page.locator('.product-subnav .container');
        const links = navigation.locator('a');
        await expect(links).toHaveCount(chapterIds.length);
        await expect(links).toHaveText(chapterLabels(locale));
        expect(
          await links.evaluateAll((all) => all.map((link) => link.getAttribute('href'))),
        ).toEqual(chapterIds.map((id) => `#${id}`));
        await expect(page.locator('.product-subnav')).toBeInViewport();
        const clippedPixels = (link: Locator) =>
          link.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const container = element.parentElement!;
            const viewport = container.getBoundingClientRect();
            const truncated = element.scrollWidth - element.clientWidth;
            return Math.max(
              0,
              truncated,
              viewport.left - box.left,
              box.right - (viewport.left + container.clientWidth),
            );
          });

        // Check the initial layout before focus can scroll a clipped link into view.
        await expect.poll(() => navigation.evaluate((element) => element.scrollLeft)).toBe(0);
        await expect.poll(() => clippedPixels(links.first())).toBeLessThanOrEqual(1);
        const fontSize = await links
          .first()
          .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
        expect(fontSize).toBeGreaterThanOrEqual(12);
        await links.first().focus();
        for (let index = 0; index < chapterIds.length; index += 1) {
          const link = links.nth(index);
          if (index > 0) await page.keyboard.press('Tab');
          await expect(link).toBeFocused();
          await expect.poll(() => clippedPixels(link)).toBeLessThanOrEqual(1);
          await expect(link).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
          const focusRingOverflow = await link.evaluate((element) => {
            const style = getComputedStyle(element);
            return parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
          });
          expect(
            focusRingOverflow,
            'focus ring is clipped by the scrolling bar',
          ).toBeLessThanOrEqual(0);
        }
      }
    }
  });
}

test('FAQ answers open and close by keyboard', async ({ page }) => {
  for (const locale of locales) {
    for (const product of products) {
      await page.goto(`${locale}/products/${product.id}/`);
      const questions = page.locator('#faq details');
      await expect(questions).toHaveCount(product.locales[locale].faq.length);
      const question = questions.first();
      const summary = question.locator('summary');
      const answer = question.getByText(product.locales[locale].faq[0].answer);
      await expect(summary).toHaveText(product.locales[locale].faq[0].question);
      await expect(answer).toBeHidden();
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(question).toHaveAttribute('open', '');
      await expect(answer).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(question).not.toHaveAttribute('open');
      await expect(answer).toBeHidden();
    }
  }
});

test('download sections reflect availability without dead links', async ({ page }) => {
  for (const locale of locales) {
    const t = ui[locale].product;
    for (const product of products) {
      await page.goto(`${locale}/products/${product.id}/`);
      const downloads = page.locator('#downloads');
      await expect(downloads).toBeVisible();
      await expect(downloads.locator('a[href=""], a[href="#"]')).toHaveCount(0);
      const cards = downloads.locator('article[data-download]');
      await expect(cards).toHaveCount(product.downloads.length);
      for (const [index, entry] of product.downloads.entries()) {
        const card = cards.nth(index);
        await expect(card).toHaveAttribute('data-download', entry.id);
        await expect(
          card.getByRole('heading', { name: entry.label[locale], exact: true }),
        ).toBeVisible();
        if (entry.url) {
          await expect(card).toHaveAttribute('data-state', 'available');
          const link = card.locator('a.button');
          await expect(link).toHaveAttribute('href', entry.url);
          await expect(link).toHaveText(t.download);
          await expect(card.locator('[aria-disabled="true"]')).toHaveCount(0);
        } else {
          await expect(card).toHaveAttribute('data-state', 'pending');
          await expect(card.locator('span.button[aria-disabled="true"]')).toHaveText(
            t.downloadSoon,
          );
          await expect(card.locator('a')).toHaveCount(0);
        }
        if (entry.requirements)
          await expect(card.getByText(entry.requirements[locale], { exact: true })).toBeVisible();
        if (entry.version) await expect(card).toContainText(entry.version);
      }
    }
  }
});

test.describe('product demos', () => {
  for (const product of products) {
    test(`${product.id} demo is decorative, captioned and pausable`, async ({ page }) => {
      for (const locale of locales) {
        await page.goto(`${locale}/products/${product.id}/`);
        const figure = page.locator('figure[data-demo][data-variant="full"]');
        await expect(figure).toHaveCount(1);
        const stage = figure.locator('[data-demo-stage]');
        await expect(stage).toHaveAttribute('aria-hidden', 'true');
        await expect(stage).toHaveAttribute('inert', '');
        expect(
          await stage.evaluate(
            (element) =>
              element.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')
                .length,
          ),
        ).toBe(0);
        const caption = figure.locator('figcaption');
        await expect(caption).toContainText(product.locales[locale].demo.caption);
        await expect(caption).toContainText(ui[locale].demo.illustrative);

        const toggle = figure.locator('button[data-demo-toggle]');
        await figure.scrollIntoViewIfNeeded();
        await expect(page.locator('html')).toHaveClass(/\bmotion-ok\b/);
        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAccessibleName(ui[locale].demo.pause);
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await expect(figure).toHaveClass(/\bis-playing\b/);
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await expect(figure).not.toHaveClass(/\bis-playing\b/);
        await toggle.press('Enter');
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await expect(figure).toHaveClass(/\bis-playing\b/);
      }
    });
  }

  test('reduced motion keeps every demo still without a pause button', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const product of products) {
      await page.goto(`en/products/${product.id}/`);
      await expect(page.locator('html')).not.toHaveClass(/\bmotion-ok\b/);
      const figure = page.locator('figure[data-demo][data-variant="full"]');
      await figure.scrollIntoViewIfNeeded();
      await expect(figure).toHaveAttribute('data-ready', 'true');
      await expect(figure.locator('button[data-demo-toggle]')).toBeHidden();
      await expect(figure).not.toHaveClass(/\bis-playing\b/);
      await expect(figure.locator('[data-scene]').first()).toBeVisible();
    }
  });

  test('home cards show decorative thumbnails without keyboard stops', async ({ page }) => {
    for (const locale of locales) {
      await page.goto(`${locale}/`);
      const thumbs = page.locator('#products .demo-thumb[data-variant="thumb"]');
      await expect(thumbs).toHaveCount(products.length);
      for (const thumb of await thumbs.all()) {
        await expect(thumb).toHaveAttribute('aria-hidden', 'true');
        expect(
          await thumb.evaluate(
            (element) =>
              element.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')
                .length,
          ),
        ).toBe(0);
      }
    }
  });
});

test.describe('product demos without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('show the first scene and hide the rest', async ({ page }) => {
    for (const product of products) {
      await page.goto(`en/products/${product.id}/`);
      const figure = page.locator('figure[data-demo][data-variant="full"]');
      await figure.scrollIntoViewIfNeeded();
      await expect(figure.locator('button[data-demo-toggle]')).toBeHidden();
      await expect(figure).not.toHaveClass(/\bis-playing\b/);
      const scenes = figure.locator('[data-scene]');
      expect(await scenes.count()).toBeGreaterThan(0);
      for (const scene of await scenes.all()) {
        if ((await scene.getAttribute('data-scene')) === '0') await expect(scene).toBeVisible();
        else await expect(scene).toBeHidden();
      }
    }
  });
});

test('English pages show no Chinese outside language-marked elements', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of englishRoutes) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    // Exercise the scripted states too: the open menu relabels its button.
    await page.getByTestId('mobile-menu-toggle').click();
    expect(await chineseOutsideZh(page), route).toEqual([]);
  }
});

test('pages load only first-party resources, including self-hosted fonts', async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const errors = collectConsoleErrors(page);
  const requests = collectRequests(page, origin);
  for (const route of [...routes, notFoundRoute]) {
    await page.goto(route);
    // Count faces the page actually uses. Browsers may reuse cached files, so requests alone vary.
    const loadedFaces = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts]
        .filter((face) => face.status === 'loaded')
        .map((face) => face.family);
    });
    expect(loadedFaces.length, `${route} rendered without the self-hosted fonts`).toBeGreaterThan(
      0,
    );
  }
  // Fonts arrive as woff2 from the site itself, never from a CDN.
  expect(requests.fonts.length, 'no self-hosted woff2 font was requested').toBeGreaterThan(0);
  expect(requests.thirdParty).toEqual([]);
  expect(requests.failed.filter((failure) => !failure.includes(notFoundRoute))).toEqual([]);
  expect(withoutExpected404(errors)).toEqual([]);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`every page fits a ${width}px viewport without sideways scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [...routes, notFoundRoute]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const { overflow, culprits } = await horizontalOverflow(page);
      expect(
        overflow,
        `${route} overflows at ${width}px: ${culprits.join(', ')}`,
      ).toBeLessThanOrEqual(1);
    }
  });
}

test('the focused skip link is visible and Enter reaches main content', async ({ page }) => {
  for (const locale of locales) {
    await page.goto(`${locale}/`);
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveText(ui[locale].nav.skip);
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeInViewport();
    await expect(skipLink).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
  }
});

test('Tab navigation exposes visible focus in document order', async ({ page, browserName }) => {
  // Windows WebKit skips anchors even in a minimal HTML document, including with Alt+Tab.
  // Preserve the real Tab test on Linux CI and test focused-link activation separately everywhere.
  // https://github.com/microsoft/playwright/issues/5609
  skipWindowsWebKitTabbing(browserName);
  for (const route of ['en/', `en/products/${lastProduct.id}/`]) {
    await page.goto(route);
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
    await expect(focused).toHaveAttribute('href', '#main');
    await expect(focused).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();

    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      expect(
        await page.locator(':focus').evaluate((element) => element.matches(':focus-visible')),
      ).toBe(true);
      await expect(page.locator(':focus')).toHaveCSS('outline-style', /solid|dashed|dotted|double/);
    }
  }
});

test('links to a chapter land on it with motion allowed, in both languages', async ({ page }) => {
  // Regression: smooth scrolling during load used to leave visitors at the top of the page.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const locale of locales)
    for (const product of products) {
      await page.goto(`${locale}/products/${product.id}/?from=share#downloads`);
      await expect(page.locator('#downloads')).toBeInViewport();
    }
});

test('reduced-motion preference disables continuous motion and smooth scrolling', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['en/', ...products.map((product) => `en/products/${product.id}/`)]) {
    await page.goto(route);
    await expect(page.locator('html')).not.toHaveClass(/\bmotion-ok\b/);
    const motion = await page.evaluate(() => {
      const elements = [
        document.documentElement,
        ...Array.from(document.querySelectorAll('body *')),
      ];
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
    expect(motion, route).toEqual([]);
  }
});

test('all internal links and images resolve under the configured base path', async ({
  page,
  request,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const basePath = new URL(baseURL!).pathname;
  const errors = collectConsoleErrors(page);
  const requests = collectRequests(page, origin);
  const links = new Set<string>();
  for (const route of [...routes, notFoundRoute]) {
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
      if (url.pathname === new URL(page.url()).pathname) {
        if (url.hash)
          await expect(page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`)).toHaveCount(
            1,
          );
        continue;
      }
      url.hash = '';
      links.add(url.href);
    }
  }
  for (const href of links) {
    const response = await request.get(href);
    expect(response.ok(), `${response.status()} ${href}`).toBe(true);
  }
  expect(requests.failed.filter((failure) => !failure.includes(notFoundRoute))).toEqual([]);
  expect(withoutExpected404(errors)).toEqual([]);
});

test('license notices link to the published license texts', async ({ page, request }) => {
  for (const locale of locales) {
    await page.goto(`${locale}/licenses/`);
    await expect(page.locator('h1')).toHaveText(ui[locale].footer.licenses);
    const files = page.locator('main a[href$=".txt"]');
    expect(await files.count()).toBeGreaterThan(0);
    for (const href of await files.evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    )) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
      expect((await response.text()).length, href).toBeGreaterThan(200);
    }
    await expect(
      page.locator('footer').getByRole('link', { name: ui[locale].footer.licenses }),
    ).toHaveAttribute('href', new RegExp(`/${locale}/licenses/$`));
  }
});

test('missing pages return the bilingual 404 with both homes', async ({ page, baseURL }) => {
  const response = await page.goto(notFoundRoute);
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('main#main')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(ui.zh.notFound.title);
  await expect(page.locator('main p[lang="en"]')).toContainText(ui.en.notFound.title);
  for (const product of products)
    for (const locale of locales)
      await expect(
        page.locator(
          `main a[href="${new URL(`${locale}/products/${product.id}/`, baseURL).pathname}"]`,
        ),
      ).toContainText(product.locales[locale].name);
  await expect(page.locator(`main a[href="${new URL('zh/', baseURL).pathname}"]`)).toHaveText(
    ui.zh.notFound.home,
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectNoSeriousAccessibilityIssues(page);
  await page.locator(`main a[href="${new URL('en/', baseURL).pathname}"]`).click();
  await expect(page).toHaveURL(/\/en\/$/);
});
