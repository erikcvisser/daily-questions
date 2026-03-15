import { Stack, Text, Button, Card } from '@mantine/core';
import {
  IconClipboardList,
  IconInfoSquare,
  IconCheck,
} from '@tabler/icons-react';
import AddStarterQuestionsButton from './AddStarterQuestionsButton';
import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function InternalHome() {
  const session = await auth();

  const [userQuestions, submissions] = session?.user
    ? await Promise.all([
        prisma.question.findMany({ where: { userId: session.user.id } }),
        prisma.submission.findMany({ where: { userId: session.user.id } }),
      ])
    : [[], []];

  // Check if there's a submission for today
  const today = new Date().toISOString().split('T')[0];
  const submittedToday = submissions.some(
    (submission) => submission.date.toISOString().split('T')[0] === today
  );

  return (
    <Card shadow="sm" padding="xs" withBorder mb={'xl'} p={{ base: 'sm', sm: 'lg' }} h={{ base: 'calc(100vh - 180px)', sm: 'auto' }} style={{ display: 'flex', flexDirection: 'column' }}>
      {userQuestions.length > 0 ? (
        submittedToday ? (
          <Stack align="center" gap="md">
            <IconCheck size={48} color="green" />
            <Text size="lg" fw={500} ta="center">
              You&apos;ve already submitted today&apos;s reflection
            </Text>
            <Text ta="center">
              Great job! Come back tomorrow for your next reflection.
            </Text>
            <Button
              color="blue"
              component={Link}
              href="/overview"
              leftSection={<IconClipboardList size={20} />}
            >
              View History
            </Button>
          </Stack>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Text size="lg" fw={500} mb="md" visibleFrom="sm">
              Ready for today&apos;s reflection?
            </Text>
            <div style={{ flex: 1 }}>
              <Questionnaire />
            </div>
          </div>
        )
      ) : (
        <Stack align="center" gap="md">
          <IconInfoSquare size={48} />
          <Text size="lg" fw={500} ta="center">
            Welcome to Daily Questions
          </Text>
          <Text c="dimmed" ta="center" maw={400}>
            Answer a few reflection questions daily to track your personal
            growth. Start with our recommended starter questions, or create
            your own.
          </Text>
          <AddStarterQuestionsButton />
          <Button
            variant="subtle"
            color="gray"
            component={Link}
            href="/questions/new"
            size="sm"
          >
            Or create your own questions
          </Button>
        </Stack>
      )}
    </Card>
  );
}
