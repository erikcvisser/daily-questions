'use server';

import { Question, QuestionStatus } from '@prisma/client';
import { createQuestionSchema } from './definitions';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';

const CreateQuestion = createQuestionSchema;
export async function createQuestion(formData: any) {
  console.log(formData);
  const session = await auth();
  const { title, type, targetBool, targetInt } = CreateQuestion.parse({
    title: formData['title'],
    type: formData['type'],
    targetBool: formData['targetBool'] || undefined,
    targetInt: formData['targetInt'] || undefined,
    userId: session?.user?.id || '1',
  });
  await prisma.question.create({
    data: {
      title,
      type,
      ...(targetBool && { targetBool }),
      ...(targetInt && { targetInt }),
      status: 'ACTIVE',
      userId: session?.user?.id || '1',
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

export async function updateQuestion(id: string, formData: any) {
  const { title, type, targetBool, targetInt } = CreateQuestion.parse({
    title: formData['title'],
    type: formData['type'],
    targetBool: formData['targetBool'] || undefined,
    targetInt: formData['targetInt'] || undefined,
  });
  await prisma.question.update({
    where: {
      id: id,
    },
    data: {
      title,
      type,
      ...(targetBool && { targetBool }),
      ...(targetInt && { targetInt }),
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

export async function deleteQuestion(question: Question) {
  console.log('delete question', question);
  await prisma.question.delete({
    where: {
      id: question.id,
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

export async function archiveQuestion(question: Question) {
  console.log('archive question', question);
  await prisma.question.update({
    where: {
      id: question.id,
    },
    data: {
      status: 'INACTIVE',
    },
  });
  revalidatePath('/questions');
  redirect('/questions');
}

export async function submitQuestionnaire(formData: any) {
  console.log(formData);
  const session = await auth();
  const answers = [];
  for (const key in formData.answers) {
    answers.push({
      questionId: key,
      answer: formData.answers[key].toString(),
    });
  }
  console.log(answers);
  await prisma.submission.create({
    data: {
      userId: session?.user?.id || '1',
      date: formData['date'],
      answers: { create: answers },
    },
  });
  revalidatePath('/overview');
  redirect('/overview');
}

export async function updateQuestionnaire(id: string, formData: any) {
  const session = await auth();
  const answers = [];
  for (const key in formData.answers) {
    answers.push({
      questionId: key,
      answer: formData.answers[key].toString(),
    });
  }

  await prisma.submission.update({
    where: {
      id: id,
    },
    data: {
      userId: session?.user?.id || '1',
      date: formData['date'],
      answers: {
        deleteMany: {},
        create: answers,
      },
    },
  });

  revalidatePath('/overview');
  redirect('/overview');
}

export async function signInPostmark(formData: FormData) {
  signIn('postmark', formData);
}

export async function deleteSubmission(id: string) {
  await prisma.submission.delete({
    where: {
      id: id,
    },
  });
  revalidatePath('/overview');
}

export async function copyLibraryQuestions(questionIds: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const libraryQuestions = await prisma.libraryQuestion.findMany({
    where: { id: { in: questionIds } },
  });

  const userQuestions = libraryQuestions.map((libQ) => ({
    title: libQ.title,
    type: libQ.type,
    status: 'ACTIVE',
    userId: session?.user?.id || '1',
    libraryQuestionId: libQ.id,
    // Set default values for targetInt and targetBool if necessary
    targetInt: libQ.type === 'INTEGER' ? 0 : undefined,
    targetBool: libQ.type === 'BOOLEAN' ? false : undefined,
  }));

  await prisma.question.createMany({
    data: userQuestions.map((q) => ({
      ...q,
      status: q.status as QuestionStatus,
    })),
  });

  revalidatePath('/questions');
  redirect('/questions');
}
