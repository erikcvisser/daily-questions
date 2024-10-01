import PublicHome from '@/components/Home/PublicHome';
import InternalHome from '@/components/Home/InternalHome';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function Index() {
  const session = await auth();
  const userQuestions = session?.user
    ? await prisma.question.findMany({ where: { userId: session.user.id } })
    : [];

  return (
    <>
      {session?.user ? (
        <InternalHome userQuestions={userQuestions} />
      ) : (
        <PublicHome />
      )}
    </>
  );
}
