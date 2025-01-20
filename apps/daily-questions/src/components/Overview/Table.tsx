'use client';

import {
  Table,
  Text,
  ActionIcon,
  Group,
  Pagination,
  ScrollArea,
  Button,
} from '@mantine/core';
import { Submission, Answer, Question } from '@prisma/client';
import { IconX, IconEdit, IconDownload } from '@tabler/icons-react';
import { deleteSubmission } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function SubmissionsTable({
  submissions,
  isFiltered = false,
}: {
  submissions: (Submission & {
    answers: (Answer & {
      question: Question;
    })[];
  })[];
  isFiltered?: boolean;
}) {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const paginatedSubmissions = submissions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const rows = paginatedSubmissions.map((submission) => (
    <Table.Tr key={submission.id}>
      <Table.Td>{formatDate(submission.date)}</Table.Td>
      {!isFiltered && (
        <Table.Td>{submission.scorePercentage?.toFixed()}%</Table.Td>
      )}
      <Table.Td style={{ maxWidth: '400px' }} visibleFrom="md">
        <ScrollArea h={60} scrollHideDelay={200}>
          <div style={{ display: 'flex', gap: '16px', padding: '8px 0' }}>
            {submission.answers.map((answer) => (
              <div key={answer.id} style={{ flexShrink: 0, maxWidth: '350px' }}>
                <Text size="xs" c="dimmed">
                  {answer.question.title}
                </Text>
                <Text size="sm" fw={500}>
                  {answer.answer}
                </Text>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Table.Td>
      <Table.Td>
        <Group align="flex-end" justify="flex-end" w="100%">
          <ActionIcon
            color="blue"
            onClick={() => router.push(`/submission/${submission.id}`)}
            aria-label="edit submission"
          >
            <IconEdit size="1rem" />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={() => deleteSubmission(submission.id)}
            aria-label="delete submission"
          >
            <IconX size="1rem" />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const exportToExcel = () => {
    const exportData = submissions.map((submission) => ({
      Date: formatDate(submission.date),
      Score: isFiltered ? 'N/A' : `${submission.scorePercentage?.toFixed()}%`,
      ...submission.answers.reduce(
        (acc, answer) => ({
          ...acc,
          [answer.question.title]: answer.answer,
        }),
        {}
      ),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    XLSX.writeFile(wb, 'submissions.xlsx');
  };

  return (
    <>
      <Group justify="right">
        <Button
          variant="light"
          color="blue"
          onClick={exportToExcel}
          title="Export to Excel"
          leftSection={<IconDownload size="1rem" />}
        >
          Export data to Excel
        </Button>
      </Group>
      <Table mb="lg">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w="100px">Date</Table.Th>
            {!isFiltered && <Table.Th w="60px">Score</Table.Th>}
            <Table.Th visibleFrom="md">Answers</Table.Th>
            <Table.Th w="100px" ta="right">
              Actions
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Group justify="center" mb="xl">
        <Pagination
          mb="xl"
          value={activePage}
          onChange={setActivePage}
          total={totalPages}
        />
      </Group>
    </>
  );
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
