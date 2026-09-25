import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('malibu2u_session', '', {
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
