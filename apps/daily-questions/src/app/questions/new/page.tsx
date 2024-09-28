import { Container, Title, Text, Grid, GridCol } from '@mantine/core';
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
    <Container>
      <Title order={2}>Add a Question</Title>
      <QuestionForm />
      <Text ta="center" mt="md">
        OR
      </Text>
      <Title order={3} mt="xl">
        Browse sample questions from our library
      </Title>
      <Grid mt="md">
        <GridCol>
          <LibraryQuestionsDisplay libraryQuestions={libraryQuestions} />
        </GridCol>
      </Grid>
    </Container>
  );
}
