import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCashfreeOrder } from '@/lib/cashfree';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify status via Cashfree Server API
    const cfOrderId = order.cashfreeOrderId || order.id;
    const cfVerification = await verifyCashfreeOrder(cfOrderId);

    const isPaid =
      cfVerification.order_status === 'PAID' ||
      cfVerification.isDevPlaceholder === true;

    if (isPaid) {
      const isFullPayment = order.paymentMethod === 'FULL_ONLINE' || order.remainingCodAmount === 0;

      // Update product stocks safely upon verified payment
      for (const item of order.items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: Math.max(1, item.quantity),
              },
            },
          }).catch((err) => console.error(`Error updating stock for product ${item.productId}:`, err));
        }
      }

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'ADVANCE_PAID',
          advancePaymentStatus: 'PAID',
          paymentStatus: isFullPayment ? 'PAID' : 'PARTIAL_PAID',
          remainingPaymentStatus: isFullPayment ? 'PAID' : 'PENDING',
          cashfreePaymentId: cfVerification.payment_session_id || `cf_pay_${Date.now()}`,
          paymentTimestampsJson: JSON.stringify({
            advancePaidAt: new Date().toISOString(),
          }),
        },
        include: { items: { include: { product: true } } },
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
      });
    } else {
      // Mark advance as failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          advancePaymentStatus: 'FAILED',
          paymentStatus: 'FAILED',
        },
      });

      return NextResponse.json({
        success: false,
        error: 'Advance payment was not completed or failed on Cashfree.',
      });
    }
  } catch (error) {
    console.error('Verify Cashfree payment error:', error);
    return NextResponse.json({ error: 'Server payment verification failed' }, { status: 500 });
  }
}
