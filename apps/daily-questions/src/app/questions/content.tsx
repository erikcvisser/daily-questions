import QuestionTable from '@/components/Questions/QuestionTable';
import prisma from '@/lib/prisma';
import {
  deleteQuestion,
  archiveQuestion,
  updateQuestionPositions,
} from '@/lib/actions';
import { auth } from '@/lib/auth';

export default async function QuestionPageContent() {
  const session = await auth();
  const userId = session?.user?.id;

  const [questions, todaySubmission] = await Promise.all([
    prisma.question.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        position: 'asc',
      },
    }),
    prisma.submission.findFirst({
      where: {
        userId: userId,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
          lt: new Date(new Date().setHours(23, 59, 59, 999)), // End of today
        },
      },
    }),
  ]);

  return (
    <QuestionTable
      questions={questions}
      deleteQuestionAction={deleteQuestion}
      archiveQuestionAction={archiveQuestion}
      updateQuestionPositions={updateQuestionPositions}
      hasSubmissionToday={!!todaySubmission}
    />
  );
}
