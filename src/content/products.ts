import type { Product } from './types.ts';
import qcopilots from './products/qcopilots.ts';
import qcopilotsSearch from './products/qcopilots-search.ts';

export type * from './types.ts';

/**
 * Product registry. To add a product, create src/content/products/<id>.ts and import it here.
 * Routes, navigation, the home page, the sitemap and the content checks pick it up automatically.
 */
export const products: readonly Product[] = [qcopilots, qcopilotsSearch].toSorted(
  (a, b) => a.order - b.order,
);

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}
