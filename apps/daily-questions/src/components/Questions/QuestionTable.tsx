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
import {
  IconArchive,
  IconEdit,
  IconX,
  IconGripVertical,
} from '@tabler/icons-react';
import { Table, Checkbox, Group, Text, Switch } from '@mantine/core';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTableRow({
  question,
  selectedRows,
  setSelectedRows,
  deleteQuestionAction,
  archiveQuestionAction,
  router,
}: {
  question: Question;
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
  deleteQuestionAction: (question: Question) => void;
  archiveQuestionAction: (question: Question) => void;
  router: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableTr
      ref={setNodeRef}
      style={style}
      key={question.id}
      bg={
        selectedRows.includes(question.id)
          ? 'var(--mantine-color-blue-light)'
          : undefined
      }
    >
      <TableTd
        {...attributes}
        {...listeners}
        m={0}
        p={0}
        style={{ width: '40px' }}
      >
        <IconGripVertical
          style={{
            cursor: 'grab',
            height: '1.2em',
            display: 'flex',
            alignItems: 'center',
          }}
        />
      </TableTd>
      <TableTd style={{ width: '40px' }} hidden>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(question.id)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, question.id]
                : selectedRows.filter((id) => id !== question.id)
            )
          }
        />
      </TableTd>
      <TableTd>{question.title}</TableTd>
      <TableTd visibleFrom="md">
        {question.type === 'BOOLEAN' && 'Yes/No'}
        {question.type === 'INTEGER' && 'Numeric (1-10)'}
        {question.type === 'FREETEXT' && 'Free text'}
        {question.type === 'RATING' && 'Rating (0-5)'}
      </TableTd>
      <TableTd visibleFrom="md">
        {question.type === 'INTEGER' && question.targetInt}
        {question.type === 'BOOLEAN' && (question.targetBool ? 'Yes' : 'No')}
        {question.type === 'RATING' &&
          question.targetRating &&
          {
            0: '0. Not done',
            1: '1. Marginal effort',
            2: '2. Some effort',
            3: '3. Ok',
            4: '4. Very good',
            5: '5. Exceptional',
          }[question.targetRating]}
        {question.type === 'FREETEXT' && '-'}
      </TableTd>
      <TableTd>
        <Group gap="xs" justify="flex-end" w="100%">
          <ActionIcon
            onClick={() => router.push(`/questions/${question.id}`)}
            aria-label="edit question"
            color="blue"
            variant="light"
            disabled={question.status === 'INACTIVE'}
          >
            <IconEdit size="1rem" />
          </ActionIcon>
          {question.status === 'INACTIVE' && (
            <ActionIcon
              onClick={() => deleteQuestionAction(question)}
              aria-label="delete question"
              color="red"
              variant="light"
            >
              <IconX size="1rem" />
            </ActionIcon>
          )}
          {question.status === 'ACTIVE' && (
            <ActionIcon
              onClick={() => archiveQuestionAction(question)}
              aria-label="archive question"
              color="gray"
              variant="light"
            >
              <IconArchive size="1rem" />
            </ActionIcon>
          )}
        </Group>
      </TableTd>
    </TableTr>
  );
}

export default function QuestionTable({
  questions,
  deleteQuestionAction,
  archiveQuestionAction,
  updateQuestionPositions,
}: {
  questions: Question[];
  deleteQuestionAction: (question: Question) => void;
  archiveQuestionAction: (question: Question) => void;
  updateQuestionPositions: (updatedQuestions: Question[]) => void;
}) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);

      const updatedQuestions = [...questions];
      const [reorderedItem] = updatedQuestions.splice(oldIndex, 1);
      updatedQuestions.splice(newIndex, 0, reorderedItem);

      // Update positions
      const questionsWithNewPositions = updatedQuestions.map((q, index) => ({
        ...q,
        position: index + 1,
      }));

      updateQuestionPositions(questionsWithNewPositions);
    }
  };

  const filteredQuestions = questions.filter(
    (question) =>
      (!showInactive && question.status === 'ACTIVE') ||
      (showInactive && question.status === 'INACTIVE')
  );

  return (
    <>
      <Group mb="md" justify="space-between">
        {selectedRows.length > 0 && (
          <>
            <Text fw={500}>{selectedRows.length} selected</Text>
            <ActionIcon
              aria-label="Delete selected rows"
              onClick={() => {
                const selectedQuestions = questions.filter((question) =>
                  selectedRows.includes(question.id)
                );
                selectedQuestions.forEach(deleteQuestionAction);
                setSelectedRows([]);
              }}
              color="red"
              variant="filled"
              size="lg"
            >
              <IconX size="1.2rem" />
            </ActionIcon>
          </>
        )}
        <Switch
          label={
            showInactive
              ? 'Showing Inactive Questions'
              : 'Showing Active Questions'
          }
          checked={showInactive}
          onChange={(event) => setShowInactive(event.currentTarget.checked)}
        />
      </Group>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table highlightOnHover>
          <TableThead>
            <TableTr>
              <TableTh style={{ width: '40px' }} />
              <TableTh hidden style={{ width: '40px' }} />
              <TableTh>Question</TableTh>
              <TableTh visibleFrom="md">Type</TableTh>
              <TableTh visibleFrom="md">Target</TableTh>
              <TableTh w="100px" ta="right">
                Actions
              </TableTh>
            </TableTr>
          </TableThead>
          <SortableContext
            items={filteredQuestions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <TableTbody>
              {filteredQuestions.map((question) => (
                <SortableTableRow
                  key={question.id}
                  question={question}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  deleteQuestionAction={deleteQuestionAction}
                  archiveQuestionAction={archiveQuestionAction}
                  router={router}
                />
              ))}
            </TableTbody>
          </SortableContext>
        </Table>
      </DndContext>
    </>
  );
}
