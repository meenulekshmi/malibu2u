/**
 * Product Normalization & Transformation Utility
 * Supports both Malibu2u native JSON and Scraped GameNation / Web-scraper JSON formats.
 */

export interface TransformedProduct {
  name: string;
  sku: string;
  price: number;
  mrp?: number | null;
  discountPrice?: number | null;
  platform: string;
  category: string;
  categorySlug?: string;
  brand: string;
  condition: string;
  stock: number;
  lowStockThreshold: number;
  shortDescription?: string | null;
  description?: string;
  images: string[];
  specs?: any;
  specsJson?: string | null;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isPreOrder?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  isPreOwned?: boolean;
  slug?: string;
  statusText?: string;
}

/**
 * Converts price string or number to clean float.
 * Handles ₹, commas, spaces, text: e.g. "₹ 1,099" -> 1099, "₹ 12,499.00" -> 12499
 */
export function parseCleanPrice(val: any): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  const str = String(val).replace(/₹/g, '').replace(/,/g, '').replace(/\s+/g, '').trim();
  // Match digits with optional decimal point
  const match = str.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return isNaN(num) ? null : num;
}

/**
 * Detects platform from title or URL or explicit platform string.
 * Supported platforms in Malibu2u: PS5, PS4, XBOX_SERIES, NINTENDO_SWITCH, PC, ACCESSORIES
 */
export function detectPlatform(title: string = '', url: string = '', rawPlatform: string = ''): string {
  const combined = `${rawPlatform} ${title} ${url}`.toUpperCase();

  if (combined.includes('PS5') || combined.includes('PLAYSTATION 5')) {
    return 'PS5';
  }
  if (combined.includes('PS4') || combined.includes('PLAYSTATION 4')) {
    return 'PS4';
  }
  if (
    combined.includes('XBOX SERIES') ||
    combined.includes('XBOX ONE') ||
    combined.includes('XBOX')
  ) {
    return 'XBOX_SERIES';
  }
  if (
    combined.includes('NINTENDO SWITCH') ||
    combined.includes('SWITCH') ||
    combined.includes('NINTENDO')
  ) {
    return 'NINTENDO_SWITCH';
  }
  if (
    combined.includes('PC HARDWARE') ||
    combined.includes('PC GAME') ||
    combined.includes('PC ') ||
    combined.includes('/PC')
  ) {
    return 'PC';
  }
  if (
    combined.includes('CONTROLLER') ||
    combined.includes('HEADSET') ||
    combined.includes('ACCESSORY') ||
    combined.includes('ACCESSORIES')
  ) {
    return 'ACCESSORIES';
  }

  // Fallback defaults
  if (rawPlatform && rawPlatform.trim()) {
    return rawPlatform.trim().toUpperCase();
  }
  return 'PS5';
}

/**
 * Normalizes condition text
 * e.g. "PRE OWNED" -> "MINT_PREOWNED", "Pre-owned" -> "MINT_PREOWNED", "NEW" -> "NEW"
 */
export function normalizeCondition(rawCond: string = '', title: string = ''): string {
  const combined = `${rawCond} ${title}`.toUpperCase();

  if (
    combined.includes('PRE OWNED') ||
    combined.includes('PRE-OWNED') ||
    combined.includes('PREOWNED') ||
    combined.includes('USED') ||
    combined.includes('REFURBISHED')
  ) {
    return 'MINT_PREOWNED';
  }

  if (combined.includes('GOOD')) {
    return 'GOOD_PREOWNED';
  }

  return 'NEW';
}

/**
 * Normalizes condition display label for UI
 */
export function getConditionDisplay(condition: string): string {
  if (condition === 'MINT_PREOWNED' || condition === 'GOOD_PREOWNED') {
    return 'Pre-owned';
  }
  return 'New';
}

/**
 * Detects Category Name from Title, URL, or Category fields
 */
