/** Coded product demos. Add a key here and register its component in src/components/demos/registry.ts. */
export const demoKeys = ['qcopilots-qgis', 'search-window'] as const;
export type DemoKey = (typeof demoKeys)[number];
