import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners', banners: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    const { title, subtitle, image, buttonText, buttonUrl, displayOrder, active } = body;

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        title: String(title).trim(),
        subtitle: subtitle ? String(subtitle).trim() : null,
        image: String(image).trim(),
        buttonText: buttonText ? String(buttonText).trim() : 'Shop Now',
        buttonUrl: buttonUrl ? String(buttonUrl).trim() : '/shop',
        displayOrder: Number(displayOrder) || 0,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    const { id, title, subtitle, image, buttonText, buttonUrl, displayOrder, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: title ? String(title).trim() : undefined,
        subtitle: subtitle !== undefined ? (subtitle ? String(subtitle).trim() : null) : undefined,
        image: image ? String(image).trim() : undefined,
        buttonText: buttonText !== undefined ? String(buttonText).trim() : undefined,
        buttonUrl: buttonUrl !== undefined ? String(buttonUrl).trim() : undefined,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
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
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
