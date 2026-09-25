import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, estimatedCash, estimatedCredit, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const updated = await prisma.sellTradeRequest.update({
      where: { id },
      data: {
        status: status || undefined,
        estimatedCash: estimatedCash !== undefined ? Number(estimatedCash) : undefined,
        estimatedCredit: estimatedCredit !== undefined ? Number(estimatedCredit) : undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
    });

    return NextResponse.json({ sellRequest: updated });
  } catch (error) {
    console.error('Error updating sell request:', error);
    return NextResponse.json({ error: 'Failed to update sell request' }, { status: 500 });
  }
}
