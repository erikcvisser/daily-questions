import { Button, Container, List, Title } from '@mantine/core';
import { QuestionItem } from '@/components/Questions/QuestionItem';
import prisma from '@/lib/prisma';

export default async function Question() {
  const questions = await prisma.question.findMany();

  return (
    <Container>
      <Title order={1}>My daily questions</Title>
      <Button component="a" href="/questions/create">
        Add question
      </Button>
      <QuestionItem questions={questions} />
    </Container>
  );
}
