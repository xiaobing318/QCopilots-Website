import type { Locale } from '../content/types.ts';

export const locales = ['zh', 'en'] as const satisfies readonly Locale[];

export const htmlLang = (locale: Locale) => (locale === 'zh' ? 'zh-CN' : 'en');
export const ogLocale = (locale: Locale) => (locale === 'zh' ? 'zh_CN' : 'en_US');
export const otherLocale = (locale: Locale): Locale => (locale === 'zh' ? 'en' : 'zh');

/** Fills {placeholders} in UI strings, e.g. format('Explore {name}', { name }). */
export function format(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** Inline custom properties for a product's accent colours. */
export function themeStyle(theme: { accent: string; accentInk: string; wash: string }) {
  return `--product-accent:${theme.accent};--product-accent-ink:${theme.accentInk};--product-wash:${theme.wash}`;
}
