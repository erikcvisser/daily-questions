import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dailyquestions.app';
  const isSecure = baseUrl.startsWith('https');

  if (token) {
    const cookieName = isSecure
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';

    const response = NextResponse.redirect(new URL('/overview', baseUrl));
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  return NextResponse.redirect(new URL('/login', baseUrl));
}
