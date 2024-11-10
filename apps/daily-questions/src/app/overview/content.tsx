import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Title, Flex, Stack, Space, Box, Card } from '@mantine/core';
import CalendarComp from '@/components/Overview/Calendar';
import SubmissionsTable from '@/components/Overview/Table';
import { SummarySection } from '@/components/Overview/Summary';
import { Button, Text } from '@mantine/core';
import { IconInfoSquare } from '@tabler/icons-react';
import Link from 'next/link';

export default async function OverviewContent() {
  const session = await auth();
  // @ts-expect-error lalala
  const personalTarget = session?.user?.targetScore;
  const questions = await prisma.question.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  const submissions = await prisma.submission.findMany({
    include: {
      answers: {
        include: { question: true },
        orderBy: { question: { position: 'asc' } },
      },
    },
    where: { userId: session?.user?.id },
    orderBy: { date: 'desc' },
  });

  return (
    <>
      {submissions.length > 0 ? (
        <Flex
          gap="md"
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'flex-start' }}
        >
          <Box
            w={{ base: '100%', md: 300 }}
            miw={300}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <CalendarComp
              submissions={submissions}
              personalTarget={personalTarget}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <SummarySection
              submissions={submissions}
              personalTarget={personalTarget}
            />
          </Box>
        </Flex>
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
      <Space h="md" />
      {submissions.length > 0 && <SubmissionsTable submissions={submissions} />}
    </>
  );
}
