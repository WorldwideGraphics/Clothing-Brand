// Shared catalogue used by the homepage, /category/[slug]/ archive pages, and /product/[slug]/ pages.

import { CHIKANKARI_CATEGORY, CHIKANKARI_PRODUCTS } from './chikankari-products.js';
import CATALOG_PRODUCTS from './catalog-products.json';
import { SUBCATEGORIES } from './subcategories.js';

export const CATEGORIES = [
  {
    slug: 'lehenga',
    name: 'Lehengas',
    image: '/images/product_Category/lehenga.jpg',
    badge: 'Bridal & Party Wear',
    blurb: 'Statement bridal and party lehengas, hand-embroidered and finished to your measurements.',
  },
  {
    slug: 'saree',
    name: 'Sarees',
    image: '/images/product_Category/Saree.jpg',
    badge: 'Pure Handloom',
    blurb: 'Handwoven sarees spanning chikankari, Kanjivaram, Parsi Gara and other heritage weaves.',
  },
  {
    slug: 'anarkali-peshwas',
    name: 'Anarkali Suits',
    image: '/images/product_Category/Anarkali_&_Peshwas.jpg',
    badge: 'Royal Silhouettes',
    blurb: 'Floor-sweeping Anarkalis and Peshwas cuts, finished with fine hand embroidery.',
  },
  {
    slug: 'dupattas',
    name: 'Dupattas',
    image: '/images/product_Category/Dupattas.jpg',
    badge: 'Statement Drapes',
    blurb: "Statement dupattas to layer over any silhouette, from sheer georgettes to zari-bordered silks.",
  },
  {
    slug: 'suits',
    name: 'Straight Suits',
    image: '/images/product_Category/Suits.jpg',
    badge: 'Everyday & Festive',
    blurb: 'Comfortable kurta sets for everyday wear and festive occasions alike.',
  },
  {
    slug: 'winter-shawls',
    name: 'Winter Shawls',
    image: '/images/product_Category/Winter_Shawls.jpg',
    badge: 'Pashmina & Wool',
    blurb: 'Pashmina and wool shawls, hand-embroidered for elegant cold-weather layering.',
  },
  CHIKANKARI_CATEGORY,
];

