import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inventory = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        platform: true,
        brand: true,
        price: true,
        updatedAt: true,
      },
      orderBy: { stock: 'asc' },
    });

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, stock, lowStockThreshold } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stock: stock !== undefined ? Math.max(0, Number(stock)) : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? Math.max(0, Number(lowStockThreshold)) : undefined,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
