import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { Container, Title } from '@mantine/core';

export default async function Index({ params }: { params: { id: string } }) {
  return (
    <Container>
      <Questionnaire id={params.id} />
    </Container>
  );
}
