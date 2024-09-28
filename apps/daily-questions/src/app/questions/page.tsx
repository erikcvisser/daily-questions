import { Button, Container, Title } from '@mantine/core';
import QuestionTable from '@/components/Questions/QuestionTable';
import prisma from '@/lib/prisma';
import { deleteQuestion, archiveQuestion } from '@/lib/actions';

export default async function QuestionPage() {
  const questions = await prisma.question.findMany({
    orderBy: {
      position: 'asc',
    },
  });

  return (
    <Container>
      <Title order={1}>My daily questions</Title>
      <Button component="a" href="/questions/new">
        Add question
      </Button>
      <QuestionTable
        questions={questions}
        deleteQuestionAction={deleteQuestion}
        archiveQuestionAction={archiveQuestion}
      />
    </Container>
  );
}
