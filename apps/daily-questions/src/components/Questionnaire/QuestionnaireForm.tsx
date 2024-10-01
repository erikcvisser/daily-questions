'use client';

import { submitQuestionnaireSchema } from '@/lib/definitions';
import {
  Button,
  Group,
  NumberInput,
  Radio,
  RadioGroup,
  Textarea,
  Stack,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useFocusTrap } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Question, Answer, Submission } from '@prisma/client';
import { IconSend } from '@tabler/icons-react';
import { useState } from 'react';
import { submitQuestionnaire, updateQuestionnaire } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';

export default function QuestionnaireForm({
  questions,
  submission,
}: {
  questions: Question[];
  submission:
    | (Submission & {
        answers: Answer[];
      })
    | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const focusTrapRef = useFocusTrap();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get('date');
  const now = dateParam ? new Date(dateParam) : new Date();

  let initialAnswers = {
    date: new Date(now.setHours(0, 0, 0, 0)),
    answers: {
      ...questions.reduce((acc: { [key: string]: string }, question) => {
        acc[question.id] = '';
        return acc;
      }, {}),
    },
  };

  if (submission && submission.answers) {
    initialAnswers = {
      date: new Date(submission.date),
      answers: {
        ...submission.answers.reduce(
          (acc: { [key: string]: string }, answer) => {
            acc[answer.questionId] = answer.answer;
            return acc;
          },
          {}
        ),
      },
    };
    console.log(initialAnswers);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: initialAnswers,
    validateInputOnChange: true,
    validate: zodResolver(submitQuestionnaireSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);

    if (submission) {
      await updateQuestionnaire(submission.id, values);
    } else {
      await submitQuestionnaire(values);
    }
    setSubmitting(false);
  };

  const handleError = (errors: typeof form.errors) => {
    console.log(errors);
    if (errors) {
      notifications.show({
        message: 'Something went wrong saving this question',
        color: 'red',
      });
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, handleError)}
      ref={focusTrapRef}
    >
      <Stack>
        <DateInput label="Date" {...form.getInputProps('date')} radius="md" />
        {questions.map((item, index) =>
          item.type === 'INTEGER' ? (
            <NumberInput
              label={item.title}
              description="Rate from 0 to 10"
              data-autofocus={index === 0}
              min={0}
              max={10}
              key={form.key(`answers.${item.id}`)}
              withAsterisk
              {...form.getInputProps(`answers.${item.id}`)}
              radius="md"
            />
          ) : item.type === 'BOOLEAN' ? (
            <RadioGroup
              key={form.key(`answers.${item.id}`)}
              {...form.getInputProps(`answers.${item.id}`)}
              label={item.title}
              data-autofocus={index === 0}
              withAsterisk
            >
              <Group mt="xs">
                <Radio value="true" label="Yes" />
                <Radio value="false" label="No" />
              </Group>
            </RadioGroup>
          ) : item.type === 'FREETEXT' ? (
            <Textarea
              key={form.key(`answers.${item.id}`)}
              {...form.getInputProps(`answers.${item.id}`)}
              label={item.title}
              data-autofocus={index === 0}
              withAsterisk
              radius="md"
              autosize
              minRows={3}
            />
          ) : null
        )}
        <Group justify="flex-end" mt="xl">
          <Button
            type="submit"
            disabled={submitting}
            leftSection={<IconSend />}
            radius="md"
            size="md"
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
