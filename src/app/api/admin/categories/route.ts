import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, image, description, isFeatured, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name required' }, { status: 400 });
    }

    const categorySlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        image: image || null,
        description: description || null,
        isFeatured: Boolean(isFeatured),
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, image, description, isFeatured, parentId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
        image,
        description,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        parentId: parentId !== undefined ? (parentId || null) : undefined,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
