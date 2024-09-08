'use client';

import { Group, TextInput } from '@mantine/core';
import { Form } from '@mantine/form';
import { Question } from '@prisma/client';

export default function QuestionnaireForm({
  questions,
}: {
  questions: Question[];
}) {
  return (
    <>
      <Group></Group>
    </>
  );
}
