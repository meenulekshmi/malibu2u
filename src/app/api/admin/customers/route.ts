import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        sellRequests: {
          select: {
            id: true,
            itemName: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerSummary = customers.map((c) => {
      const orderCount = c.orders.length;
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        createdAt: c.createdAt,
        orderCount,
        totalSpent,
        recentOrders: c.orders.slice(0, 5),
        sellRequestsCount: c.sellRequests.length,
      };
    });

    return NextResponse.json({ customers: customerSummary });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customer data' }, { status: 500 });
  }
}
