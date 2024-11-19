import { Stack, Text, Button, Card } from '@mantine/core';
import {
  IconClipboardList,
  IconInfoSquare,
  IconCheck,
} from '@tabler/icons-react';
import Questionnaire from '@/components/Questionnaire/Questionnaire';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function InternalHome() {
  const session = await auth();

  const [userQuestions, submissions, pushSubscriptions] = session?.user
    ? await Promise.all([
        prisma.question.findMany({ where: { userId: session.user.id } }),
        prisma.submission.findMany({ where: { userId: session.user.id } }),
        prisma.pushSubscription.findMany({
          where: { userId: session.user.id },
        }),
      ])
    : [[], [], []];

  // Check if there's a submission for today
  const today = new Date().toISOString().split('T')[0];
  const submittedToday = submissions.some(
    (submission) => submission.date.toISOString().split('T')[0] === today
  );

  return (
    <Card shadow="sm" padding="lg" withBorder mb={'xl'}>
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

            {pushSubscriptions.length === 0 && (
              <Text ta="center">
                Want to receive daily reminders so that you don&apos;t forget to
                reflect?
                <br />
                <Link href="/profile">
                  Click here for instructions on how to install the app and
                  enable push notifications
                </Link>
              </Text>
            )}
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
          <Button color="blue" component={Link} href="/questions/new">
            Configure Questions
          </Button>
        </Stack>
      )}
    </Card>
  );
}
