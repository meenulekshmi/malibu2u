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
    const { status, adminNotes } = await request.json();

    const sellRequest = await prisma.sellTradeRequest.update({
      where: { id },
      data: {
        status,
        ...(adminNotes ? { adminNotes } : {}),
      },
    });

    return NextResponse.json({ success: true, sellRequest });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sell/trade request' }, { status: 500 });
  }
}
