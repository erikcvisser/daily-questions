import { Button, Container, Title, Group, Stack, Space } from '@mantine/core';
import QuestionTable from '@/components/Questions/QuestionTable';
import prisma from '@/lib/prisma';
import {
  deleteQuestion,
  archiveQuestion,
  updateQuestionPositions,
} from '@/lib/actions';
import { auth } from '@/lib/auth';

export default async function QuestionPage() {
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
    <Container size="xl">
      <Stack>
        <Group justify="space-between" align="center">
          <Title order={2}>My Daily Questions</Title>
          <Button
            component="a"
            href="/questions/new"
            size="md"
            variant="filled"
            color="blue"
          >
            Add Question
          </Button>
        </Group>
        <Space h="md" />
        <QuestionTable
          questions={questions}
          deleteQuestionAction={deleteQuestion}
          archiveQuestionAction={archiveQuestion}
          updateQuestionPositions={updateQuestionPositions}
        />
      </Stack>
    </Container>
  );
}
