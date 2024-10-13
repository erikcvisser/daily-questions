import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  Container,
  Title,
  Flex,
  Stack,
  Space,
  Box,
  Center,
  Paper,
} from '@mantine/core';
import CalendarComp from '@/components/Overview/Calendar';
import SubmissionsTable from '@/components/Overview/Table';
import { SummarySection } from '@/components/Overview/Summary';
import { Button, Text } from '@mantine/core';

export default async function OverviewPage() {
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
    <Container size="xl">
      <Stack>
        <Title order={2}>
          Overview of {session?.user?.name}&apos;s submissions
        </Title>
        <Space h="md" />
        {submissions.length > 0 ? (
          <Flex
            gap="md"
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'flex-start' }}
          >
            <Box w={{ base: '100%', md: 300 }} miw={300}>
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
          <Center>
            <Paper shadow="md" p="xl" radius="md" withBorder>
              <Stack align="center" gap="md">
                {questions.length > 0 ? (
                  <>
                    <Title order={3}>No submissions yet</Title>
                    <Text ta="center">
                      You have questions set up, but haven&apos;t made any
                      submissions. Start tracking your progress today!
                    </Text>
                    <Button component="a" href="/submission/new" size="lg">
                      Create your first submission
                    </Button>
                  </>
                ) : (
                  <>
                    <Title order={3}>Get started</Title>
                    <Text ta="center">
                      You haven&apos;t set up any questions yet. Create your
                      first question to begin your journey of self-improvement!
                    </Text>
                    <Button component="a" href="/questions/new" size="lg">
                      Create your first question
                    </Button>
                  </>
                )}
              </Stack>
            </Paper>
          </Center>
        )}
        <Space h="md" />
        {submissions.length > 0 && (
          <SubmissionsTable submissions={submissions} />
        )}
      </Stack>
    </Container>
  );
}
