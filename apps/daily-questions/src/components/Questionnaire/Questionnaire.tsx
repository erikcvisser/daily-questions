import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Stack } from '@mantine/core';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { shouldShowQuestion } from '@/lib/utils';

// Dynamic imports for the form components
const QuestionnaireForm = dynamic(() => import('./QuestionnaireForm'));
const QuestionnaireMobileForm = dynamic(
  () => import('./QuestionnaireMobileForm')
);

export default async function Questionnaire({
  id,
  date,
}: {
  id?: string;
  date?: Date;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    notFound();
  }

  const allQuestions = await prisma.question.findMany({
    where: { status: 'ACTIVE', userId: user.id },
    orderBy: {
      position: 'asc',
    },
  });

  // If editing an existing submission, use its date, otherwise use provided date or today
  let submissionDate = date || new Date();
  let submission = null;

  if (id) {
    submission = await prisma.submission.findUnique({
      where: { userId: user.id, id: id },
      include: {
        answers: true,
      },
    });
    if (submission) {
      submissionDate = submission.date;
    }
  }

  // Filter questions based on frequency and date
  const questions = allQuestions.filter((q) =>
    shouldShowQuestion(q, submissionDate)
  );

  return (
    <>
      <Stack visibleFrom="sm">
        <QuestionnaireForm questions={questions} submission={submission} />
      </Stack>
      <Stack hiddenFrom="sm" p={0} maw="100%">
        <QuestionnaireMobileForm
          questions={questions}
          submission={submission}
        />
      </Stack>
    </>
  );
}
