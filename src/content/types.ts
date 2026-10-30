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
  /** A small table, e.g. the answer to a follow-up question. */
  rows?: readonly DemoRow[];
  /** Real result count when the demo shows only the first few results. */
  total?: number;
}

export interface DemoRow {
  label: string;
  value: string;
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

/** A real screenshot from a recorded run. `file` is relative to src/assets/real-runs/. */
export interface RealRunImage {
  file: string;
  alt: string;
  caption: string;
}

/** A recorded run of the real product, shown next to the illustrated demo. */
export interface RealRun {
  title: string;
  intro: string;
  /** Exactly what was typed, in order. */
  prompts: readonly string[];
  /** What the product did, summarised from the run. */
  steps: readonly string[];
  /** Real numbers from the run only. */
  facts: readonly Fact[];
  images: readonly RealRunImage[];
  /** Product build and system the run used. */
  version: string;
  /** ISO date (YYYY-MM-DD), identical in both locales. */
  recordedOn: string;
  /** Data source, where the model ran, and how the screenshots were edited. */
  note: string;
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
  realRun?: RealRun;
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
