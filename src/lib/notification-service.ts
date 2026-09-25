import { prisma } from '@/lib/prisma';
import { normalizeWhatsAppNumber, formatDisplayPhoneNumber } from '@/lib/whatsapp';
import { ensureDefaultTemplates } from '@/lib/whatsapp-templates';

export interface NotificationContext {
  order: any;
  rejectionReason?: string;
  customMessage?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface RenderedNotification {
  body: string;
  mediaUrl?: string | null;
  recipientPhone: string;
  recipientName: string;
  whatsappUrl: string;
}

/**
 * Replaces {{variable}} placeholders with real context data
 */
export function renderTemplate(templateBody: string, context: NotificationContext, storeSettings: Record<string, string>): string {
  const { order, rejectionReason, trackingNumber, estimatedDelivery } = context;
  const user = order.user || {};

  // Extract address snapshot
  let addressText = 'Address pending confirmation';
  if (order.shippingAddressJson) {
    try {
      const addr = JSON.parse(order.shippingAddressJson);
      const parts = [
        addr.fullName,
        addr.addressLine1,
        addr.addressLine2,
        addr.landmark ? `Near ${addr.landmark}` : null,
        addr.city,
        addr.district,
        addr.state ? `${addr.state} - ${addr.postalCode || ''}` : addr.postalCode,
        addr.phone ? `Phone: ${addr.phone}` : null,
      ].filter(Boolean);
      addressText = parts.join(', ');
    } catch (e) {}
  }

  // Format product summary
  let productSummary = '';
  if (order.items && order.items.length > 0) {
    productSummary = order.items
      .map((item: any, idx: number) => {
        const prodName = item.product?.name || 'Item';
        const price = item.price || 0;
        const qty = item.quantity || 1;
        const cond = item.condition || 'NEW';
        return `${idx + 1}. *${prodName}* (${cond})\n   Qty: ${qty} × ₹${price.toLocaleString('en-IN')} = ₹${(price * qty).toLocaleString('en-IN')}`;
      })
      .join('\n');
  } else {
    productSummary = 'Gaming products & accessories';
  }

  const primaryItem = order.items?.[0]?.product;
  const productName = primaryItem?.name || 'Gaming Item';
  const productQuantity = order.items?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 1;

  const orderTotal = `₹${(order.totalAmount || 0).toLocaleString('en-IN')}`;
  const subtotal = `₹${(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}`;
  const discount = `₹${(order.discountAmount || 0).toLocaleString('en-IN')}`;
  const shippingAmount = order.shippingAmount ? `₹${order.shippingAmount.toLocaleString('en-IN')}` : 'FREE';

  const amountDue = `₹${(order.amountDue || order.advanceAmount || order.totalAmount || 0).toLocaleString('en-IN')}`;
  const amountPaid = `₹${(order.amountPaid || 0).toLocaleString('en-IN')}`;
  const remainingAmount = `₹${(order.remainingAmount || order.remainingCodAmount || 0).toLocaleString('en-IN')}`;

  const upiId = storeSettings['payment_upi_id'] || 'malibu2u@upi';
  const storeName = storeSettings['store_name'] || 'Malibu2u Gaming';
  const supportPhone = formatDisplayPhoneNumber(storeSettings['whatsapp_number'] || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918078565355') || '+91 80785 65355';
  const supportWhatsApp = storeSettings['whatsapp_number'] || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918078565355';

  const variables: Record<string, string> = {
    '{{customer_name}}': user.name || 'Valued Gamer',
    '{{customer_phone}}': user.phone || 'N/A',
    '{{order_number}}': order.trackingNumber || order.id?.slice(0, 8) || 'N/A',
    '{{order_date}}': new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    '{{order_total}}': orderTotal,
    '{{subtotal}}': subtotal,
    '{{discount}}': discount,
    '{{shipping_amount}}': shippingAmount,
    '{{amount_due}}': amountDue,
    '{{amount_paid}}': amountPaid,
    '{{remaining_amount}}': remainingAmount,
    '{{payment_method}}': order.paymentMethod || 'UPI',
    '{{payment_reference}}': order.paymentReference || 'N/A',
    '{{upi_id}}': upiId,
    '{{product_name}}': productName,
    '{{product_summary}}': productSummary,
    '{{product_quantity}}': String(productQuantity),
    '{{delivery_address}}': addressText,
    '{{tracking_number}}': trackingNumber || order.trackingNumber || 'Pending AWB Generation',
    '{{estimated_delivery}}': estimatedDelivery || '3-5 Business Days',
    '{{store_name}}': storeName,
    '{{support_phone}}': supportPhone,
    '{{support_whatsapp}}': supportWhatsApp,
    '{{rejection_reason}}': rejectionReason || 'Transaction reference or screenshot could not be matched with bank statement.',
  };

  let rendered = templateBody;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.split(key).join(value);
  }

  return rendered;
}

/**
 * Sends or logs an automated WhatsApp notification for an order event.
 * Idempotent: checks template autoSend flag and prevents rapid duplicate triggers.
 */
export async function sendOrderNotification(
  eventKey: string,
  context: NotificationContext
): Promise<{ success: boolean; logId?: string; rendered?: string; whatsappUrl?: string; error?: string }> {
  try {
    await ensureDefaultTemplates();

    const { order } = context;
    if (!order || !order.id) {
      return { success: false, error: 'Order context required' };
    }

    // 1. Fetch Template
    const template = await prisma.whatsAppMessageTemplate.findUnique({
      where: { eventKey },
    });

    if (!template || !template.isActive || !template.autoSend) {
      return { success: false, error: `Template ${eventKey} is disabled or set to manual.` };
    }

    // 2. Fetch System Settings
    const allSettings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of allSettings) {
      settingsMap[s.key] = s.value;
    }

    // 3. Render Message Body
    const renderedBody = renderTemplate(template.body, context, settingsMap);

    // 4. Resolve Recipient Phone
    let recipientPhone = order.user?.phone || '';
    if (!recipientPhone && order.shippingAddressJson) {
      try {
        const addr = JSON.parse(order.shippingAddressJson);
        if (addr.phone) recipientPhone = addr.phone;
      } catch (e) {}
    }
    const normalizedRecipient = normalizeWhatsAppNumber(recipientPhone);

    // 5. Image for single-product orders
    let mediaUrl: string | null = null;
    if (order.items && order.items.length === 1) {
      const prod = order.items[0]?.product;
      mediaUrl = prod?.images?.[0]?.url || null;
    }

    // 6. Generate Direct WhatsApp Link (wa.me)
    const encoded = encodeURIComponent(renderedBody.trim());
    const targetWaNumber = normalizedRecipient || normalizeWhatsAppNumber(settingsMap['whatsapp_number'] || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918078565355');
    const whatsappUrl = `https://wa.me/${targetWaNumber}?text=${encoded}`;

    // 7. Check Idempotency (prevent duplicate send for same event within 2 minutes)
    const recentLog = await prisma.notificationLog.findFirst({
      where: {
        orderId: order.id,
        event: eventKey,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000),
        },
      },
    });

    if (recentLog) {
      return {
        success: true,
        logId: recentLog.id,
        rendered: renderedBody,
        whatsappUrl,
      };
    }

    // 8. Create Notification Log
    const log = await prisma.notificationLog.create({
      data: {
        orderId: order.id,
        event: eventKey,
        templateKey: template.eventKey,
        recipientPhone: targetWaNumber || 'N/A',
        recipientName: order.user?.name || 'Customer',
        messageBody: renderedBody,
        mediaUrl,
        status: 'SENT',
      },
    });

    return {
      success: true,
      logId: log.id,
      rendered: renderedBody,
      whatsappUrl,
    };
  } catch (error: any) {
    console.error(`Error sending notification for ${eventKey}:`, error);
    try {
      if (context.order?.id) {
        await prisma.notificationLog.create({
          data: {
            orderId: context.order.id,
            event: eventKey,
            recipientPhone: 'N/A',
            messageBody: 'Notification trigger failed',
            status: 'FAILED',
            error: error.message || 'Notification error',
          },
        });
      }
    } catch (e) {}
    return { success: false, error: error.message || 'Failed to dispatch notification' };
  }
}