const ORIGINAL_PRODUCTS = [
  ...CHIKANKARI_PRODUCTS,
  {
    slug: 'mukaish-pure-chanderi-saree',
    name: 'Mukaish Pure Chanderi Saree',
    sub: 'Hand-block, silver mukaish work',
    badge: 'Pure Handloom Weave',
    badgeClass: '',
    category: 'Saree',
    categorySlug: 'saree',
    swatch: 'swatch-1',
    image: null,
    priceNow: 'Rs.18,500',
    priceOld: 'Rs.22,000',
    tagline: 'Hand-block printed Chanderi silk-cotton with hand-embroidered silver mukaish work and a fine zari border.',
    description: 'Woven on traditional handlooms in Chanderi, Madhya Pradesh, this saree pairs a feather-light silk-cotton base with intricate hand-embroidered silver mukaish (metallic thread) work scattered across the body. A refined zari border and pallu make it equally suited to festive daytime functions and understated evening events.',
    details: { Fabric: 'Pure Chanderi silk-cotton', Work: 'Hand mukaish embroidery', Length: '5.5 m saree + 0.8 m blouse piece', Blouse: 'Unstitched, made-to-measure on request', Occasion: 'Festive, daytime functions' },
    highlights: ['100% handloom, GI-tagged Chanderi weave', 'Hand-applied silver mukaish work', 'Comes with an unstitched blouse piece', 'Complimentary fall & edging on a home visit'],
  },
  {
    slug: 'pearl-chikankari-anarkali',
    name: 'Pearl Chikankari Anarkali',
    sub: 'Georgette, hand-shadow work',
    badge: 'New Arrival',
    badgeClass: 'new',
    category: 'Anarkali & Peshwas',
    categorySlug: 'anarkali-peshwas',
    swatch: 'swatch-2',
    image: '/images/bridal-drape.png',
    priceNow: 'Rs.24,900',
    priceOld: null,
    tagline: 'Flowing georgette Anarkali finished with fine Lucknowi shadow-work embroidery in pearl and ivory tones.',
    description: "Cut in a floor-sweeping Anarkali silhouette, this piece is hand-embroidered by Lucknow's chikankari artisans using the delicate shadow-work technique, where stitches on the reverse of sheer georgette create a soft, glowing motif on the right side. Layered with a matching dupatta and inner slip.",
    details: { Fabric: 'Pure georgette with silk lining', Work: 'Hand shadow-work chikankari', Length: 'Floor length, with dupatta', Blouse: 'Stitched, sizes XS–XXL', Occasion: 'Festive, receptions' },
    highlights: ['Hand-embroidered by Lucknowi karigars', 'Includes matching dupatta & inner slip', 'Stitched — available in your exact size', 'Complimentary alterations on a home visit'],
  },
  {
    slug: 'midnight-wine-parsi-gara',
    name: 'Midnight Wine Parsi Gara',
    sub: 'Pure silk, hand-embroidered gara',
    badge: 'Bridal Edit',
    badgeClass: 'bridal',
    category: 'Saree',
    categorySlug: 'saree',
    swatch: 'swatch-3',
    image: null,
    priceNow: 'Rs.32,000',
    priceOld: null,
    tagline: 'Deep wine silk sari hand-embroidered in the century-old Parsi Gara tradition of Chinese-influenced florals.',
    description: 'A rare heritage weave, hand-embroidered by artisans trained in the Parsi Gara technique — satin-stitch florals, birds and cranes worked in silk thread on pure mulberry silk. Each piece takes several weeks to complete and carries the story of a craft passed down through generations.',
    details: { Fabric: 'Pure mulberry silk', Work: 'Hand Gara embroidery', Length: '5.5 m saree + 0.8 m blouse piece', Blouse: 'Unstitched, made-to-measure on request', Occasion: 'Wedding functions, receptions' },
    highlights: ['Authentic heritage Parsi Gara embroidery', 'Rare piece — limited to one of a kind', 'Comes with an unstitched blouse piece', 'Provenance card detailing the artisan story'],
  },
  {
    slug: 'rose-quartz-gota-patti-set',
    name: 'Rose Quartz Gota Patti Set',
    sub: 'Cotton silk, gota patti border',
    badge: 'Rare Piece',
    badgeClass: 'rare',
    category: 'Suits',
    categorySlug: 'suits',
    swatch: 'swatch-4',
    image: null,
    priceNow: 'Rs.16,200',
    priceOld: null,
    tagline: 'A soft rose-quartz cotton-silk kurta set trimmed in Jaipuri gota patti, gift-boxed and ready to travel.',
    description: 'This kurta-and-dupatta set is finished with hand-applied gota patti — gold ribbon folded and stitched into floral motifs — along the neckline, sleeves and dupatta border. Presented in our signature gift box, it makes for a thoughtful festive or wedding-guest gift.',
    details: { Fabric: 'Cotton silk', Work: 'Hand gota patti border', Length: 'Kurta, dupatta & bottom set', Blouse: 'N/A — stitched kurta, sizes XS–XL', Occasion: 'Festive gifting, casual functions' },
    highlights: ['Hand-applied Jaipuri gota patti trim', 'Presented in a signature gift box', 'Stitched — available in your exact size', 'Ideal as a festive or wedding-guest gift'],
  },
  {
    slug: 'noor-mahal-floral-chikankari',
    name: 'Noor Mahal Floral Chikankari',
    sub: 'Mulmul cotton, pastel floral',
    badge: 'Chikankari Story',
    badgeClass: '',
    category: 'Saree',
    categorySlug: 'saree',
    swatch: 'swatch-5',
    image: null,
    priceNow: 'Rs.21,800',
    priceOld: null,
    tagline: 'Airy mulmul cotton saree hand-embroidered with a pastel floral chikankari spread, perfect for daytime wear.',
    description: 'Soft, breathable mulmul cotton carries an all-over floral chikankari spread worked entirely by hand in pastel thread tones. Lightweight enough for long daytime functions, with the fine detailing that makes chikankari an heirloom craft.',
    details: { Fabric: 'Pure mulmul cotton', Work: 'Hand chikankari, all-over floral', Length: '5.5 m saree + 0.8 m blouse piece', Blouse: 'Unstitched, made-to-measure on request', Occasion: 'Daytime functions, casual festive wear' },
    highlights: ['All-over hand chikankari embroidery', 'Lightweight mulmul, ideal for daywear', 'Comes with an unstitched blouse piece', 'Complimentary fall & edging on a home visit'],
  },
  {
    slug: 'shahi-zardozi-bridal-lehenga',
    name: 'Shahi Zardozi Bridal Lehenga',
    sub: 'Raw silk, gold zardozi work',
    badge: 'Bridal Wear',
    badgeClass: 'bridal',
    category: 'Lehenga',
    categorySlug: 'lehenga',
    swatch: 'swatch-6',
    image: null,
    priceNow: 'Rs.68,500',
    priceOld: null,
    tagline: 'A statement bridal lehenga in raw silk, hand-embroidered with dense gold zardozi work across the skirt and blouse.',
    description: 'Our most elaborate bridal piece — raw silk worked densely in gold zardozi, dabka and sequin embroidery by master karigars over several weeks. Includes a matching blouse, dupatta and can be paired with our on-site tailor for a final fitting during your home visit.',
    details: { Fabric: 'Raw silk with net dupatta', Work: 'Hand zardozi, dabka & sequin', Length: 'Lehenga, blouse & dupatta set', Blouse: 'Stitched, final fitting on-site', Occasion: 'Wedding, sangeet' },
    highlights: ['Dense hand zardozi embroidery', 'Includes blouse, skirt & dupatta', 'Final fitting with our on-site master tailor', 'Provenance card detailing the artisan story'],
  },
  {
    slug: 'gulbadan-emerald-kanjivaram',
    name: 'Gulbadan Emerald Kanjivaram',
    sub: 'Pure silk, temple border zari',
    badge: 'Kanjivaram Silk',
    badgeClass: '',
    category: 'Saree',
    categorySlug: 'saree',
    swatch: 'swatch-7',
    image: null,
    priceNow: 'Rs.34,900',
    priceOld: null,
    tagline: 'Emerald green pure silk Kanjivaram with a woven temple border and contrast zari pallu, from Kanchipuram.',
    description: 'Handwoven by master weavers in Kanchipuram, this pure mulberry silk saree carries the signature temple-border motif in rich gold zari, with a contrasting pallu woven on traditional pit looms. A true heirloom weave that only improves with age.',
    details: { Fabric: 'Pure Kanjivaram mulberry silk', Work: 'Woven temple border, zari pallu', Length: '6.3 m saree, no separate blouse piece', Blouse: 'Unstitched, made-to-measure on request', Occasion: 'Weddings, traditional functions' },
    highlights: ['Handwoven on traditional Kanchipuram looms', 'Woven (not printed) temple border motif', 'Heirloom-grade silk, improves with age', 'Complimentary fall & edging on a home visit'],
  },
  {
    slug: 'sunehri-gota-patti-kurta',
    name: 'Sunehri Gota Patti Kurta',
    sub: 'Chanderi silk, gold gota trim',
    badge: 'Festive Pick',
    badgeClass: '',
    category: 'Suits',
    categorySlug: 'suits',
    swatch: 'swatch-8',
    image: null,
    priceNow: 'Rs.19,200',
    priceOld: null,
    tagline: 'A breezy Chanderi silk kurta trimmed in gold gota patti, styled with straight pants and a matching dupatta.',
    description: 'Cut for effortless festive dressing, this Chanderi silk kurta set is trimmed in gold gota patti along the neckline and hem, paired with straight-fit pants and a lightweight dupatta. Comfortable enough for a full day of celebrations.',
    details: { Fabric: 'Chanderi silk', Work: 'Hand gota patti trim', Length: 'Kurta, pants & dupatta set', Blouse: 'N/A — stitched kurta, sizes XS–XL', Occasion: 'Festive day functions, mehendi' },
    highlights: ['Hand-applied gold gota patti trim', 'Lightweight Chanderi silk, all-day comfort', 'Stitched — available in your exact size', 'Complimentary alterations on a home visit'],
  },
];

