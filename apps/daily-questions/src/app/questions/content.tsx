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
  const questions = await prisma.question.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      position: 'asc',
    },
  });

  return (
    <QuestionTable
      questions={questions}
      deleteQuestionAction={deleteQuestion}
      archiveQuestionAction={archiveQuestion}
      updateQuestionPositions={updateQuestionPositions}
    />
  );
}
