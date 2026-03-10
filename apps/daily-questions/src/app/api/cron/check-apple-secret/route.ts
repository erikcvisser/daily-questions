import { Resend } from 'resend';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const secret = process.env.AUTH_APPLE_SECRET;
  if (!secret) {
    return Response.json({ status: 'skipped', reason: 'no AUTH_APPLE_SECRET set' });
  }

  // Decode JWT payload (no verification needed, just reading exp)
  const payload = JSON.parse(
    Buffer.from(secret.split('.')[1], 'base64url').toString()
  );
  const expiresAt = new Date(payload.exp * 1000);
  const daysUntilExpiry = Math.floor(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 30) {
    return Response.json({ status: 'ok', daysUntilExpiry });
  }

  const resend = new Resend(process.env.AUTH_RESEND_KEY);
  await resend.emails.send({
    from: 'Daily Questions <mail@dailyquestions.app>',
    to: 'erikcvisser@gmail.com',
    subject: `Apple Sign-In secret expires in ${daysUntilExpiry} days`,
    html: `
      <h2>Apple Client Secret Expiring Soon</h2>
      <p>Your AUTH_APPLE_SECRET expires on <strong>${expiresAt.toDateString()}</strong> (${daysUntilExpiry} days from now).</p>
      <p>Regenerate it by running:</p>
      <pre>APPLE_ID=... APPLE_KEY_ID=... APPLE_TEAM_ID=... npx ts-node apps/daily-questions/scripts/generate-apple-secret.ts /path/to/key.p8</pre>
      <p>Then update AUTH_APPLE_SECRET in Coolify and redeploy.</p>
    `,
  });

  return Response.json({ status: 'warning_sent', daysUntilExpiry });
}
