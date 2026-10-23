import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBasePath } from '../../scripts/runtime/config.mjs';
import {
  normalizeBase,
  withBase,
  localePath,
  normalizeSite,
  canonicalUrl,
} from '../../src/lib/site.mjs';

test('root and project deploy paths generate the same language/product relationship', () => {
  for (const base of ['/', '/QCopilots-Website/']) {
    const zh = localePath('zh', 'products/qcopilots', base);
    const en = localePath('en', '/products/qcopilots/', base);
    assert.equal(zh.replace('/zh/', '/en/'), en);
    assert.equal(withBase('/images/map.webp', base), `${base}images/map.webp`);
    assert.equal(canonicalUrl(zh, 'https://example.com'), `https://example.com${zh}`);
  }
});
test('base paths are normalized once and do not admit external or traversal paths', () => {
  assert.equal(normalizeBase('/a/b'), '/a/b/');
  for (const value of [
    'https://example.com',
    '/../private/',
    '/x?y',
    '/a\\b',
    '/%2e%2e/',
    '/a//b',
    '/docs.v1/',
    '/team&docs/',
    '/docs#chapter',
    '/with space/',
    '/中文/',
    '',
    null,
    42,
  ]) {
    assert.throws(() => normalizeBase(value), /BASE_PATH/);
    assert.throws(() => normalizeBasePath(value), /basePath/);
  }
  assert.throws(() => withBase('https://example.com'));
  assert.throws(() => localePath('fr'));
});
test('build and native deployment accept the same URL-safe prefixes', () => {
  for (const value of ['/', '/QCopilots-Website', '/QCopilots-Website/', '/team/docs_2026/']) {
    assert.equal(normalizeBase(value), normalizeBasePath(value));
    const url = canonicalUrl(
      localePath('en', 'products/qcopilots-search', value),
      'https://example.com',
    );
    assert.equal(new URL(url).pathname, `${normalizeBasePath(value)}en/products/qcopilots-search/`);
    assert.doesNotMatch(url, /[&<>"']/);
  }
});
test('site origin configuration separates path prefix and rejects credentials', () => {
  assert.equal(normalizeSite('https://example.com/'), 'https://example.com');
  for (const value of [
    'https://example.com/sub/',
    'https://user:pass@example.com',
    'file:///tmp',
    'https://example.com/?x',
  ])
    assert.throws(() => normalizeSite(value));
});
