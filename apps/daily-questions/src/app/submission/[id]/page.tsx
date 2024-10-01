import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { Container, Title, Space } from '@mantine/core';

export default async function Index({ params }: { params: { id: string } }) {
  return (
    <Container size="xl">
      <Title order={2}>Edit your submission</Title>
      <Space h="md" />
      <Questionnaire id={params.id} />
    </Container>
  );
}
