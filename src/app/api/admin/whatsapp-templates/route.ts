import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_WHATSAPP_TEMPLATES } from '@/lib/whatsapp-templates';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    // Ensure all default templates exist
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

    const templates = await prisma.whatsAppMessageTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const logs = await prisma.notificationLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: { id: true, trackingNumber: true, totalAmount: true },
        },
      },
    });

    return NextResponse.json({ templates, logs });
  } catch (error: any) {
    console.error('Error fetching WhatsApp templates:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, eventKey, name, description, body: templateBody, isActive, autoSend } = body;

    if (!id && !eventKey) {
      return NextResponse.json({ error: 'Template ID or eventKey is required' }, { status: 400 });
    }

    const where = id ? { id } : { eventKey };

    const updated = await prisma.whatsAppMessageTemplate.update({
      where,
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        body: templateBody !== undefined ? templateBody : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        autoSend: autoSend !== undefined ? Boolean(autoSend) : undefined,
      },
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    console.error('Error updating WhatsApp template:', error);
    return NextResponse.json({ error: error.message || 'Failed to update template' }, { status: 500 });
  }
}
