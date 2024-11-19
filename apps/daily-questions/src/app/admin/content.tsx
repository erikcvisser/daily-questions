import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Admin } from '@/components/Admin/Admin';
import { revalidatePath } from 'next/cache';

export default async function AdminContent() {
  const session = await auth();
  if (session?.user?.email !== 'erikcvisser@gmail.com') {
    redirect('/');
  }

  async function refresh() {
    'use server';
    revalidatePath('/admin');
  }

  const [users, libraryQuestions, categories] = await Promise.all([
    prisma.user.findMany({
      include: {
        submissions: { orderBy: { date: 'desc' } },
        pushSubscriptions: true,
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.libraryQuestion.findMany({
      include: { category: true },
    }),
    prisma.category.findMany(),
  ]);

  return (
    <Admin
      users={users}
      libraryQuestions={libraryQuestions}
      categories={categories}
      refresh={refresh}
    />
  );
}
