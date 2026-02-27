import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

async function getOrigin() {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('x-forwarded-host') || h.get('host') || 'dailyquestions.app';
  return { origin: `${proto}://${host}`, isSecure: proto === 'https' };
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const { origin, isSecure } = await getOrigin();

  if (token) {
    const cookieName = isSecure
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';

    const response = NextResponse.redirect(new URL('/overview', origin));
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  return NextResponse.redirect(new URL('/login', origin));
}
