'use client';

import { useState } from 'react';
import {
  MultiSelect,
  Flex,
  Box,
  Space,
  ComboboxData,
  Button,
  Select,
  Group,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import CalendarComp from './Calendar';
import { SummarySection } from './Summary';
import SubmissionsTable from './Table';
import {
  Submission,
  Answer,
  Question,
  SharedOverviewStatus,
} from '@prisma/client';
import { IconShare, IconChartBar } from '@tabler/icons-react';
import { ShareModal } from './ShareModal';
import { AnalysisModal } from './AnalysisModal';

// Define the extended types to include relationships
type SubmissionWithAnswers = Submission & {
  answers: (Answer & {
    question: Question;
  })[];
};

// Define the SharedOverview type
type SharedOverviewWithOwner = {
  id: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  status: SharedOverviewStatus;
};

interface FilteredOverviewProps {
  submissions: SubmissionWithAnswers[];
  personalTarget: number;
  sharedOverviews?: SharedOverviewWithOwner[];
  currentViewUserId?: string | null;
}

export function FilteredOverview({
  submissions,
  personalTarget,
  sharedOverviews,
  currentViewUserId,
}: FilteredOverviewProps) {
  const router = useRouter();
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const isFiltered = selectedQuestions.length > 0;
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [analysisModalOpened, setAnalysisModalOpened] = useState(false);

  const uniqueQuestions = Object.values(
    submissions
      .flatMap((sub) =>
        sub.answers.reduce(
          (acc, answer) => ({
            ...acc,
            [answer.question.id]: {
              value: String(answer.question.id),
              label: answer.question.title,
            },
          }),
          {}
        )
      )
      .reduce((acc, curr) => ({ ...acc, ...curr }), {})
  );

  const filteredSubmissions = !isFiltered
    ? submissions
    : submissions
        .map((sub) => ({
          ...sub,
          answers: sub.answers.filter((answer) =>
            selectedQuestions.includes(String(answer.question.id))
          ),
        }))
        .filter((sub) => sub.answers.length > 0);

  return (
    <>
      <Flex justify="space-between" align="center" mb="md">
        {sharedOverviews && sharedOverviews.length > 0 ? (
          <Select
            label="Viewing"
            w={300}
            data={[
              { value: '', label: 'My Overview' },
              ...sharedOverviews.map((share) => ({
                value: share.owner.id,
                label: `${share.owner.name || 'Unknown'}'s Overview`,
              })),
            ]}
            value={currentViewUserId || ''}
            onChange={(value) => {
              if (value) {
                router.push(`/overview?view=${value}`);
              } else {
                router.push('/overview');
              }
            }}
          />
        ) : (
          <div />
        )}
        <Group>
          <Button
            variant="light"
            leftSection={<IconChartBar size={16} />}
            onClick={() => setAnalysisModalOpened(true)}
          >
            Analyze
          </Button>
          <Button
            leftSection={<IconShare size={16} />}
            onClick={() => setShareModalOpened(true)}
          >
            Share Overview
          </Button>
        </Group>
      </Flex>

      <Box mb="md">
        <MultiSelect
          label="Filter by questions"
          placeholder="Select questions"
          data={uniqueQuestions as ComboboxData}
          value={selectedQuestions}
          onChange={setSelectedQuestions}
          searchable
          clearable
        />
      </Box>

      <Flex
        gap="md"
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'flex-start' }}
      >
        <Box w={{ base: '100%', md: 300 }} miw={'300px'}>
          <CalendarComp
            submissions={filteredSubmissions}
            personalTarget={personalTarget}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <SummarySection
            submissions={filteredSubmissions}
            personalTarget={personalTarget}
          />
        </Box>
      </Flex>

      <Space h="md" />
      <SubmissionsTable
        submissions={filteredSubmissions}
        isFiltered={isFiltered}
      />

      <ShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
      />

      <AnalysisModal
        opened={analysisModalOpened}
        onClose={() => setAnalysisModalOpened(false)}
        userId={currentViewUserId || ''}
      />
    </>
  );
}
