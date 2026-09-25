import { prisma } from '@/lib/prisma';
import { formatDisplayPhoneNumber, normalizeWhatsAppNumber } from '@/lib/whatsapp';

export interface DefaultTemplateConfig {
  eventKey: string;
  name: string;
  description: string;
  body: string;
  autoSend: boolean;
}

export const DEFAULT_WHATSAPP_TEMPLATES: DefaultTemplateConfig[] = [
  {
    eventKey: 'ORDER_RECEIVED',
    name: 'Order Received',
    description: 'Triggered automatically when a customer initiates/places an order.',
    autoSend: true,
    body: `🛍️ *Order Received!*

Hi {{customer_name}} 👋

Thank you for choosing *{{store_name}}*! We have received your order.

🧾 *Order ID:* #{{order_number}}
📅 *Date:* {{order_date}}

📦 *Items Ordered:*
{{product_summary}}

💰 *Order Total:* {{order_total}}
📍 *Delivery Address:*
{{delivery_address}}

Our team is reviewing your order details. We will share the payment instructions shortly.

Need help? Reach us at {{support_phone}} ❤️`,
  },
  {
    eventKey: 'PAYMENT_REQUIRED',
    name: 'Payment Required',
    description: 'Triggered when manual UPI/bank payment is requested from the customer.',
    autoSend: true,
    body: `💳 *Payment Required*

Hi {{customer_name}} 👋

Your Malibu2u order #{{order_number}} is ready for payment confirmation.

🎮 *Order Summary:*
{{product_summary}}

💵 *Order Total:* {{order_total}}
⚡ *Amount to Pay Now:* {{amount_due}}

━━━━━━━━━━━━━━━━━━━━━
📲 *PAYMENT DETAILS (UPI):*
• *UPI ID:* \`{{upi_id}}\`
• *Account Name:* {{store_name}}
━━━━━━━━━━━━━━━━━━━━━

📌 *Instructions:*
Please complete the payment and *reply with your payment screenshot / UTR transaction reference* in this chat.

Once verified by our team, your order will be confirmed immediately!

Thank you for shopping with {{store_name}} ❤️`,
  },
  {
    eventKey: 'PAYMENT_PROOF_RECEIVED',
    name: 'Payment Proof Received',
    description: 'Sent to the customer when they submit payment screenshot/reference.',
    autoSend: true,
    body: `📸 *Payment Proof Received!*

Hi {{customer_name}} 👋

We received your payment proof for Order #{{order_number}}.

🔍 *Status:* Under Verification
💵 *Amount Submitted:* {{amount_due}}
🔢 *Ref / UTR:* {{payment_reference}}

Our verification desk is checking the transaction. You will receive an instant confirmation as soon as it is approved!

Thank you for your patience! 🎮`,
  },
  {
    eventKey: 'PAYMENT_CONFIRMED',
    name: 'Payment Confirmed',
    description: 'Triggered when admin verifies and confirms the payment.',
    autoSend: true,
    body: `✅ *Payment Verified & Confirmed!*

Hi {{customer_name}} 🎉

Great news! We have verified your payment of *{{amount_paid}}* for Order #{{order_number}}.

💳 *Payment Status:* PAID
🚚 *Remaining Balance:* {{remaining_amount}}
📦 *Fulfillment Status:* CONFIRMED

Your gaming gear is now queued for safe packaging and quality inspection!

Track your order anytime in your *Malibu2u Order Vault*. 🚀`,
  },
  {
    eventKey: 'PAYMENT_REJECTED',
    name: 'Payment Rejected',
    description: 'Triggered when admin rejects the submitted payment proof.',
    autoSend: true,
    body: `⚠️ *Payment Verification Issue*

Hi {{customer_name}},

We were unable to verify your payment proof for Order #{{order_number}}.

💵 *Amount Due:* {{amount_due}}
📌 *Reason:* {{rejection_reason}}

Please double check the transaction details or re-send a clear screenshot / valid UTR reference.

If you need urgent assistance, contact support at {{support_phone}}.`,
  },
  {
    eventKey: 'ORDER_CONFIRMED',
    name: 'Order Confirmed',
    description: 'Triggered when an order transitions to Confirmed status.',
    autoSend: true,
    body: `🎉 *Order Confirmed!*

Hi {{customer_name}} 👋

Your Malibu2u Order #{{order_number}} is officially confirmed!

{{product_summary}}

Total Value: {{order_total}}
Delivery to: {{delivery_address}}

Our warehouse crew has started preparing your package! 📦`,
  },
  {
    eventKey: 'PROCESSING',
    name: 'Processing',
    description: 'Triggered when order quality check and processing begins.',
    autoSend: true,
    body: `⚙️ *Order in Processing*

Hi {{customer_name}},

Your Order #{{order_number}} has entered our 42-Point Diagnostic & Quality Processing stage.

We ensure all discs, consoles, and accessories pass stringent performance tests before dispatch. 🛡️`,
  },
  {
    eventKey: 'PACKED',
    name: 'Packed',
    description: 'Triggered when order is packed in tamper-proof packaging.',
    autoSend: true,
    body: `📦 *Order Packed & Ready!*

Hi {{customer_name}},

Order #{{order_number}} is packed in heavy-duty tamper-proof packaging and is ready for courier pickup! 🚚`,
  },
  {
    eventKey: 'SHIPPED',
    name: 'Shipped',
    description: 'Triggered when order is handed over to the courier with tracking number.',
    autoSend: true,
    body: `🚀 *Order Shipped!*

Hi {{customer_name}} 📦

Your Malibu2u package for Order #{{order_number}} has been dispatched!

🚛 *Tracking Number / AWB:* {{tracking_number}}
📅 *Estimated Delivery:* {{estimated_delivery}}
📍 *Destination:* {{delivery_address}}

Get your controllers ready! 🎮`,
  },
  {
    eventKey: 'OUT_FOR_DELIVERY',
    name: 'Out for Delivery',
    description: 'Triggered when courier agent is out for final delivery.',
    autoSend: true,
    body: `🛵 *Out for Delivery Today!*

Hi {{customer_name}} ⚡

Your Order #{{order_number}} is out for delivery today with our delivery executive!

💵 *Amount Due on Delivery (COD):* {{remaining_amount}}

Please keep your phone available. Happy Gaming! 🎯`,
  },
  {
    eventKey: 'DELIVERED',
    name: 'Delivered',
    description: 'Triggered when customer receives the order.',
    autoSend: true,
    body: `🏆 *Order Delivered!*

Hi {{customer_name}} 🎮

Your Order #{{order_number}} has been successfully delivered!

We hope you love your gaming gear. Enjoy 7-Day Replacement Warranty on your purchase.

Loved the service? Leave a review on {{store_name}}! ⭐⭐⭐⭐⭐`,
  },
  {
    eventKey: 'CANCELLED',
    name: 'Cancelled',
    description: 'Triggered when an order is cancelled.',
    autoSend: true,
    body: `❌ *Order Cancelled*

Hi {{customer_name}},

Your Malibu2u Order #{{order_number}} has been cancelled.

If you have already paid or this was a mistake, please reach out immediately on {{support_whatsapp}}.`,
  },
  {
    eventKey: 'RETURN_REQUESTED',
    name: 'Return Requested',
    description: 'Triggered when a return or replacement request is submitted.',
    autoSend: true,
    body: `🔄 *Return Request Received*

Hi {{customer_name}},

We received your return / replacement request for Order #{{order_number}}.

Our warranty support team will review your case and arrange reverse pickup if applicable.`,
  },
  {
    eventKey: 'REFUND',
    name: 'Refund Processed',
    description: 'Triggered when a refund has been issued.',
    autoSend: true,
    body: `💰 *Refund Processed*

Hi {{customer_name}},

A refund for Order #{{order_number}} has been processed to your original payment method / UPI account.

Thank you for shopping with {{store_name}}.`,
  },
];

/**
 * Initializes database with default WhatsApp message templates if not already present.
 */
export async function ensureDefaultTemplates(): Promise<void> {
  try {
    for (const tpl of DEFAULT_WHATSAPP_TEMPLATES) {
      await prisma.whatsAppMessageTemplate.upsert({
        where: { eventKey: tpl.eventKey },
        update: {},
        create: {
          eventKey: tpl.eventKey,
          name: tpl.name,
          description: tpl.description,
          body: tpl.body,
          isActive: true,
          autoSend: tpl.autoSend,
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring default WhatsApp templates:', error);
  }
}
