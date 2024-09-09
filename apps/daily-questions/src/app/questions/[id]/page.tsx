import QuestionForm from '@/components/Questions/QuestionForm';
import prisma from '@/lib/prisma';
import { Container, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const question = await prisma.question.findUnique({
    where: {
      id: params.id,
    },
  });
  if (!question) {
    notFound();
  }
  return (
    <Container>
      <Title order={1}>Edit question</Title>
      {question && <QuestionForm question={question} />}
    </Container>
  );
}
