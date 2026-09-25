import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'whatsapp_number' },
    });

    const activeNumber = setting?.value || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 98765 43210';
    return NextResponse.json({ whatsappNumber: activeNumber });
  } catch (error) {
    return NextResponse.json({ whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 98765 43210' });
  }
}