export const PRODUCTS = [...ORIGINAL_PRODUCTS, ...CATALOG_PRODUCTS];

// Homepage "Customer Favourites" only shows a curated pick, not the full catalogue —
// the full per-category list lives on /category/[slug]/.
const FEATURED_CHIKANKARI_SLUGS = [
  'black-mukaish-chikankari-suit',
  'ivory-floral-mirror-work-chikankari-suit',
  'peach-and-soft-brown-chikankari-suit',
  'olive-green-chikankari-suit',
  'multicolour-pastel-paisley-vine-chikankari-suit',
  'white-mukaish-chikankari-suit',
];

export const FEATURED_PRODUCTS = [
  ...ORIGINAL_PRODUCTS.filter(p => p.categorySlug !== 'lucknowi-chikankari'),
  ...ORIGINAL_PRODUCTS.filter(p => FEATURED_CHIKANKARI_SLUGS.includes(p.slug)),
];

export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug) || null;
}

export function getCategoryBySlug(slug) {
  return CATEGORIES.find(c => c.slug === slug) || null;
}

export function getProductsByCategory(categorySlug) {
  return PRODUCTS.filter(p => p.categorySlug === categorySlug);
}

export function getSubcategoriesByCategory(categorySlug) {
  return SUBCATEGORIES.filter(subcategory => subcategory.parentSlug === categorySlug);
}

export function getSubcategoryBySlug(categorySlug, subcategorySlug) {
  return SUBCATEGORIES.find(subcategory =>
    subcategory.parentSlug === categorySlug && subcategory.slug === subcategorySlug
  ) || null;
}

export function getProductsBySubcategory(subcategorySlug) {
  return PRODUCTS.filter(product => product.subcategorySlugs?.includes(subcategorySlug));
}

export function getRelatedProducts(product, count = 4) {
  const sameCategory = PRODUCTS.filter(p => p.slug !== product.slug && p.categorySlug === product.categorySlug);
  const others = PRODUCTS.filter(p => p.slug !== product.slug && p.categorySlug !== product.categorySlug);
  return [...sameCategory, ...others].slice(0, count);
}
