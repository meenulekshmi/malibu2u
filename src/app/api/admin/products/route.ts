import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      mrp,
      discountPrice,
      condition,
      platform,
      brand,
      stock,
      lowStockThreshold,
      sku,
      categoryId,
      categorySlug,
      specsJson,
      imageUrls = [],
      isFeatured,
      isBestSeller,
      isPreOrder,
      isNewArrival,
      isOnSale,
      isPreOwned,
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Product Title is required' }, { status: 400 });
    }

    if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
      return NextResponse.json({ error: 'Selling Price (₹) is required and must be a valid number' }, { status: 400 });
    }

    if (!sku || sku.trim() === '') {
      return NextResponse.json({ error: 'SKU Code is required' }, { status: 400 });
    }

    if (!platform || platform.trim() === '') {
      return NextResponse.json({ error: 'Platform selection is required' }, { status: 400 });
    }

    const resolvedBrand = (brand && brand.trim() !== '')
      ? brand.trim()
      : (platform.includes('PS')
          ? 'PlayStation'
          : platform.includes('XBOX')
          ? 'Xbox'
          : platform.includes('NINTENDO')
          ? 'Nintendo'
          : 'Malibu2u');

    let targetCategoryId = categoryId;
    if (!targetCategoryId && categorySlug) {
      const category = await prisma.category.findFirst({ where: { slug: categorySlug } });
      targetCategoryId = category?.id;
    }

    if (!targetCategoryId) {
      const firstCat = await prisma.category.findFirst();
      if (!firstCat) {
        return NextResponse.json({ error: 'Please create a category first in Category Management' }, { status: 400 });
      }
      targetCategoryId = firstCat.id;
    }

    const productSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
    const finalSlug = existing ? `${productSlug}-${Date.now()}` : productSlug;

    // Build image list
    const imagesToCreate = Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls.filter((url: string) => url && url.trim() !== '').map((url: string, index: number) => ({
          url: url.trim(),
          isPrimary: index === 0,
        }))
      : [];

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description || name,
        shortDescription: shortDescription || null,
        price: Number(price),
        mrp: mrp ? Number(mrp) : null,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        condition: condition || 'NEW',
        platform,
        brand: resolvedBrand,
        stock: Number(stock) >= 0 ? Number(stock) : 10,
        lowStockThreshold: Number(lowStockThreshold) >= 0 ? Number(lowStockThreshold) : 2,
        sku: sku.trim(),
        categoryId: targetCategoryId,
        specsJson: specsJson ? (typeof specsJson === 'string' ? specsJson : JSON.stringify(specsJson)) : null,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isPreOrder: Boolean(isPreOrder),
        isNewArrival: Boolean(isNewArrival),
        isOnSale: Boolean(isOnSale),
        isPreOwned: Boolean(isPreOwned) || condition?.includes('PREOWNED'),
        images: {
          create: imagesToCreate,
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Admin create product error:', error);
    if (error?.code === 'P2002') {
      const targetField = error?.meta?.target ? ` (${error.meta.target})` : '';
      return NextResponse.json({ error: `A product with this SKU code or title already exists${targetField}.` }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      slug,
      description,
      shortDescription,
      price,
      mrp,
      discountPrice,
      condition,
      platform,
      brand,
      stock,
      lowStockThreshold,
      sku,
      categoryId,
      specsJson,
      imageUrls,
      isFeatured,
      isBestSeller,
      isPreOrder,
      isNewArrival,
      isOnSale,
      isPreOwned,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Replace images if imageUrls passed
    if (Array.isArray(imageUrls)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (imageUrls.length > 0) {
        await prisma.productImage.createMany({
          data: imageUrls.filter((u: string) => u.trim() !== '').map((url: string, index: number) => ({
            productId: id,
            url: url.trim(),
            isPrimary: index === 0,
          })),
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
        description,
        shortDescription: shortDescription !== undefined ? shortDescription : undefined,
        price: price !== undefined ? Number(price) : undefined,
        mrp: mrp !== undefined ? (mrp ? Number(mrp) : null) : undefined,
        discountPrice: discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : undefined,
        condition,
        platform,
        brand,
        stock: stock !== undefined ? Number(stock) : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : undefined,
        sku: sku ? sku.trim() : undefined,
        categoryId: categoryId || undefined,
        specsJson: specsJson !== undefined ? (typeof specsJson === 'string' ? specsJson : JSON.stringify(specsJson)) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        isPreOrder: isPreOrder !== undefined ? Boolean(isPreOrder) : undefined,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : undefined,
        isOnSale: isOnSale !== undefined ? Boolean(isOnSale) : undefined,
        isPreOwned: isPreOwned !== undefined ? Boolean(isPreOwned) : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error?.code === 'P2002') {
      const targetField = error?.meta?.target ? ` (${error.meta.target})` : '';
      return NextResponse.json({ error: `A product with this SKU code or title already exists${targetField}.` }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
