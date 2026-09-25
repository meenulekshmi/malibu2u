/**
 * Utility functions for WhatsApp phone number normalization, message building, and URL generation.
 */

/**
 * Normalizes a raw phone number into an international numeric string for WhatsApp.
 * - Strips non-numeric characters (spaces, +, hyphens, brackets, etc.)
 * - Prepends '91' (India) only if the input digit count is exactly 10.
 * - Preserves existing country codes (e.g. 11+ digits or 12 digits starting with 91).
 * - Returns `null` if the input is missing, empty, 'PLACEHOLDER', 'NOT_CONFIGURED', or invalid.
 */
export const DEFAULT_WHATSAPP_NUMBER = '918078565355';

export function normalizeWhatsAppNumber(rawNumber?: string | null): string | null {
  const targetNumber = (rawNumber && rawNumber.trim() !== '' && rawNumber !== 'PLACEHOLDER' && rawNumber !== 'NOT_CONFIGURED')
    ? rawNumber
    : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;

  if (!targetNumber) return DEFAULT_WHATSAPP_NUMBER;

  const trimmed = targetNumber.trim();
  const digits = trimmed.replace(/[^0-9]/g, '');

  if (!digits || digits.length === 0) {
    return DEFAULT_WHATSAPP_NUMBER;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length >= 11) {
    return digits;
  }

  return DEFAULT_WHATSAPP_NUMBER;
}

/**
 * Formats a raw phone number for human-readable display on UI pages (e.g., Contact page, Admin).
 * Example: '919876543210' or '9876543210' -> '+91 98765 43210'
 */
export function formatDisplayPhoneNumber(rawNumber?: string | null): string | null {
  const targetNumber = (rawNumber && rawNumber.trim() !== '') 
    ? rawNumber 
    : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const normalized = normalizeWhatsAppNumber(targetNumber);
  if (!normalized) return null;

  // Format 12-digit Indian numbers (91XXXXXXXXXX) -> +91 XXXXX XXXXX
  if (normalized.length === 12 && normalized.startsWith('91')) {
    const mainNumber = normalized.slice(2);
    return `+91 ${mainNumber.slice(0, 5)} ${mainNumber.slice(5)}`;
  }

  // Generic fallback with '+'
  return `+${normalized}`;
}

/**
 * Generates a wa.me WhatsApp direct chat URL with an encoded message.
 * Returns `null` if the phone number is unconfigured or invalid.
 */
export function getWhatsAppUrl(
  rawNumber?: string | null,
  message: string = 'Hi Malibu2u, I need help with a product or order.'
): string | null {
  const targetNumber = (rawNumber && rawNumber.trim() !== '') 
    ? rawNumber 
    : process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const normalized = normalizeWhatsAppNumber(targetNumber);
  if (!normalized) return null;

  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
}

/**
 * Generates a WhatsApp URL for Customer Support (Contact Page).
 */
export function getWhatsAppContactUrl(rawNumber?: string | null): string | null {
  return getWhatsAppUrl(
    rawNumber,
    'Hi Malibu2u, I would like to contact customer support.'
  );
}

/**
 * Generates a WhatsApp URL for a general Product inquiry.
 */
export function getWhatsAppProductUrl(
  productName: string,
  sku?: string,
  rawNumber?: string | null
): string | null {
  const message = sku && sku.trim() !== ''
    ? `Hi Malibu2u, I am interested in ${productName} (SKU: ${sku}). Could you please provide more details?`
    : `Hi Malibu2u, I am interested in ${productName}. Could you please provide more details?`;

  return getWhatsAppUrl(rawNumber, message);
}

/**
 * Generates a WhatsApp URL for Sell/Trade inquiries.
 */
export function getWhatsAppSellTradeUrl(
  itemName?: string,
  rawNumber?: string | null
): string | null {
  const message = itemName && itemName.trim() !== ''
    ? `Hi Malibu2u, I would like to sell/trade my ${itemName.trim()}.`
    : `Hi Malibu2u, I would like to inquire about selling or trading my gaming gear.`;

  return getWhatsAppUrl(rawNumber, message);
}

