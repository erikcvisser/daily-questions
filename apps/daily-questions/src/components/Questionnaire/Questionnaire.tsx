import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import QuestionnaireForm from './QuestionnaireForm';
import { notFound } from 'next/navigation';

export default async function Questionnaire({ id }: { id?: string }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    notFound();
  }

  const questions = await prisma.question.findMany({
    where: { status: 'ACTIVE', userId: user.id },
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
      <QuestionnaireForm questions={questions} submission={submission} />
    </>
  );
}
