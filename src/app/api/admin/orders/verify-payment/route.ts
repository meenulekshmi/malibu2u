import { NextResponse } from 'next/server';
import { manualPaymentProvider } from '@/lib/payment-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, action, rejectionReason } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Order ID and action (confirm/reject) are required' }, { status: 400 });
    }

    let result;
    if (action === 'confirm') {
      result = await manualPaymentProvider.confirmPayment(orderId, user.userId);
    } else if (action === 'reject') {
      result = await manualPaymentProvider.rejectPayment(orderId, rejectionReason || '', user.userId);
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be confirm or reject.' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}
