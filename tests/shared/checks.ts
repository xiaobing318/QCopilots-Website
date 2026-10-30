import type { Page } from '@playwright/test';

/**
 * Text and labels in Chinese script that are not inside an element marked lang="zh-*".
 * Used on English pages, where Chinese is only allowed for things like the language switch.
 */
export function chineseOutsideZh(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const han = /\p{Script=Han}/u;
    const problems: string[] = [];
    const allowed = (element: Element) =>
      (element.closest('[lang]')?.getAttribute('lang') ?? '').toLowerCase().startsWith('zh');
    const describe = (element: Element) =>
      [element.tagName.toLowerCase(), element.id && `#${element.id}`, ...element.classList]
        .filter(Boolean)
        .join('.');
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      const text = node.textContent ?? '';
      if (!parent || parent.closest('script, style, noscript, template')) continue;
      if (han.test(text) && !allowed(parent))
        problems.push(`${describe(parent)}: "${text.trim().slice(0, 60)}"`);
    }
    const labelled = '[alt], [title], [aria-label], [placeholder], meta[content]';
    for (const element of document.querySelectorAll(labelled)) {
      const names = ['alt', 'title', 'aria-label', 'placeholder'];
      if (element.tagName === 'META') names.push('content');
      for (const name of names) {
        const value = element.getAttribute(name);
        if (value && han.test(value) && !allowed(element))
          problems.push(`${describe(element)} ${name}="${value.slice(0, 60)}"`);
      }
    }
    return problems;
  });
}

/**
 * Address and subject of a mailto: link, or null for anything else.
 * A "+" stays a "+": mail apps show it literally, so subjects must encode spaces as %20.
 */
export function parseMailto(href: string | null): { address: string; subject?: string } | null {
  const match = /^mailto:([^?#]*)(?:\?([^#]*))?$/i.exec(href ?? '');
  if (!match) return null;
  const fields = new Map(
    (match[2] ?? '')
      .split('&')
      .filter(Boolean)
      .map((pair) => {
        const [key, value = ''] = pair.split('=');
        return [decodeURIComponent(key).toLowerCase(), decodeURIComponent(value)] as const;
      }),
  );
  return { address: decodeURIComponent(match[1]), subject: fields.get('subject') };
}

/** How far the page scrolls sideways, with the widest elements that stick out to help debugging. */
export function horizontalOverflow(page: Page): Promise<{ overflow: number; culprits: string[] }> {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const culprits = [...document.querySelectorAll('body *')]
      .map((element) => ({ element, right: element.getBoundingClientRect().right }))
      .filter(({ right }) => right > width + 1)
      .sort((a, b) => b.right - a.right)
      .slice(0, 5)
      .map(({ element, right }) => {
        const name = [element.tagName.toLowerCase(), ...element.classList].join('.');
        return `${name} ends at ${Math.round(right)}px`;
      });
    return { overflow: document.documentElement.scrollWidth - window.innerWidth, culprits };
  });
}

const abortedByNavigation = /ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i;

export interface RequestLog {
  /** Requests to any origin other than the site's own. */
  thirdParty: string[];
  /** Same-origin requests that failed or answered with an HTTP error. */
  failed: string[];
  /** Web fonts that loaded successfully from the site's own origin. */
  fonts: string[];
}

/** Records the requests a visitor's browser makes while the page is open. */
export function collectRequests(page: Page, origin: string): RequestLog {
  const log: RequestLog = { thirdParty: [], failed: [], fonts: [] };
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin)
      log.thirdParty.push(request.url());
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin !== origin) return;
    if (response.status() >= 400) log.failed.push(`HTTP ${response.status()} ${response.url()}`);
    else if (url.pathname.endsWith('.woff2')) log.fonts.push(response.url());
  });
  page.on('requestfailed', (request) => {
    const error = request.failure()?.errorText ?? 'failed';
    if (new URL(request.url()).origin === origin && !abortedByNavigation.test(error))
      log.failed.push(`${error} ${request.url()}`);
  });
  return log;
}

/** Records console errors and uncaught exceptions. */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console error: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page error: ${error.message}`));
  return errors;
}
