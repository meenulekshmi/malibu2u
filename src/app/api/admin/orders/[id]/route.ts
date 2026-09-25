import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { status, remainingPaymentStatus, paymentStatus } = await request.json();

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (remainingPaymentStatus) dataToUpdate.remainingPaymentStatus = remainingPaymentStatus;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
