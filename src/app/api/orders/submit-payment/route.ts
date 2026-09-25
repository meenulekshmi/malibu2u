import { NextResponse } from 'next/server';
import { manualPaymentProvider } from '@/lib/payment-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, reference, proofUrl } = body;

    if (!orderId || !reference) {
      return NextResponse.json(
        { error: 'Order ID and Payment Reference / UTR Number are required' },
        { status: 400 }
      );
    }

    const result = await manualPaymentProvider.submitProof(orderId, reference, proofUrl);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error: any) {
    console.error('Submit payment proof error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit payment proof' }, { status: 500 });
  }
}
