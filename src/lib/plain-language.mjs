/**
 * Copy is written for everyday users, so addresses, ports, keys, links and local user paths stay out.
 * Shared by scripts/check-content.mjs (source copy) and scripts/verify-build.mjs (built pages).
 * Media times such as "0:50" are fine, so there is no generic ":port" pattern.
 */
export const technicalTerms = new RegExp(
  [
    String.raw`127\.0\.0\.1`,
    String.raw`\b(?:\d{1,3}\.){3}\d{1,3}\b`,
    'localhost',
    String.raw`\b8282\b`,
    'llama',
    'gguf',
    'bearer',
    String.raw`\btokens?\b`,
    String.raw`\bapi[ _-]?keys?\b`,
    'cpolar',
    '令牌',
    '密钥',
    '端口',
    String.raw`C:\\Users`,
    'AppData',
    'QGISPackages',
    String.raw`https?://`,
  ].join('|'),
  'i',
);
