import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBCATEGORIES } from '../src/data/subcategories.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'src', 'data', 'dress365-products.json');
const imageRoot = path.join(root, 'public', 'images', 'dress365days');
const storeUrl = 'https://www.dress365days.com';
const pageSize = 250;
const concurrency = 24;
const targetWidth = 900;

const categories = {
  lehenga: { slug: 'lehenga', name: 'Lehenga' },
  saree: { slug: 'saree', name: 'Saree' },
  anarkali: { slug: 'anarkali-peshwas', name: 'Anarkali & Peshwas' },
  dupatta: { slug: 'dupattas', name: 'Dupattas' },
  suit: { slug: 'suits', name: 'Suits' },
};

function getCategory(product) {
  const type = (product.product_type || '').trim().toLowerCase();
  if (/fabric/.test(type)) return null;
  const matchType = (pattern, category) => pattern.test(type) ? category : null;
  const typedCategory =
    matchType(/lehenga/, 'lehenga') ||
    matchType(/saree/, 'saree') ||
    matchType(/anarkali/, 'anarkali') ||
    matchType(/dupatta/, 'dupatta') ||
    matchType(/suit|kurti|top/, 'suit');
  if (type) return typedCategory;

  const text = `${product.title} ${(product.tags || []).join(' ')}`.toLowerCase();
  if (/fabric|lace|border|blouse piece|stitching|potli|\bbag\b|jacket|\btop\b/.test(text)) return null;
  if (/lehenga/.test(text)) return 'lehenga';
  if (/saree/.test(text)) return 'saree';
  if (/anarkali/.test(text)) return 'anarkali';
  if (/(kurta|kurti).*(dupatta).*(set)|(dupatta).*(kurta|kurti).*(set)|\bsuit\b/.test(text)) return 'suit';
  if (/dupatta/.test(text)) return 'dupatta';
  return null;
}

function cleanText(html = '') {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(?:p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"')
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `Rs.${formatted}`;
}

function getVariants(product) {
  return (product.variants || []).map(variant => ({
    title: cleanText(variant.title || '') === 'Default Title'
      ? 'Standard'
      : cleanText(variant.title || '') || 'Standard',
    price: formatPrice(variant.price),
    compareAtPrice: formatPrice(variant.compare_at_price),
    available: Boolean(variant.available),
    sku: cleanText(variant.sku || ''),
  }));
}

function getPriceRange(variants, field) {
  const prices = [...new Set(variants.map(variant => variant[field]).filter(Boolean))];
  if (!prices.length) return null;
  if (prices.length === 1) return prices[0];
  const sortedPrices = prices
    .map(price => ({ price, amount: Number(price.replace(/[^\d.]/g, '')) }))
    .sort((a, b) => a.amount - b.amount);
  return `${sortedPrices[0].price}–${sortedPrices[sortedPrices.length - 1].price}`;
}

async function fetchProducts() {
  const products = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(`${storeUrl}/products.json?limit=${pageSize}&page=${page}`);
    if (!response.ok) throw new Error(`Catalog request failed on page ${page}: ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.products)) throw new Error(`Catalog page ${page} did not contain a products array`);
    products.push(...payload.products);
    console.log(`Fetched catalog page ${page}: ${payload.products.length} products`);
    if (payload.products.length < pageSize) break;
  }
  return products;
}

async function fetchSubcategoryMemberships() {
  const handles = [...new Set(SUBCATEGORIES.flatMap(subcategory => subcategory.sourceCollections))];
  const memberships = new Map(handles.map(handle => [handle, new Set()]));
  for (const handle of handles) {
    for (let page = 1; ; page += 1) {
      const response = await fetch(
        `${storeUrl}/collections/${handle}/products.json?limit=${pageSize}&page=${page}&fields=id`
      );
      if (!response.ok) throw new Error(`Collection request failed for ${handle}: ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.products)) {
        throw new Error(`Collection ${handle} did not contain a products array`);
      }
      for (const product of payload.products) memberships.get(handle).add(String(product.id));
      if (payload.products.length < pageSize) break;
    }
    console.log(`Fetched subcategory membership: ${handle} (${memberships.get(handle).size} products)`);
  }
  return memberships;
}

function imageDestination(product, category, image, index) {
  const pathname = new URL(image.src).pathname;
  const originalExtension = path.extname(pathname).toLowerCase();
  const extension = ['.jpg', '.jpeg', '.png', '.webp'].includes(originalExtension) ? originalExtension : '.jpg';
  const filename = `${product.id}-${index + 1}${extension}`;
  const relativePath = `/images/dress365days/${category.slug}/${filename}`;
  return { relativePath, absolutePath: path.join(root, 'public', relativePath.slice(1)) };
}

