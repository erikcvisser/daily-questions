import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Group, Title } from '@mantine/core';
import QuestionnaireForm from './QuestionnaireForm';
import { notFound } from 'next/navigation';

export default async function Questionnaire() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    notFound();
  }

  const questions = await prisma.question.findMany({
    where: { status: 'ACTIVE', userId: user.id },
  });
  return (
    <>
      <Group>
        <Title order={4}>Answer today&apos;s questions</Title>
      </Group>
      <QuestionnaireForm questions={questions} />
    </>
  );
}
