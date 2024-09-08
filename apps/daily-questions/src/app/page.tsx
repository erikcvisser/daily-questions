import { BasicAppShell } from '@/components/AppShell/AppShell';
import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { auth } from '@/lib/auth';
import { Container, Title, Text } from '@mantine/core';

export default async function Index() {
  const session = await auth();
  return (
    <Container>
      <Title order={1}>Welcome to Daily Questions</Title>
      <Text>Lorum ipsum </Text>
      {session?.user && <Questionnaire />}
    </Container>
  );
}
