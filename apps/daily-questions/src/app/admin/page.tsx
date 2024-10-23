import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminTable } from '@/components/Admin/AdminTable';
import prisma from '@/lib/prisma';
import { Container, Title } from '@mantine/core';

export default async function AdminPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    include: {
      Submission: {
        orderBy: { date: 'desc' },
      },
      questions: true,
    },
  });
  console.log(users);
  if (session?.user?.email !== 'erikcvisser@gmail.com') {
    redirect('/');
  }

  return (
    <Container size="lg">
      <Title order={2} mb={'lg'}>
        Admin Dashboard
      </Title>
      <AdminTable users={users} />
    </Container>
  );
}
