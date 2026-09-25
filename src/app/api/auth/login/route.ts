import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanPassword = password ? String(password) : '';

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Email address and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email address or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(cleanPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email address or password' }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'ADMIN',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('malibu2u_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed. Please check your credentials and try again.' },
      { status: 500 }
    );
  }
}
