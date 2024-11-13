import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Container } from '@mantine/core';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

// Dynamic imports for the form components
const QuestionnaireForm = dynamic(() => import('./QuestionnaireForm'));
const QuestionnaireMobileForm = dynamic(
  () => import('./QuestionnaireMobileForm')
);

export default async function Questionnaire({ id }: { id?: string }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    notFound();
  }

  const questions = await prisma.question.findMany({
    where: { status: 'ACTIVE', userId: user.id },
    orderBy: {
      position: 'asc',
    },
  });
  let submission = null;
  if (id) {
    submission = await prisma.submission.findUnique({
      where: { userId: user.id, id: id },
      include: {
        answers: true,
      },
    });
  }

  return (
    <>
      <Container visibleFrom="sm">
        <QuestionnaireForm questions={questions} submission={submission} />
      </Container>
      <Container hiddenFrom="sm" p={0}>
        <QuestionnaireMobileForm
          questions={questions}
          submission={submission}
        />
      </Container>
    </>
  );
}
