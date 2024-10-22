import PublicHome from '@/components/Home/PublicHome';
import InternalHome from '@/components/Home/InternalHome';
import { auth } from '@/lib/auth';
import { Suspense } from 'react';

export default async function Index() {
  const session = await auth();

  return (
    <>
      {session?.user ? (
        <Suspense fallback={<div>Loading...</div>}>
          <InternalHome />
        </Suspense>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <PublicHome />
        </Suspense>
      )}
    </>
  );
}
