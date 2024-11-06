import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Admin } from '@/components/Admin/Admin';
import { initializeQueue, getQueueData } from '@/lib/actions';

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.email !== 'erikcvisser@gmail.com') {
    redirect('/');
  }

  const [users, libraryQuestions, categories, queueData] = await Promise.all([
    prisma.user.findMany({
      include: {
        submissions: { orderBy: { date: 'desc' } },
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.libraryQuestion.findMany({
      include: { category: true },
    }),
    prisma.category.findMany(),
    getQueueData(),
  ]);

  // Initialize queue on page load
  await initializeQueue();

  return (
    <Admin
      users={users}
      libraryQuestions={libraryQuestions}
      categories={categories}
      queueData={queueData}
    />
  );
}
