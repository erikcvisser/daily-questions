import QuestionForm from '@/components/Questions/QuestionForm';
import prisma from '@/lib/prisma';
import { Container, Title, Stack, Space } from '@mantine/core';
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
    <Container size="xl" mt="lg">
      <Stack>
        <Title order={2}>Edit question</Title>
        <Space h="md" />
        {question && <QuestionForm question={question} />}
      </Stack>
    </Container>
  );
}
