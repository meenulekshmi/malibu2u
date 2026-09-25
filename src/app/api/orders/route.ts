import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { items, totalAmount, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: 'Cart items and shipping address are required' }, { status: 400 });
    }

    // Default to demo user if not logged in to enable guest checkout testing
    let userId = currentUser?.userId;
    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: 'user@malibu2u.com' } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unable to process order' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: parseFloat(totalAmount),
        paymentMethod: paymentMethod || 'CARD',
        paymentStatus: 'PAID',
        status: 'PROCESSING',
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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const where = user.role === 'ADMIN' ? {} : { userId: user.userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
