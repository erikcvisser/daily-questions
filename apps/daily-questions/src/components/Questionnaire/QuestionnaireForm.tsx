'use client';

import { submitQuestionnaireSchema } from '@/lib/definitions';
import {
  Button,
  Group,
  NumberInput,
  Radio,
  RadioGroup,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useFocusTrap } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Question, Answer, Submission } from '@prisma/client';
import { IconSend } from '@tabler/icons-react';
import { useState } from 'react';

export default function QuestionnaireForm({
  questions,
}: {
  questions: Question[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const focusTrapRef = useFocusTrap();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      date: new Date(),
      ...questions.reduce((acc: { [key: string]: string }, question) => {
        if (question.type === 'INTEGER') {
          acc[question.id] = '5';
        } else if (question.type === 'BOOLEAN') {
          acc[question.id] = 'true';
        } else if (question.type === 'FREETEXT') {
          acc[question.id] = '';
        }
        return acc;
      }, {}),
    },
    validateInputOnChange: true,
    validate: zodResolver(submitQuestionnaireSchema),
  });

  const handleSubmit = (values: typeof form.values) => {
    setSubmitting(true);
    console.log(values);
  };

  const handleError = (errors: typeof form.errors) => {
    console.log(form.getValues());
    console.log(errors);
    if (errors) {
      notifications.show({
        message: 'Something went wrong saving this question',
        color: 'red',
      });
    }
  };

  return (
    <>
      <form
        onSubmit={form.onSubmit(handleSubmit, handleError)}
        ref={focusTrapRef}
      >
        <DateInput label="Date" {...form.getInputProps('date')} />
        {questions.map((question, k) =>
          question.type === 'INTEGER' ? (
            <NumberInput
              label={question.title}
              {...form.getInputProps(question.id)}
              description="Rate from 0 to 10"
              data-autofocus={k === 0}
              min={0}
              max={10}
              key={form.key(question.id)}
            />
          ) : question.type === 'BOOLEAN' ? (
            <RadioGroup
              key={form.key(question.id)}
              {...form.getInputProps(question.id)}
              label={question.title}
              data-autofocus={k === 0}
              withAsterisk
            >
              <Group mt="xs">
                <Radio value="true" label="Yes" />
                <Radio value="false" label="No" />
              </Group>
            </RadioGroup>
          ) : question.type === 'FREETEXT' ? (
            <Textarea
              key={form.key(question.id)}
              {...form.getInputProps(question.id)}
              label={question.title}
              data-autofocus={k === 0}
              withAsterisk
            />
          ) : null
        )}
        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            data-disabled={submitting}
            leftSection={<IconSend />}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </Group>
      </form>
    </>
  );
}
