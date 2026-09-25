import { prisma } from '@/lib/prisma';
import { sendOrderNotification } from '@/lib/notification-service';

export interface PaymentInstructions {
  method: string;
  upiId: string;
  accountName: string;
  instructions: string;
  supportContact: string;
  amountDue: number;
}

export interface PaymentVerificationResult {
  success: boolean;
  order?: any;
  error?: string;
}

export interface PaymentProvider {
  getInstructions(orderId: string): Promise<PaymentInstructions | null>;
  submitProof(orderId: string, reference: string, proofUrl?: string): Promise<PaymentVerificationResult>;
  confirmPayment(orderId: string, adminUserId: string): Promise<PaymentVerificationResult>;
  rejectPayment(orderId: string, reason: string, adminUserId: string): Promise<PaymentVerificationResult>;
}

/**
 * ManualPaymentProvider handles UPI, Direct Bank Transfer & manual verification.
 * Designed to be swappable with a future GatewayProvider (Razorpay, Cashfree, etc.).
 */
export class ManualPaymentProvider implements PaymentProvider {
  async getInstructions(orderId: string): Promise<PaymentInstructions | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: { include: { product: true } } },
    });

    if (!order) return null;

    const settings = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const upiId = map['payment_upi_id'] || 'malibu2u@upi';
    const accountName = map['payment_account_name'] || 'Malibu2u Gaming';
    const instructions =
      map['payment_instructions'] ||
      'Please complete the UPI payment and share your screenshot or transaction UTR number in this chat.';
    const supportContact = map['whatsapp_number'] || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918078565355';

    const amountDue = order.amountDue || order.advanceAmount || order.totalAmount;

    return {
      method: order.paymentMethod || 'UPI',
      upiId,
      accountName,
      instructions,
      supportContact,
      amountDue,
    };
  }

  async submitProof(orderId: string, reference: string, proofUrl?: string): Promise<PaymentVerificationResult> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true, items: { include: { product: true } } },
      });

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PROOF_SUBMITTED',
          paymentReference: reference.trim(),
          paymentProof: proofUrl ? proofUrl.trim() : order.paymentProof,
        },
        include: { user: true, items: { include: { product: true } } },
      });

      // Dispatch automated notification: PAYMENT_PROOF_RECEIVED
      await sendOrderNotification('PAYMENT_PROOF_RECEIVED', { order: updated });

      return { success: true, order: updated };
    } catch (err: any) {
      console.error('Error submitting payment proof:', err);
      return { success: false, error: err.message || 'Failed to submit payment proof' };
    }
  }

  async confirmPayment(orderId: string, adminUserId: string): Promise<PaymentVerificationResult> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true, items: { include: { product: true } } },
      });

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      const advance = order.advanceAmount || Math.ceil(order.totalAmount * 0.5);
      const paid = order.totalAmount; // or advance depending on method
      const remaining = Math.max(0, order.totalAmount - advance);

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          advancePaymentStatus: 'PAID',
          status: 'CONFIRMED',
          amountPaid: order.totalAmount,
          remainingAmount: 0,
        },
        include: { user: true, items: { include: { product: true } } },
      });

      // Dispatch automated notifications: PAYMENT_CONFIRMED and ORDER_CONFIRMED
      await sendOrderNotification('PAYMENT_CONFIRMED', { order: updated });
      await sendOrderNotification('ORDER_CONFIRMED', { order: updated });

      return { success: true, order: updated };
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      return { success: false, error: err.message || 'Failed to confirm payment' };
    }
  }

  async rejectPayment(orderId: string, reason: string, adminUserId: string): Promise<PaymentVerificationResult> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true, items: { include: { product: true } } },
      });

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REJECTED',
          rejectionReason: reason || 'Invalid payment screenshot or unmatched bank reference.',
        },
        include: { user: true, items: { include: { product: true } } },
      });

      // Dispatch automated notification: PAYMENT_REJECTED
      await sendOrderNotification('PAYMENT_REJECTED', {
        order: updated,
        rejectionReason: reason,
      });

      return { success: true, order: updated };
    } catch (err: any) {
      console.error('Error rejecting payment:', err);
      return { success: false, error: err.message || 'Failed to reject payment' };
    }
  }
}

export const manualPaymentProvider = new ManualPaymentProvider();