export function detectCategory(
  rawCat: string = '',
  rawCatSlug: string = '',
  title: string = '',
  url: string = '',
  platform: string = 'PS5'
): { name: string; slug: string } {
  if (rawCat && rawCat.trim()) {
    const cleanName = rawCat.trim();
    const cleanSlug = rawCatSlug
      ? rawCatSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return { name: cleanName, slug: cleanSlug };
  }

  const combined = `${title} ${url}`.toLowerCase();

  if (combined.includes('console') || combined.includes('/consoles')) {
    return { name: 'Consoles', slug: 'consoles' };
  }
  if (combined.includes('game') || combined.includes('/games') || combined.includes('edition') || combined.includes('disc')) {
    return { name: 'Games', slug: 'games' };
  }
  if (combined.includes('controller') || combined.includes('headset') || combined.includes('accessory') || combined.includes('accessories')) {
    return { name: 'Accessories', slug: 'accessories' };
  }
  if (combined.includes('hardware') || combined.includes('gpu') || combined.includes('graphic')) {
    return { name: 'PC Hardware', slug: 'pc-hardware' };
  }

  // Fallback to platform-based or general category
  if (platform === 'PS5' || platform === 'PS4') {
    return { name: 'PlayStation Games', slug: 'playstation-games' };
  }
  if (platform.includes('XBOX')) {
    return { name: 'Xbox Games', slug: 'xbox-games' };
  }
  if (platform.includes('NINTENDO')) {
    return { name: 'Nintendo Switch', slug: 'nintendo-switch' };
  }

  return { name: 'Gaming Products', slug: 'gaming-products' };
}

/**
 * Generates a stable SKU from scraped record or title
 */
export function generateOrGetSku(item: any, index: number): string {
  if (item.sku && String(item.sku).trim()) {
    return String(item.sku).trim();
  }

  // GameNation or Scraper order ID (e.g. 1711234567-1)
  if (item.web_scraper_order && String(item.web_scraper_order).trim()) {
    const cleanOrder = String(item.web_scraper_order).replace(/[^a-zA-Z0-9_-]/g, '');
    return `GN-${cleanOrder}`;
  }

  // Generate deterministic slug-based SKU from title
  const title = (item.title || item.name || `item-${index + 1}`).trim();
  const slugPart = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10)
    .toUpperCase();

  return `MAL-${slugPart || 'PROD'}-${index + 1000}`;
}

/**
 * Extracts and consolidates images from any supported format
 */
export function extractImages(item: any): string[] {
  const images: string[] = [];

  // Scraper image field or direct image property
  if (typeof item.image === 'string' && item.image.trim()) {
    images.push(item.image.trim());
  }

  if (Array.isArray(item.images)) {
    item.images.forEach((img: any) => {
      if (typeof img === 'string' && img.trim() && !images.includes(img.trim())) {
        images.push(img.trim());
      }
    });
  }

  if (Array.isArray(item.imageUrls)) {
    item.imageUrls.forEach((img: any) => {
      if (typeof img === 'string' && img.trim() && !images.includes(img.trim())) {
        images.push(img.trim());
      }
    });
  }

  // Check data / data2 / data3 in case image URL is stored there
  ['data', 'data2', 'data3', 'data4'].forEach((field) => {
    const val = item[field];
    if (typeof val === 'string' && val.trim().startsWith('http') && (val.includes('.jpg') || val.includes('.png') || val.includes('.webp') || val.includes('.jpeg') || val.includes('cdn') || val.includes('images'))) {
      if (!images.includes(val.trim())) {
        images.push(val.trim());
      }
    }
  });

  return images;
}

/**
 * Transforms any raw item (GameNation scraped or Malibu2u standard) into a normalized Malibu2u product
 */
