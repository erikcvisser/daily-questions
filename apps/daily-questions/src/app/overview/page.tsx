import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Container, Title } from '@mantine/core';
import CalendarComp from '@/components/Overview/Calendar';
import SubmissionsTable from '@/components/Overview/Table';

export default async function OverviewPage() {
  const session = await auth();
  const submissions = await prisma.submission.findMany({
    include: {
      answers: {
        include: { question: true },
      },
    },
    where: { userId: session?.user?.id },
    orderBy: { date: 'desc' },
  });

  return (
    <Container>
      <Title order={2}>Overview</Title>
      <CalendarComp submissions={submissions} />
      <SubmissionsTable submissions={submissions} />
    </Container>
  );
}
