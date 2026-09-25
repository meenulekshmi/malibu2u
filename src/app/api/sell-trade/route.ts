import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      itemName,
      category,
      platform,
      brand,
      model,
      storage,
      condition,
      originalBox,
      accessories,
      purchaseInfo,
      photosJson,
      expectedPrice,
      estimatedCash,
      estimatedCredit,
      payoutChoice,
      fullName,
      email,
      phone,
      pickupAddress,
      userNotes,
    } = body;

    if (!itemName || !fullName || !phone || !pickupAddress) {
      return NextResponse.json({ error: 'Item name, customer name, phone, and pickup address are required' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    const sellRequest = await prisma.sellTradeRequest.create({
      data: {
        userId: currentUser?.userId || null,
        itemName,
        category: category || 'CONSOLE',
        platform: platform || 'PS5',
        brand: brand || null,
        model: model || null,
        storage: storage || null,
        condition: condition || 'GOOD',
        originalBox: Boolean(originalBox),
        accessories: accessories || null,
        purchaseInfo: purchaseInfo || null,
        photosJson: photosJson ? (typeof photosJson === 'string' ? photosJson : JSON.stringify(photosJson)) : null,
        expectedPrice: expectedPrice ? Number(expectedPrice) : null,
        estimatedCash: Number(estimatedCash) || 0,
        estimatedCredit: Number(estimatedCredit) || 0,
        payoutChoice: payoutChoice || 'CASH',
        fullName,
        email,
        phone,
        pickupAddress,
        userNotes: userNotes || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, sellRequest });
  } catch (error) {
    console.error('Sell-trade submission error:', error);
    return NextResponse.json({ error: 'Failed to submit sell/trade request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.sellTradeRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sell/trade requests' }, { status: 500 });
  }
}
