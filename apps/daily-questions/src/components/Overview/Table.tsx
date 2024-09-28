'use client';

import { Table, Text, ActionIcon, Group } from '@mantine/core';
import { Submission, Answer, Question } from '@prisma/client';
import { IconX, IconEdit } from '@tabler/icons-react';
import { deleteSubmission } from '@/lib/actions';
import { useRouter } from 'next/navigation';

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

  const rows = submissions.map((submission) => (
    <Table.Tr key={submission.id}>
      <Table.Td>{formatDate(submission.date)}</Table.Td>
      {submission.answers.map((answer) => (
        <Table.Td key={answer.id}>
          <Text>{answer.question.title}</Text>
          <Text size="xs" c="dimmed">
            {answer.answer}
          </Text>
        </Table.Td>
      ))}
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
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th colSpan={submissions[0]?.answers.length || 0}>
            Answers
          </Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
