import { Button, Container, List, Title } from '@mantine/core';
import { NewQuestion } from '@/components/Questions/New';
import prisma from '@/lib/prisma';

export default async function Question() {
  const questions = await prisma.question.findMany();

  return (
    <Container>
      <Title order={1}>Add a question</Title>
      <NewQuestion />
    </Container>
  );
}
