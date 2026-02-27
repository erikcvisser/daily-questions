import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (token) {
    const isSecure = url.protocol === 'https:';
    const cookieName = isSecure
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';

    const response = NextResponse.redirect(new URL('/overview', url.origin));
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  }

  return NextResponse.redirect(new URL('/login', url.origin));
}
