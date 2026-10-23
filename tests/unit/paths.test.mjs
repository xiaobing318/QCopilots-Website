import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(normalizeBase('/a//b'), '/a/b/');
  for (const value of ['https://example.com', '/../private/', '/x?y', '/a\\b', '/%2e%2e/'])
    assert.throws(() => normalizeBase(value));
  assert.throws(() => withBase('https://example.com'));
  assert.throws(() => localePath('fr'));
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
