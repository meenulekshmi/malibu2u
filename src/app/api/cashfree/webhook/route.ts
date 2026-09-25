import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCashfreeOrder } from '@/lib/cashfree';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.data?.order?.order_id || body.orderId;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const cfVerification = await verifyCashfreeOrder(orderId);
    if (cfVerification.order_status === 'PAID') {
      const order = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { cashfreeOrderId: orderId }] },
      });

      if (order && order.advancePaymentStatus !== 'PAID') {
        const isFull = order.paymentMethod === 'FULL_ONLINE' || order.remainingCodAmount === 0;
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PROCESSING',
            advancePaymentStatus: 'PAID',
            paymentStatus: isFull ? 'PAID' : 'PARTIAL_PAID',
            remainingPaymentStatus: isFull ? 'PAID' : 'PENDING',
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Cashfree Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
