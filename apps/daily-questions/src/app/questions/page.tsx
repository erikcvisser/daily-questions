import { Button, Container, List, Title } from '@mantine/core';
import QuestionTable from '@/components/Questions/QuestionTable';
import prisma from '@/lib/prisma';
import { BasicAppShell } from '@/components/AppShell/AppShell';
import { useRouter } from 'next/navigation';
import { deleteQuestion } from '@/lib/actions';

export default async function QuestionPage() {
  const questions = await prisma.question.findMany();

  return (
    <Container>
      <Title order={1}>My daily questions</Title>
      <Button component="a" href="/questions/new">
        Add question
      </Button>
      <QuestionTable
        questions={questions}
        deleteQuestionAction={deleteQuestion}
      />
    </Container>
  );
}
