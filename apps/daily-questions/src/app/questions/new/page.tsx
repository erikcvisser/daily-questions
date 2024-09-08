import { Button, Container, List, Title } from '@mantine/core';
import QuestionForm from '@/components/Questions/QuestionForm';

export default async function Question() {
  return (
    <Container>
      <Title order={1}>Add a question</Title>
      <QuestionForm />
    </Container>
  );
}
