import {
  Container,
  Title,
  Text,
  Grid,
  GridCol,
  Stack,
  Space,
} from '@mantine/core';
import QuestionForm from '@/components/Questions/QuestionForm';
import prisma from '@/lib/prisma';
import LibraryQuestionsDisplay from '@/components/Questions/LibraryQuestionsDisplay';

export default async function AddQuestionPage() {
  const libraryQuestions = await prisma.libraryQuestion.findMany({
    include: {
      category: true,
    },
  });

  return (
    <Container size="xl">
      <Stack>
        <Title order={1}>Add a Question</Title>
        <Space h="md" />
        <QuestionForm />
        <Text ta="center" size="lg" fw={500}>
          OR
        </Text>
        <Title order={2}>Browse sample questions from our library</Title>
        <Grid>
          <GridCol>
            <LibraryQuestionsDisplay libraryQuestions={libraryQuestions} />
          </GridCol>
        </Grid>
      </Stack>
    </Container>
  );
}
