'use client';

import {
  ActionIcon,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Question } from '@prisma/client';
import { IconArchive, IconEdit, IconX } from '@tabler/icons-react';
import { Table, Checkbox } from '@mantine/core';
import { useState } from 'react';

export default function QuestionTable({
  questions,
  deleteQuestionAction,
  archiveQuestionAction,
}: {
  questions: Question[];
  deleteQuestionAction: (question: Question) => void;
  archiveQuestionAction: (question: Question) => void;
}) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const router = useRouter();

  const rows = questions.map((question) => (
    <TableTr
      key={question.id}
      bg={
        selectedRows.includes(question.position)
          ? 'var(--mantine-color-blue-light)'
          : undefined
      }
    >
      <TableTd>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(question.position)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, question.position]
                : selectedRows.filter(
                    (position) => position !== question.position
                  )
            )
          }
        />
      </TableTd>
      <TableTd>{question.position}</TableTd>
      <TableTd>{question.title}</TableTd>
      <TableTd>{question.type}</TableTd>
      <TableTd>
        {question.targetInt || (question.targetBool ? 'Yes' : 'No')}
      </TableTd>
      <TableTd>{question.status}</TableTd>
      <TableTd>
        {' '}
        <ActionIcon
          onClick={() => deleteQuestionAction(question)}
          aria-label="delete question"
        >
          <IconX />
        </ActionIcon>
        <ActionIcon
          onClick={() => archiveQuestionAction(question)}
          aria-label="archive question"
        >
          <IconArchive />
        </ActionIcon>
        <ActionIcon
          onClick={() => router.push(`/questions/${question.id}`)}
          aria-label="edit question"
        >
          <IconEdit />
        </ActionIcon>
      </TableTd>
    </TableTr>
  ));

  return (
    <>
      {selectedRows.length > 0 && (
        <div>
          {selectedRows.length} selected
          <ActionIcon
            aria-label="Delete selected rows"
            onClick={() => {
              const selectedQuestions = questions.filter((question) =>
                selectedRows.includes(question.position)
              );
              selectedQuestions.forEach(deleteQuestionAction);
              setSelectedRows([]);
            }}
          >
            <IconX />
          </ActionIcon>
        </div>
      )}
      <Table highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh />
            <TableTh>Order</TableTh>
            <TableTh>Question</TableTh>
            <TableTh>Type</TableTh>
            <TableTh>Target</TableTh>
            <TableTh>Status</TableTh>
            <TableTh>Actions</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </>
  );
}
