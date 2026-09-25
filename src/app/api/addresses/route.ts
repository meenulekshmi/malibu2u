import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      district,
      state,
      postalCode,
      label = 'Home',
      isDefault = false,
    } = body;

    if (!fullName || !phone || !addressLine1 || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Full Name, Phone, Address Line 1, City, and PIN Code are required.' },
        { status: 400 }
      );
    }

    // If marked as default, unset other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    } else {
      // If this is the user's first address, make it default automatically
      const count = await prisma.address.count({ where: { userId: user.userId } });
      if (count === 0) {
        body.isDefault = true;
      }
    }

    const address = await prisma.address.create({
      data: {
        userId: user.userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : null,
        landmark: landmark ? landmark.trim() : null,
        city: city.trim(),
        district: district ? district.trim() : null,
        state: state ? state.trim() : 'Kerala',
        postalCode: postalCode.trim(),
        label: label || 'Home',
        isDefault: Boolean(body.isDefault !== undefined ? body.isDefault : isDefault),
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create address' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      district,
      state,
      postalCode,
      label,
      isDefault,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        fullName: fullName ? fullName.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        addressLine1: addressLine1 ? addressLine1.trim() : undefined,
        addressLine2: addressLine2 !== undefined ? (addressLine2 ? addressLine2.trim() : null) : undefined,
        landmark: landmark !== undefined ? (landmark ? landmark.trim() : null) : undefined,
        city: city ? city.trim() : undefined,
        district: district !== undefined ? (district ? district.trim() : null) : undefined,
        state: state ? state.trim() : undefined,
        postalCode: postalCode ? postalCode.trim() : undefined,
        label: label || undefined,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted address was default, promote the newest remaining address
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete address' }, { status: 500 });
  }
}
