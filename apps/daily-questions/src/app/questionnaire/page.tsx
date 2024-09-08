import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { Container, Title, Text } from '@mantine/core';

export default async function Index() {
  return (
    <Container>
      <Title order={1}>Answer today's questions</Title>
      <Questionnaire />
    </Container>
  );
}
