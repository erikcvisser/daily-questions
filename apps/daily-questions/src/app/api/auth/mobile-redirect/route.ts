import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('authjs.session-token')?.value ||
    cookieStore.get('__Secure-authjs.session-token')?.value;

  if (token) {
    const redirectUrl = `dailyquestions://auth?token=${encodeURIComponent(token)}`;
    return new Response(
      `<html><body>
        <p>Signing you in...</p>
        <script>window.location.href = "${redirectUrl}";</script>
        <p><a href="${redirectUrl}">Tap here if not redirected</a></p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  return Response.redirect('https://dailyquestions.app/login');
}
