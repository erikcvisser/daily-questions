import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, Stack, Text, Title, Button } from '@mantine/core';
import { IconInfoSquare } from '@tabler/icons-react';
import Link from 'next/link';
import { ClientOverview } from '@/components/Overview/ClientOverview';
import { redirect } from 'next/navigation';

interface OverviewContentProps {
  searchParams: { view?: string };
}

export default async function OverviewContent({
  searchParams,
}: OverviewContentProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // @ts-expect-error session user type
  const personalTarget = session?.user?.targetScore || 0.6;
  const viewUserId = searchParams.view;

  // Get user whose data we're viewing (either current user or shared user)
  const targetUserId = viewUserId || session?.user?.id;

  const [questions, submissions, sharedOverviews] = await Promise.all([
    prisma.question.findMany({
      where: { userId: targetUserId },
    }),
    prisma.submission.findMany({
      include: {
        answers: {
          include: { question: true },
          orderBy: { question: { position: 'asc' } },
        },
      },
      where: { userId: targetUserId },
      orderBy: { date: 'desc' },
    }),
    prisma.sharedOverview.findMany({
      where: {
        recipientId: session?.user?.id,
        status: 'ACTIVE',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  // Verify access if viewing someone else's overview
  if (
    viewUserId &&
    !sharedOverviews.some((share) => share.owner.id === viewUserId)
  ) {
    redirect('/overview');
  }

  if (submissions.length === 0) {
    return (
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
    );
  }

  return (
    <ClientOverview
      submissions={submissions}
      personalTarget={personalTarget}
      sharedOverviews={sharedOverviews}
      currentViewUserId={targetUserId}
    />
  );
}
