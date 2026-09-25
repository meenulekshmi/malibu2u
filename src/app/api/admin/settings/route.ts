import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const activeNumber = map['whatsapp_number'] || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 80785 65355';
    const upiId = map['payment_upi_id'] || 'malibu2u@upi';
    const accountName = map['payment_account_name'] || 'Malibu2u Gaming';
    const paymentInstructions = map['payment_instructions'] || 'Please complete the payment and send the payment screenshot / UTR number in this WhatsApp conversation.';
    const storeName = map['store_name'] || 'Malibu2u';

    return NextResponse.json({
      whatsappNumber: activeNumber,
      paymentUpiId: upiId,
      paymentAccountName: accountName,
      paymentInstructions: paymentInstructions,
      storeName: storeName,
      settings: map,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      whatsappNumber,
      paymentUpiId,
      paymentAccountName,
      paymentInstructions,
      storeName,
    } = body;

    const upsertSetting = async (key: string, value: string) => {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    };

    if (whatsappNumber && typeof whatsappNumber === 'string' && whatsappNumber.trim() !== '') {
      const normalized = normalizeWhatsAppNumber(whatsappNumber);
      if (!normalized) {
        return NextResponse.json({ error: 'Invalid phone number format. Please provide a valid 10-digit or international number.' }, { status: 400 });
      }
      const trimmedValue = whatsappNumber.trim();
      await upsertSetting('whatsapp_number', trimmedValue);
    }

    if (paymentUpiId !== undefined) {
      await upsertSetting('payment_upi_id', paymentUpiId.trim());
    }

    if (paymentAccountName !== undefined) {
      await upsertSetting('payment_account_name', paymentAccountName.trim());
    }

    if (paymentInstructions !== undefined) {
      await upsertSetting('payment_instructions', paymentInstructions.trim());
    }

    if (storeName !== undefined) {
      await upsertSetting('store_name', storeName.trim());
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update settings' }, { status: 500 });
  }
}
