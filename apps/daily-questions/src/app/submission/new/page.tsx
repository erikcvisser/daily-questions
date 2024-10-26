import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { Container, Space, Title } from '@mantine/core';

export default async function Index() {
  return (
    <Container size="xl" mt="lg">
      <Title order={2}>Answer your daily questions</Title>
      <Space h="md" />
      <Questionnaire />
    </Container>
  );
}
