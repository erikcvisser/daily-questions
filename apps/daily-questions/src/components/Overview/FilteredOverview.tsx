'use client';

import { Suspense, useState } from 'react';
import {
  MultiSelect,
  Flex,
  Box,
  Space,
  Center,
  Loader,
  ComboboxData,
  Skeleton,
} from '@mantine/core';
import CalendarComp from './Calendar';
import { SummarySection } from './Summary';
import SubmissionsTable from './Table';
import { Submission, Answer, Question } from '@prisma/client';

// Define the extended types to include relationships
type SubmissionWithAnswers = Submission & {
  answers: (Answer & {
    question: Question;
  })[];
};

function LoadingCalendar() {
  return (
    <Box w={{ base: '100%', md: 300 }} miw={300}>
      <Skeleton h={300} />
    </Box>
  );
}

function LoadingSummary() {
  return (
    <Box>
      <Skeleton height={220} mb="sm" />
    </Box>
  );
}

function LoadingTable() {
  return (
    <>
      <Skeleton height={40} mb="sm" /> {/* Table header */}
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} height={60} mb="sm" />
      ))}
      <Skeleton height={40} width={200} mx="auto" /> {/* Pagination */}
    </>
  );
}

export function FilteredOverview({
  submissions,
  personalTarget,
}: {
  submissions: SubmissionWithAnswers[];
  personalTarget: number;
}) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const isFiltered = selectedQuestions.length > 0;

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
        <Box
          w={{ base: '100%', md: 300 }}
          miw={300}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <Suspense fallback={<LoadingCalendar />}>
            <CalendarComp
              submissions={filteredSubmissions}
              personalTarget={personalTarget}
            />
          </Suspense>
        </Box>
        <Box style={{ flex: 1 }}>
          <Suspense fallback={<LoadingSummary />}>
            <SummarySection
              submissions={filteredSubmissions}
              personalTarget={personalTarget}
            />
          </Suspense>
        </Box>
      </Flex>

      <Space h="md" />
      <Suspense fallback={<LoadingTable />}>
        <SubmissionsTable
          submissions={filteredSubmissions}
          isFiltered={isFiltered}
        />
      </Suspense>
    </>
  );
}
