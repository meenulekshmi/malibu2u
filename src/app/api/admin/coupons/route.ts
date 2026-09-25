import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, discountType, discountPercent, discountAmount, minPurchase, maxDiscount, expiryDate, usageLimit, active } = body;

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({ where: { code: uppercaseCode } });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: uppercaseCode,
        discountType: discountType || 'PERCENTAGE',
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountAmount: discountAmount ? Number(discountAmount) : null,
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, code, discountType, discountPercent, discountAmount, minPurchase, maxDiscount, expiryDate, usageLimit, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        discountType,
        discountPercent: discountPercent !== undefined ? (discountPercent ? Number(discountPercent) : null) : undefined,
        discountAmount: discountAmount !== undefined ? (discountAmount ? Number(discountAmount) : null) : undefined,
        minPurchase: minPurchase !== undefined ? Number(minPurchase) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : undefined,
        expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
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
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
