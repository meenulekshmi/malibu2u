import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      include: { product: { select: { name: true, slug: true } }, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isApproved } = body;

    if (!id || isApproved === undefined) {
      return NextResponse.json({ error: 'Review ID and approval status required' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    // Update product average rating & review count
    if (review.productId) {
      const approvedReviews = await prisma.review.findMany({
        where: { productId: review.productId, isApproved: true },
      });
      const reviewCount = approvedReviews.length;
      const rating = reviewCount > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 5.0;

      await prisma.product.update({
        where: { id: review.productId },
        data: { rating, reviewCount },
      });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const review = await prisma.review.delete({ where: { id } });

    // Recalculate product rating
    if (review.productId) {
      const approvedReviews = await prisma.review.findMany({
        where: { productId: review.productId, isApproved: true },
      });
      const reviewCount = approvedReviews.length;
      const rating = reviewCount > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 5.0;

      await prisma.product.update({
        where: { id: review.productId },
        data: { rating, reviewCount },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
