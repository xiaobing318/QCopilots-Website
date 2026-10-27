import type { DemoKey } from './demos.ts';
import type { IconName } from './icons.ts';

export type Locale = 'zh' | 'en';
export type Localized<T> = Record<Locale, T>;
export type ProductStatus = 'available' | 'coming-soon';

export interface ContentItem {
  title: string;
  description: string;
}

export interface Highlight extends ContentItem {
  icon: IconName;
}

export interface ExampleItem {
  prompt: string;
  outcome: string;
}

export interface Fact {
  value: string;
  label: string;
}

export interface Requirement {
  label: string;
  value: string;
}

/** One illustrated moment of a demo. Demos pick the fields they need. */
export interface DemoScene {
  query: string;
  steps?: readonly string[];
  reply?: string;
  results?: readonly DemoResult[];
}

export interface DemoResult {
  title: string;
  meta: string;
  kind: 'text' | 'pdf' | 'image' | 'audio' | 'video' | 'code' | 'layer';
  match?: 'semantic' | 'keyword' | 'both';
}

/** All visible demo text lives in content so it follows the page language. */
export interface DemoCopy {
  caption: string;
  windowTitle: string;
  placeholder: string;
  labels: Readonly<Record<string, string>>;
  scenes: readonly DemoScene[];
}

export interface ProductContent {
  name: string;
  /** Short kind of product, e.g. "Inside QGIS" or "Desktop app". */
  category: string;
  tagline: string;
  summary: string;
  seo: { title: string; description: string };
  card: { headline: string; description: string; platforms: string };
  highlights: readonly Highlight[];
  examples: { title: string; intro: string; items: readonly ExampleItem[] };
  facts?: { title: string; note: string; items: readonly Fact[] };
  steps: { title: string; items: readonly ContentItem[] };
  privacy: { title: string; intro: string; points: readonly ContentItem[]; note?: string };
  requirements: readonly Requirement[];
  faq: readonly { question: string; answer: string }[];
  downloads: { title: string; description: string };
  demo: DemoCopy;
}

export interface DownloadEntry {
  id: string;
  platform: 'windows' | 'macos' | 'linux' | 'all';
  label: Localized<string>;
  url: string | null;
  requirements?: Localized<string>;
  architecture?: string;
  version?: string;
}

export interface ProductTheme {
  /** Decorative accent: rules, icons, demo highlights. */
  accent: string;
  /** Text-safe accent with at least 4.5:1 contrast on ivory and white. */
  accentInk: string;
  /** Pale wash for bands and demo stages. */
  wash: string;
}

export interface Product {
  /** Stable URL slug. Changing it breaks shared links. */
  id: string;
  order: number;
  status: ProductStatus;
  /** license: set when the icon comes from elsewhere, listed on the licenses page. */
  icon: {
    src: string;
    width: number;
    height: number;
    license?: { name: string; file: string };
  };
  theme: ProductTheme;
  /** Coded UI demo. Products without one use the generic demo. */
  demo?: DemoKey;
  links?: { releases?: string; source?: string; license?: string };
  locales: Localized<ProductContent>;
  downloads: readonly DownloadEntry[];
}
