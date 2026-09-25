import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'whatsapp_number' },
    });

    const activeNumber = setting?.value || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 98765 43210';
    return NextResponse.json({ whatsappNumber: activeNumber });
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
    const { whatsappNumber } = body;

    if (!whatsappNumber || typeof whatsappNumber !== 'string' || whatsappNumber.trim() === '') {
      return NextResponse.json({ error: 'A valid WhatsApp phone number is required' }, { status: 400 });
    }

    const normalized = normalizeWhatsAppNumber(whatsappNumber);
    if (!normalized) {
      return NextResponse.json({ error: 'Invalid phone number format. Please provide a valid 10-digit or international number.' }, { status: 400 });
    }

    const trimmedValue = whatsappNumber.trim();

    // Persist to database
    const setting = await prisma.systemSetting.upsert({
      where: { key: 'whatsapp_number' },
      update: { value: trimmedValue },
      create: { key: 'whatsapp_number', value: trimmedValue },
    });

    // Optionally sync .env and .env.local files
    try {
      const envContent = `NEXT_PUBLIC_WHATSAPP_NUMBER="${trimmedValue}"\n`;
      const rootDir = process.cwd();
      fs.writeFileSync(path.join(rootDir, '.env'), envContent, 'utf-8');
      fs.writeFileSync(path.join(rootDir, '.env.local'), envContent, 'utf-8');
    } catch (e) {
      console.warn('Could not rewrite env files:', e);
    }

    return NextResponse.json({ success: true, whatsappNumber: setting.value });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update settings' }, { status: 500 });
  }
}