export interface SingleProductOrderDetails {
  orderId?: string;
  productName: string;
  sku?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * Builds the WhatsApp order message for a single product with Order ID.
 */
export function buildProductOrderMessage(details: SingleProductOrderDetails): string {
  const total = details.unitPrice * details.quantity;
  const advance = Math.ceil(total * 0.5);
  const remaining = total - advance;

  const lines = [
    "Hi Malibu2u! I'd like to place an order.",
    "",
  ];

  if (details.orderId) {
    lines.push("🧾 ORDER ID", "", details.orderId, "");
  }

  lines.push(
    "🛍 PRODUCT DETAILS",
    "",
    `• Product: ${details.productName}`,
    `• SKU: ${details.sku || 'N/A'}`,
    `• Quantity: ${details.quantity}`,
    "",
    "💰 ORDER SUMMARY",
    "",
    `• Unit Price: ₹${details.unitPrice.toLocaleString('en-IN')}`,
    `• Total: ₹${total.toLocaleString('en-IN')}`,
    `• Advance (50%): ₹${advance.toLocaleString('en-IN')}`,
    `• Remaining: ₹${remaining.toLocaleString('en-IN')}`,
    "",
    "👤 CUSTOMER DETAILS",
    "",
    `• Name: ${details.userName || 'Customer'}`,
    `• Email: ${details.userEmail || 'N/A'}`,
    "",
    "💳 PAYMENT",
    "",
    "I understand that a 50% advance payment is required.",
    "",
    "Please share the payment details to confirm my order.",
    "",
    "Thank you!"
  );

  return lines.join('\n');
}

export interface CartOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CartOrderDetails {
  orderId?: string;
  items: CartOrderItem[];
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * Builds the WhatsApp order message for multiple cart items with Order ID.
 */
export function buildCartOrderMessage(details: CartOrderDetails): string {
  const itemLines = details.items.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    return `${index + 1}. ${item.name} × ${item.quantity}\n   ₹${itemTotal.toLocaleString('en-IN')}`;
  });

  const total = details.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const advance = Math.ceil(total * 0.5);
  const remaining = total - advance;

  const lines = [
    "Hi Malibu2u! I'd like to place an order.",
    "",
  ];

  if (details.orderId) {
    lines.push("🧾 ORDER ID", "", details.orderId, "");
  }

  lines.push(
    "🛍 ORDER ITEMS",
    "",
    ...itemLines,
    "",
    "💰 ORDER SUMMARY",
    "",
    `• Total: ₹${total.toLocaleString('en-IN')}`,
    `• Advance (50%): ₹${advance.toLocaleString('en-IN')}`,
    `• Remaining: ₹${remaining.toLocaleString('en-IN')}`,
    "",
    "👤 CUSTOMER DETAILS",
    "",
    `• Name: ${details.userName || 'Customer'}`,
    `• Email: ${details.userEmail || 'N/A'}`,
    "",
    "💳 PAYMENT",
    "",
    "I understand that a 50% advance payment is required.",
    "",
    "Please share the payment details to confirm my order.",
    "",
    "Thank you!"
  );

  return lines.join('\n');
}

/**
 * Generates the WhatsApp URL for a Single Product Order.
 */
export function getProductOrderWhatsAppUrl(
  details: SingleProductOrderDetails,
  rawNumber?: string | null
): string | null {
  const message = buildProductOrderMessage(details);
  return getWhatsAppUrl(rawNumber, message);
}

/**
 * Generates the WhatsApp URL for a Multi-Item Cart Order.
 */
export function getCartOrderWhatsAppUrl(
  details: CartOrderDetails,
  rawNumber?: string | null
): string | null {
  const message = buildCartOrderMessage(details);
  return getWhatsAppUrl(rawNumber, message);
}
