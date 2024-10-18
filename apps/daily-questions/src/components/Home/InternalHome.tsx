import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Card,
} from '@mantine/core';
import {
  IconClipboardList,
  IconInfoSquare,
  IconCheck,
} from '@tabler/icons-react';
import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function InternalHome() {
  const session = await auth();

  const userQuestions = session?.user
    ? await prisma.question.findMany({ where: { userId: session.user.id } })
    : [];
  const submissions = session?.user
    ? await prisma.submission.findMany({ where: { userId: session.user.id } })
    : [];

  // Check if there's a submission for today
  const today = new Date().toISOString().split('T')[0];
  const submittedToday = submissions.some(
    (submission) => submission.createdAt.toISOString().split('T')[0] === today
  );

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={2} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
            Welcome back
            <Text visibleFrom="lg" component="span" display="inline" inherit>
              {' '}
              to Daily Questions
            </Text>
          </Title>

          <Button
            leftSection={<IconClipboardList size={20} />}
            color="blue"
            component="a"
            href="/overview"
            style={{ flexShrink: 0 }}
          >
            <Text visibleFrom="xs">View History</Text>
          </Button>
        </Group>

        <Card shadow="sm" padding="lg" withBorder>
          {userQuestions.length > 0 ? (
            submittedToday ? (
              <Stack align="center" gap="md">
                <IconCheck size={48} color="green" />
                <Text size="lg" fw={500} ta="center">
                  You&apos;ve already submitted today&apos;s reflection
                </Text>
                <Text c="dimmed" ta="center">
                  Great job! Come back tomorrow for your next reflection.
                </Text>
                <Button
                  color="blue"
                  component="a"
                  href="/overview"
                  leftSection={<IconClipboardList size={20} />}
                >
                  View History
                </Button>
              </Stack>
            ) : (
              <>
                <Text size="lg" fw={500} mb="md">
                  Ready for today&apos;s reflection?
                </Text>
                <Questionnaire />
              </>
            )
          ) : (
            <Stack align="center" gap="md">
              <IconInfoSquare size={48} />
              <Text size="lg" fw={500} ta="center">
                No questions configured yet
              </Text>
              <Text c="dimmed" ta="center">
                Set up your daily questions to start your reflection journey.
              </Text>
              <Button color="blue" component="a" href="/questions/new">
                Configure Questions
              </Button>
            </Stack>
          )}
        </Card>
      </Stack>
    </Container>
  );
}
