import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Title, Stack, Card } from '@mantine/core';
import { Button, Text } from '@mantine/core';
import { IconInfoSquare } from '@tabler/icons-react';
import Link from 'next/link';
import { FilteredOverview } from '@/components/Overview/FilteredOverview';

export default async function OverviewContent() {
  const session = await auth();
  // @ts-expect-error lalala
  const personalTarget = session?.user?.targetScore;

  const [questions, submissions] = await Promise.all([
    prisma.question.findMany({
      where: {
        userId: session?.user?.id,
      },
    }),
    prisma.submission.findMany({
      include: {
        answers: {
          include: { question: true },
          orderBy: { question: { position: 'asc' } },
        },
      },
      where: { userId: session?.user?.id },
      orderBy: { date: 'desc' },
    }),
  ]);

  return (
    <>
      {submissions.length > 0 ? (
        <FilteredOverview
          submissions={submissions}
          personalTarget={personalTarget}
        />
      ) : (
        <Card shadow="sm" padding="lg" withBorder>
          <Stack align="center" gap="md">
            {questions.length > 0 ? (
              <>
                <Title order={3}>No submissions yet</Title>
                <Text ta="center">
                  You have questions set up, but haven&apos;t made any
                  submissions. Start tracking your progress today!
                </Text>
                <Button component={Link} href="/submission/new" size="lg">
                  Create your first submission
                </Button>
              </>
            ) : (
              <>
                <IconInfoSquare size={48} />
                <Text size="lg" fw={500} ta="center">
                  Get started
                </Text>

                <Text ta="center" c="dimmed">
                  You haven&apos;t set up any questions yet. Create your first
                  question to begin your journey of self-improvement!
                </Text>
                <Button component={Link} href="/questions/new">
                  Create your first question
                </Button>
              </>
            )}
          </Stack>
        </Card>
      )}
    </>
  );
}
