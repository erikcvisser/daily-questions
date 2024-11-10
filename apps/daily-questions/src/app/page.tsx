import PublicHome from '@/components/Home/PublicHome';
import InternalHomeWrapper from '@/components/Home/InternalHomeWrapper';
import { auth } from '@/lib/auth';

export default async function Index() {
  const session = await auth();

  return <>{session?.user ? <InternalHomeWrapper /> : <PublicHome />}</>;
}
