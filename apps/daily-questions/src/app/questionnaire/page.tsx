import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { Container, Title } from '@mantine/core';

export default async function Index() {
  return (
    <Container>
      <Title order={1}>Answer today&apos;s questions</Title>
      <Questionnaire />
    </Container>
  );
}
