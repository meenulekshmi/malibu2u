import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createCashfreeOrder } from '@/lib/cashfree';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { items, paymentMethod, shippingAddress, promoDiscount = 0 } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Cart items and shipping address required' }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: any) => {
      const activePrice = item.product?.discountPrice ?? item.product?.price ?? item.price;
      return sum + activePrice * item.quantity;
    }, 0);

    const shippingFee = subtotal >= 2000 ? 0 : 99;
    const finalTotal = Math.max(0, subtotal - promoDiscount + shippingFee);

    // Calculate fixed 50% split
    let advanceAmount = 0;
    let remainingCodAmount = 0;

    if (paymentMethod === 'SPLIT_50_50') {
      advanceAmount = Math.ceil(finalTotal * 0.5);
      remainingCodAmount = finalTotal - advanceAmount;
    } else if (paymentMethod === 'FULL_ONLINE') {
      advanceAmount = finalTotal;
      remainingCodAmount = 0;
    } else {
      advanceAmount = 0;
      remainingCodAmount = finalTotal;
    }

    // Default to demo user if guest
    let userId = currentUser?.userId;
    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: 'user@malibu2u.com' } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'User registration error' }, { status: 400 });
    }

    // Create DB Order record in PENDING state
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: finalTotal,
        discountAmount: promoDiscount,
        advanceAmount,
        remainingCodAmount,
        paymentMethod,
        paymentStatus: 'PENDING',
        advancePaymentStatus: 'PENDING',
        remainingPaymentStatus: 'PENDING',
        status: 'PENDING',
        shippingAddressJson: JSON.stringify(shippingAddress),
        trackingNumber: `M2U-${Math.floor(100000 + Math.random() * 900000)}`,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.product?.id || item.id,
            quantity: item.quantity,
            price: item.product?.discountPrice ?? item.product?.price ?? item.price,
            condition: item.condition || item.product?.condition || 'NEW',
          })),
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/checkout/verify?order_id=${order.id}`;

    // Create Cashfree Payment Order on server
    const cashfreeRes = await createCashfreeOrder({
      orderId: order.id,
      orderAmount: advanceAmount,
      customerName: shippingAddress.fullName || 'Valued Gamer',
      customerEmail: shippingAddress.email || 'customer@malibu2u.com',
      customerPhone: shippingAddress.phone || '9876543210',
      returnUrl,
    });

    // Update order with Cashfree Order ID reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        cashfreeOrderId: cashfreeRes.cf_order_id || order.id,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      cashfreeSessionId: cashfreeRes.payment_session_id,
      cfOrderId: cashfreeRes.cf_order_id || order.id,
      isDevPlaceholder: cashfreeRes.isDevPlaceholder || false,
      advanceAmount,
      remainingCodAmount,
      finalTotal,
    });
  } catch (error) {
    console.error('Create Cashfree Order error:', error);
    return NextResponse.json({ error: 'Failed to initiate Cashfree payment order' }, { status: 500 });
  }
}
