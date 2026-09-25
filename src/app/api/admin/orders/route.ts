import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, paymentStatus, advancePaymentStatus, remainingPaymentStatus, trackingNumber } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        advancePaymentStatus: advancePaymentStatus || undefined,
        remainingPaymentStatus: remainingPaymentStatus || undefined,
        trackingNumber: trackingNumber || undefined,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
