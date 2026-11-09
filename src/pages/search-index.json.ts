import { PRODUCTS } from '../data/products.js';

export function GET() {
  const searchIndex = PRODUCTS.map(product => ({
    slug: product.slug,
    name: product.name,
    sub: product.sub,
    badge: product.badge,
    badgeClass: product.badgeClass,
    category: product.category,
    categorySlug: product.categorySlug,
    swatch: product.swatch,
    image: product.images?.[0] || product.image || null,
    imageAlt: product.imageAlt,
    availabilityLabel: product.availabilityLabel,
    available: product.available,
    searchText: [
      product.name,
      product.sub,
      product.badge,
      product.category,
      ...Object.values(product.details || {}),
      ...(product.tags || []),
    ].filter(Boolean).join(' ').toLocaleLowerCase(),
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