export function transformProductItem(rawItem: any, index: number): TransformedProduct | null {
  if (!rawItem || typeof rawItem !== 'object') return null;

  // 1. Resolve Name / Title
  const name = (rawItem.title || rawItem.name || '').trim();
  if (!name) return null;

  // 2. Resolve Price & MRP (Original Price)
  // GameNation scraped format: price = selling price, price2 = original / MRP price
  const primaryPrice = parseCleanPrice(rawItem.price);
  const secondaryPrice = parseCleanPrice(rawItem.price2 || rawItem.mrp || rawItem.originalPrice);

  // If price is missing or invalid, check price2
  const finalPrice = primaryPrice !== null ? primaryPrice : secondaryPrice;
  if (finalPrice === null || isNaN(finalPrice) || finalPrice < 0) {
    return null;
  }

  const finalMrp = secondaryPrice !== null && secondaryPrice > finalPrice ? secondaryPrice : (rawItem.mrp ? parseCleanPrice(rawItem.mrp) : null);
  const discountPrice = rawItem.discountPrice ? parseCleanPrice(rawItem.discountPrice) : null;

  // 3. Resolve SKU
  const sku = generateOrGetSku(rawItem, index);

  // 4. Resolve Platform
  const platform = detectPlatform(name, rawItem.web_scraper_start_url || '', rawItem.platform || '');

  // 5. Resolve Condition (supports data4 e.g. "PRE OWNED")
  const rawCond = rawItem.data4 || rawItem.condition || '';
  const condition = normalizeCondition(rawCond, name);
  const isPreOwned = condition.includes('PREOWNED') || Boolean(rawItem.isPreOwned);

  // 6. Resolve Brand
  const resolvedBrand = (rawItem.brand && typeof rawItem.brand === 'string' && rawItem.brand.trim() !== '')
    ? rawItem.brand.trim()
    : (platform.includes('PS')
        ? 'PlayStation'
        : platform.includes('XBOX')
        ? 'Xbox'
        : platform.includes('NINTENDO') || platform.includes('SWITCH')
        ? 'Nintendo'
        : 'Malibu2u');

  // 7. Resolve Category
  const cat = detectCategory(
    rawItem.category,
    rawItem.categorySlug,
    name,
    rawItem.web_scraper_start_url || '',
    platform
  );

  // 8. Resolve Images
  const images = extractImages(rawItem);

  // 9. Stock & Threshold
  const stock = rawItem.stock !== undefined && !isNaN(Number(rawItem.stock)) ? Math.max(0, parseInt(String(rawItem.stock), 10)) : 10;
  const lowStockThreshold = rawItem.lowStockThreshold !== undefined && !isNaN(Number(rawItem.lowStockThreshold)) ? Math.max(0, parseInt(String(rawItem.lowStockThreshold), 10)) : 2;

  // 10. Descriptions & Specs
  const description = rawItem.description || rawItem.data || rawItem.data2 || name;
  const shortDescription = rawItem.shortDescription || (rawItem.data3 ? `Discount Info: ${rawItem.data3}` : null);

  return {
    name,
    sku,
    price: finalPrice,
    mrp: finalMrp,
    discountPrice,
    platform,
    category: cat.name,
    categorySlug: cat.slug,
    brand: resolvedBrand,
    condition,
    stock,
    lowStockThreshold,
    shortDescription,
    description,
    images,
    specsJson: rawItem.specsJson ? (typeof rawItem.specsJson === 'string' ? rawItem.specsJson : JSON.stringify(rawItem.specsJson)) : null,
    isFeatured: Boolean(rawItem.isFeatured),
    isBestSeller: Boolean(rawItem.isBestSeller),
    isPreOrder: Boolean(rawItem.isPreOrder),
    isNewArrival: rawItem.isNewArrival !== undefined ? Boolean(rawItem.isNewArrival) : true,
    isOnSale: Boolean(rawItem.isOnSale || (finalMrp && finalMrp > finalPrice)),
    isPreOwned,
    slug: rawItem.slug,
    statusText: 'Ready',
  };
}
