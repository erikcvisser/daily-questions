import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { Container, Title, Stack } from '@mantine/core';

export default async function Index() {
  return (
    <Container size="xl" mt="lg">
      <Stack h="100%">
        <Title visibleFrom="md" order={2}>
          Answer your daily questions
        </Title>
        <Title hiddenFrom="md" order={3}>
          Answer your daily questions
        </Title>
        <div style={{ flex: 1 }}>
          <Questionnaire />
        </div>
      </Stack>
    </Container>
  );
}
