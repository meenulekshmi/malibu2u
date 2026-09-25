import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body || {};

    const cleanName = name ? String(name).trim() : '';
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPassword = password ? String(password) : '';
    const cleanPhone = phone ? String(phone).trim() : null;

    if (!cleanName) {
      return NextResponse.json({ error: 'Full Name is required' }, { status: 400 });
    }

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(cleanPassword);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        phone: cleanPhone || null,
        role: 'USER',
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'USER',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });

    response.cookies.set('malibu2u_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email address or phone number already exists. Please sign in.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
