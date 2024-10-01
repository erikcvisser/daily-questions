'use client';

import {
  Table,
  Text,
  ActionIcon,
  Group,
  Pagination,
  ScrollArea,
} from '@mantine/core';
import { Submission, Answer, Question } from '@prisma/client';
import { IconX, IconEdit } from '@tabler/icons-react';
import { deleteSubmission } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SubmissionsTable({
  submissions,
}: {
  submissions: (Submission & {
    answers: (Answer & {
      question: Question;
    })[];
  })[];
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
      <Table.Td>{submission.scorePercentage?.toFixed()}%</Table.Td>
      <Table.Td style={{ maxWidth: '400px' }}>
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
        <Group>
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

  return (
    <>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Answers</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Group justify="center" mt="md">
        <Pagination
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
