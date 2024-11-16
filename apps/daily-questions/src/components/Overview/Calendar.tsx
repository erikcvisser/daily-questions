'use client';

import { Indicator, Modal, Button, Group } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { Submission, Answer, Question } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CalendarComp({
  submissions,
  personalTarget,
}: {
  submissions: (Submission & {
    answers: (Answer & {
      question: Question;
    })[];
  })[];
  personalTarget: number;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] =
    useState<Submission | null>(null);

  const subs = submissions.map((submission) => {
    const color =
      submission.scorePercentage &&
      submission.scorePercentage >= personalTarget * 100
        ? 'green'
        : 'red';
    return {
      ...submission,
      color,
    };
  });

  const handleSelect = (date: Date) => {
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12
    );
    const dateClicked = localDate.toLocaleDateString('en-CA');

    const existingSubmission = submissions.find((sub) => {
      const subDate = new Date(sub.date);
      const localSubDate = new Date(
        subDate.getFullYear(),
        subDate.getMonth(),
        subDate.getDate(),
        12
      );
      return localSubDate.toLocaleDateString('en-CA') === dateClicked;
    });

    if (existingSubmission) {
      setSelectedDate(dateClicked);
      setModalOpen(true);
      setExistingSubmission(existingSubmission);
    } else {
      router.push(`/submission/new?date=${dateClicked}`);
    }
  };
  const handleEditConfirm = () => {
    if (selectedDate && existingSubmission) {
      router.push(`/submission/${existingSubmission.id}`);
    }
    setModalOpen(false);
  };

  return (
    <>
      <Calendar
        highlightToday={true}
        maxDate={new Date()}
        getDayProps={(date) => ({
          onClick: () => handleSelect(date),
        })}
        renderDay={(date) => {
          const day = date.getDate();
          const dateWithSubmission = subs.find((submission) => {
            const subDate = new Date(submission.date);
            const localSubDate = new Date(
              subDate.getFullYear(),
              subDate.getMonth(),
              subDate.getDate(),
              12
            );

            const localCalDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              12
            );

            return localSubDate.getTime() === localCalDate.getTime();
          });

          return (
            <Indicator
              size={15}
              color={dateWithSubmission ? dateWithSubmission.color : 'blue'}
              offset={-2}
              zIndex={18}
              disabled={!dateWithSubmission}
            >
              <div>{day}</div>
            </Indicator>
          );
        }}
      />
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submission Already Exists"
      >
        <p>
          A submission already exists for this date. Do you want to edit it?
        </p>
        <Group mt="md" justify="space-between">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditConfirm}>Edit Submission</Button>
        </Group>
      </Modal>
    </>
  );
}