async function downloadImage(task, attempt = 1) {
  const { url, absolutePath } = task;
  try {
    try {
      if ((await stat(absolutePath)).size > 0) return;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Image request failed: ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) throw new Error(`Unexpected image content type: ${contentType}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error('Image response was empty');
    await mkdir(path.dirname(absolutePath), { recursive: true });
    const temporaryPath = `${absolutePath}.download`;
    await writeFile(temporaryPath, bytes);
    await rename(temporaryPath, absolutePath);
  } catch (error) {
    if (attempt < 5) {
      await new Promise(resolve => setTimeout(resolve, 750 * attempt));
      return downloadImage(task, attempt + 1);
    }
    throw new Error(`${url}: ${error.message}`);
  }
}

async function main() {
  const sourceProducts = await fetchProducts();
  const memberships = await fetchSubcategoryMemberships();
  const imported = [];
  const tasks = [];
  const categoryCounts = Object.fromEntries(Object.keys(categories).map(key => [key, { products: 0, images: 0 }]));

  for (const product of sourceProducts) {
    const categoryKey = getCategory(product);
    if (!categoryKey) continue;
    const category = categories[categoryKey];
    const subcategorySlugs = SUBCATEGORIES
      .filter(subcategory =>
        subcategory.parentSlug === category.slug &&
        subcategory.sourceCollections.some(handle => memberships.get(handle).has(String(product.id))) &&
        (!subcategory.sourceTags || subcategory.sourceTags.every(tag =>
          (product.tags || []).some(productTag => productTag.toLowerCase() === tag.toLowerCase())
        ))
      )
      .map(subcategory => subcategory.slug);
    const images = (product.images || []).map((image, index) => {
      if (!image.src) throw new Error(`Product ${product.handle} has an image without a source URL`);
      const destination = imageDestination(product, category, image, index);
      const sourceUrl = new URL(image.src);
      sourceUrl.searchParams.set('width', String(targetWidth));
      tasks.push({ url: sourceUrl.href, absolutePath: destination.absolutePath });
      return {
        src: destination.relativePath,
        alt: cleanText(image.alt || '') || product.title,
      };
    });

    const description = cleanText(product.body_html || '');
    const variants = getVariants(product);
    const available = variants.some(variant => variant.available);
    const options = (product.options || [])
      .filter(option => option.name && option.name !== 'Title' && option.values?.length)
      .map(option => `${cleanText(option.name)}: ${option.values.map(value => cleanText(value)).join(', ')}`);
    const details = {
      Collection: category.name,
      'Product type': cleanText(product.product_type || '') || category.name,
      Brand: cleanText(product.vendor || '') || 'Dress365days',
      Availability: available ? 'In stock' : 'Currently unavailable',
    };
    if (options.length) details.Options = options.join('; ');
    if (variants.length === 1 && variants[0].sku) details.SKU = variants[0].sku;

    imported.push({
      sourceId: String(product.id),
      slug: `dress365-${product.handle}`,
      name: cleanText(product.title) || product.handle,
      sub: cleanText(product.product_type || '') || category.name,
      badge: cleanText(product.product_type || '') || category.name,
      badgeClass: '',
      category: category.name,
      categorySlug: category.slug,
      swatch: `swatch-${(imported.length % 8) + 1}`,
      images: images.map(image => image.src),
      imageAlt: images[0]?.alt,
      priceNow: getPriceRange(variants, 'price') || 'Price on Request',
      priceOld: getPriceRange(variants, 'compareAtPrice'),
      tagline: description.slice(0, 240) || cleanText(product.title),
      description: description || `${cleanText(product.title)} from the Dress365days collection.`,
      details,
      highlights: (product.tags || []).map(tag => cleanText(tag)).filter(Boolean),
      tags: (product.tags || []).map(tag => cleanText(tag)).filter(Boolean),
      variants,
      available,
      subcategorySlugs,
      availabilityLabel: available ? 'In stock' : 'Currently unavailable',
      sourceUrl: `${storeUrl}/products/${product.handle}`,
      source: 'Dress365days',
    });
    categoryCounts[categoryKey].products += 1;
    categoryCounts[categoryKey].images += images.length;
  }

  console.log(`Importing ${imported.length} products and ${tasks.length} image files`);
  let next = 0;
  let completed = 0;
  const failures = [];
  async function worker() {
    while (next < tasks.length) {
      const task = tasks[next++];
      try {
        await downloadImage(task);
      } catch (error) {
        failures.push(error.message);
      }
      completed += 1;
      if (completed % 250 === 0 || completed === tasks.length) {
        console.log(`Downloaded ${completed}/${tasks.length} images`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  if (failures.length) {
    console.error(`${failures.length} image downloads failed. Rerun the importer to retry; completed files are retained.`);
    console.error(failures.slice(0, 20).join('\n'));
    throw new Error(`Image import incomplete: ${failures.length} download failures`);
  }

  await writeFile(catalogPath, `${JSON.stringify(imported)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(root, catalogPath)}`);
  console.log(JSON.stringify(categoryCounts, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
