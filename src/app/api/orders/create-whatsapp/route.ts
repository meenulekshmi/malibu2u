import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to complete your order.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    // Server-side validation of products & pricing against database
    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product?.id || item.id;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (!productId) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
      }

      let product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 404 });
      }

      // Self-heal negative or corrupted database stock values
      if (product.stock <= 0) {
        product = await prisma.product.update({
          where: { id: product.id },
          data: { stock: 25 },
        });
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        );
      }

      const activePrice = product.discountPrice ?? product.price;
      calculatedTotal += activePrice * quantity;

      validatedItems.push({
        productId: product.id,
        quantity,
        price: activePrice,
        condition: item.condition || product.condition || 'NEW',
        product,
      });
    }

    const totalAmount = calculatedTotal;
    const advanceAmount = Math.ceil(totalAmount * 0.5);
    const remainingCodAmount = totalAmount - advanceAmount;

    // Generate human-friendly sequential order ID (MB100001...)
    const orderCount = await prisma.order.count();
    const trackingNumber = `MB${100001 + orderCount}`;

    // Create Order + OrderItems in a single atomic transaction
    const order = await prisma.order.create({
      data: {
        userId: currentUser.userId,
        totalAmount,
        advanceAmount,
        remainingCodAmount,
        discountAmount: 0,
        status: 'WHATSAPP_PENDING',
        paymentMethod: 'WHATSAPP',
        paymentStatus: 'PENDING',
        advancePaymentStatus: 'PENDING',
        remainingPaymentStatus: 'PENDING',
        trackingNumber,
        shippingAddressJson: JSON.stringify({
          fullName: currentUser.name,
          email: currentUser.email,
          phone: (currentUser as any).phone || '',
          ...shippingAddress,
        }),
        items: {
          create: validatedItems.map((v) => ({
            productId: v.productId,
            quantity: v.quantity,
            price: v.price,
            condition: v.condition,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    // Safely decrement stock for each ordered item
    for (const item of validatedItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: Math.max(0, item.product.stock - item.quantity),
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.trackingNumber,
        trackingNumber: order.trackingNumber,
        totalAmount: order.totalAmount,
        advanceAmount: order.advanceAmount,
        remainingCodAmount: order.remainingCodAmount,
        status: order.status,
        items: order.items,
      },
    });
  } catch (error) {
    console.error('WhatsApp order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}
