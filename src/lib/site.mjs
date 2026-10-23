/** Normalize the one deployment prefix used by all URLs. */
export function normalizeBase(value = '/') {
  if (typeof value !== 'string' || !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]*\/?$/.test(value)) {
    throw new Error('BASE_PATH must be / or a URL path such as /QCopilots-Website/.');
  }
  return value === '/' ? '/' : `/${value.split('/').filter(Boolean).join('/')}/`;
}

export function withBase(path = '', base = '/') {
  const normalized = normalizeBase(base);
  if (/^(?:[a-z]+:)?\/\//iu.test(path)) throw new Error('Expected a site-relative path.');
  return `${normalized}${path.replace(/^\/+/, '')}`;
}

export function localePath(locale, slug = '', base = '/') {
  if (!['zh', 'en'].includes(locale)) throw new Error('Unsupported locale.');
  return withBase(`${locale}/${slug.replace(/^\/+|\/+$/g, '')}${slug ? '/' : ''}`, base);
}

export function normalizeSite(value = 'https://xiaobing318.github.io') {
  const url = new URL(value);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error('SITE_URL must be an http(s) origin. Put the path prefix in BASE_PATH.');
  }
  return url.origin;
}

export function canonicalUrl(path, site) {
  return new URL(path, normalizeSite(site)).href;
}

export const basePath = normalizeBase(process.env.BASE_PATH || '/');
export const siteUrl = normalizeSite(process.env.SITE_URL || 'https://xiaobing318.github.io');

export function asset(path) {
  return withBase(path, basePath);
}

export function route(locale, slug = '') {
  return localePath(locale, slug, basePath);
}
