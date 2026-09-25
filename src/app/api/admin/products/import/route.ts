import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { transformProductItem, TransformedProduct } from '@/lib/product-import-utils';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload in request body' }, { status: 400 });
    }

    // Support payload as either array directly or object with { products: [...] }
    let rawProducts: any[] = [];
    if (Array.isArray(body)) {
      rawProducts = body;
    } else if (body && Array.isArray(body.products)) {
      rawProducts = body.products;
    } else {
      return NextResponse.json(
        { error: 'Invalid structure: JSON root or "products" field must be an array of products' },
        { status: 400 }
      );
    }

    if (rawProducts.length === 0) {
      return NextResponse.json({ error: 'JSON array is empty. No products found to import.' }, { status: 400 });
    }

    // Fetch existing SKUs and Slugs to prevent duplicate insertions
    const existingProducts = await prisma.product.findMany({
      select: { sku: true, slug: true },
    });
    const existingSkuSet = new Set<string>(existingProducts.map((p) => p.sku.trim().toLowerCase()));
    const existingSlugSet = new Set<string>(existingProducts.map((p) => p.slug.trim().toLowerCase()));

    // Fetch existing Categories to map or create
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();

    for (const cat of existingCategories) {
      categoryMap.set(cat.name.trim().toLowerCase(), { id: cat.id, name: cat.name, slug: cat.slug });
      categoryMap.set(cat.slug.trim().toLowerCase(), { id: cat.id, name: cat.name, slug: cat.slug });
    }

    let defaultCategory = existingCategories.find((c) => c.slug === 'consoles' || c.slug === 'games') || existingCategories[0];

    const newCategoriesCreated: string[] = [];

    // Helper to get or create category
    const getOrCreateCategory = async (catInput?: string, catSlugInput?: string): Promise<string> => {
      const rawName = (catInput || '').trim();
      const rawSlug = (catSlugInput || '').trim();

      const lookupKey = (rawName || rawSlug).toLowerCase();
      if (lookupKey && categoryMap.has(lookupKey)) {
        return categoryMap.get(lookupKey)!.id;
      }

      if (rawSlug && categoryMap.has(rawSlug.toLowerCase())) {
        return categoryMap.get(rawSlug.toLowerCase())!.id;
      }

      if (rawName) {
        const generatedSlug = (rawSlug || rawName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || `cat-${Date.now()}`;

        // Ensure category slug uniqueness
        let finalCatSlug = generatedSlug;
        let counter = 1;
        while (categoryMap.has(finalCatSlug.toLowerCase())) {
          finalCatSlug = `${generatedSlug}-${counter++}`;
        }

        const createdCategory = await prisma.category.create({
          data: {
            name: rawName,
            slug: finalCatSlug,
            description: `${rawName} gaming category`,
          },
        });

        categoryMap.set(rawName.toLowerCase(), createdCategory);
        categoryMap.set(finalCatSlug.toLowerCase(), createdCategory);
        newCategoriesCreated.push(createdCategory.name);
        return createdCategory.id;
      }

      // If no category specified, fallback to default category or create "Gaming Products"
      if (!defaultCategory) {
        const fallback = await prisma.category.create({
          data: {
            name: 'Gaming Products',
            slug: 'gaming-products',
            description: 'Gaming Products and Accessories',
          },
        });
        defaultCategory = fallback;
        categoryMap.set(fallback.name.toLowerCase(), fallback);
        categoryMap.set(fallback.slug.toLowerCase(), fallback);
        newCategoriesCreated.push(fallback.name);
      }
      return defaultCategory.id;
    };

    let importedCount = 0;
    let duplicateCount = 0;
    const invalidRecords: { index: number; sku?: string; name?: string; reason: string }[] = [];
    const skippedSkus: string[] = [];

    for (let i = 0; i < rawProducts.length; i++) {
      const rawItem = rawProducts[i];
      const recordIndex = i + 1;

      // Transform both GameNation scraped items & Malibu2u native records
      const item: TransformedProduct | null = transformProductItem(rawItem, i);

      if (!item) {
        invalidRecords.push({
          index: recordIndex,
          name: rawItem?.title || rawItem?.name || undefined,
          sku: rawItem?.sku || rawItem?.web_scraper_order || undefined,
          reason: 'Missing title/name or valid price value',
        });
        continue;
      }

      const lowerSku = item.sku.toLowerCase();
      if (existingSkuSet.has(lowerSku)) {
        duplicateCount++;
        skippedSkus.push(item.sku);
        continue;
      }

      // Resolve Category
      let categoryId: string;
      try {
        categoryId = await getOrCreateCategory(item.category, item.categorySlug);
      } catch (err: any) {
        invalidRecords.push({
          index: recordIndex,
          sku: item.sku,
          name: item.name,
          reason: `Failed to assign or create category: ${err.message || 'Category error'}`,
        });
        continue;
      }

      // Resolve unique Slug
      const baseSlug = (item.slug || item.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || `prod-${Date.now()}`;
      
      let finalSlug = baseSlug;
      let slugCounter = 1;
      while (existingSlugSet.has(finalSlug.toLowerCase())) {
        finalSlug = `${baseSlug}-${slugCounter++}`;
      }

      // Prepare image relations
      const imagesToCreate = (item.images || []).map((url, idx) => ({
        url,
        isPrimary: idx === 0,
      }));

      try {
        await prisma.product.create({
          data: {
            name: item.name,
            slug: finalSlug,
            description: item.description || item.name,
            shortDescription: item.shortDescription || null,
            price: item.price,
            mrp: item.mrp || null,
            discountPrice: item.discountPrice || null,
            condition: item.condition,
            platform: item.platform,
            brand: item.brand,
            stock: item.stock,
            lowStockThreshold: item.lowStockThreshold,
            sku: item.sku,
            categoryId,
            specsJson: item.specsJson || null,
            isFeatured: item.isFeatured || false,
            isBestSeller: item.isBestSeller || false,
            isPreOrder: item.isPreOrder || false,
            isNewArrival: item.isNewArrival !== undefined ? item.isNewArrival : true,
            isOnSale: item.isOnSale || false,
            isPreOwned: item.isPreOwned || false,
            images: {
              create: imagesToCreate,
            },
          },
        });

        existingSkuSet.add(lowerSku);
        existingSlugSet.add(finalSlug.toLowerCase());
        importedCount++;
      } catch (err: any) {
        console.error(`Error inserting product SKU ${item.sku}:`, err);
        invalidRecords.push({
          index: recordIndex,
          sku: item.sku,
          name: item.name,
          reason: err.message || 'Database insertion failure',
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: rawProducts.length,
        imported: importedCount,
        duplicatesSkipped: duplicateCount,
        invalidCount: invalidRecords.length,
        categoriesCreatedCount: newCategoriesCreated.length,
        newCategories: newCategoriesCreated,
        skippedSkus,
        invalidRecords,
      },
    });
  } catch (error: any) {
    console.error('Bulk product import error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process bulk product import' }, { status: 500 });
  }
}
