import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, cartSubtotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ valid: false, message: 'Coupon code not found or expired' }, { status: 404 });
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' }, { status: 400 });
    }

    const subtotal = Number(cartSubtotal) || 0;
    if (subtotal < coupon.minPurchase) {
      return NextResponse.json({
        valid: false,
        message: `Minimum purchase of ₹${coupon.minPurchase.toLocaleString()} required for this coupon.`,
      }, { status: 400 });
    }

    // Calculate discount server side strictly
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE' && coupon.discountPercent) {
      discountAmount = (subtotal * coupon.discountPercent) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      message: `Coupon '${coupon.code}' applied! Saved ₹${discountAmount.toLocaleString()}`,
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 });
  }
}
