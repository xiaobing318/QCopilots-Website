import type { DemoKey } from '../../content/demos.ts';
import type GenericDemo from './GenericDemo.astro';
import QCopilotsDemo from './QCopilotsDemo.astro';
import SearchDemo from './SearchDemo.astro';

/** Every key in src/content/demos.ts must map to a component with GenericDemo's props. */
export const demoRegistry: Record<DemoKey, typeof GenericDemo> = {
  'qcopilots-qgis': QCopilotsDemo,
  'search-window': SearchDemo,
};
