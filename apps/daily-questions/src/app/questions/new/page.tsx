import {
  Container,
  Title,
  Text,
  Grid,
  GridCol,
  Stack,
  Divider,
} from '@mantine/core';
import QuestionForm from '@/components/Questions/QuestionForm';
import prisma from '@/lib/prisma';
import LibraryQuestionsDisplay from '@/components/Questions/LibraryQuestionsDisplay';

export default async function AddQuestionPage() {
  const libraryQuestions = await prisma.libraryQuestion.findMany({
    include: {
      category: true,
    },
    orderBy: {
      categoryId: 'asc',
    },
  });

  return (
    <Container size="xl" mt="lg">
      <Stack>
        <Title order={2}>Add a Question</Title>
        <QuestionForm />

        <Divider
          my="xs"
          label={<Text size="sm">OR</Text>}
          labelPosition="center"
        />
        <Title order={3}>Browse sample questions from our library</Title>
        <Grid>
          <GridCol>
            <LibraryQuestionsDisplay libraryQuestions={libraryQuestions} />
          </GridCol>
        </Grid>
      </Stack>
    </Container>
  );
}
