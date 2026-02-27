import { signIn } from '@/lib/auth';

export async function GET(request: Request) {
  const provider =
    new URL(request.url).searchParams.get('provider') || 'google';
  await signIn(provider, { redirectTo: '/api/auth/mobile-redirect' });
}
