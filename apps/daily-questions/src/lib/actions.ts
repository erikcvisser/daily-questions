'use server';

import { Question } from '@prisma/client';
import { createQuestionSchema } from './definitions';
import prisma from './prisma';
import { auth } from './auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CreateQuestion = createQuestionSchema;
export async function createQuestion(formData: any) {
  console.log(formData);
  const session = await auth();
  let { title, type, targetBool, targetInt } = CreateQuestion.parse({
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
  const session = await auth();
  let { title, type, targetBool, targetInt } = CreateQuestion.parse({
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
