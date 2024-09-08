'use client';
import { useState } from 'react';
import { Button, Group, NumberInput, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createQuestionSchema } from '@/lib/definitions';
import { IconPlus } from '@tabler/icons-react';
import { Question } from '@prisma/client';
import { createQuestion, updateQuestion } from '@/lib/actions';
import { useFocusTrap } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

export default function QuestionForm({ question }: { question?: Question }) {
  const [submitting, setSubmitting] = useState(false);
  const focusTrapRef = useFocusTrap();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: question?.title || '',
      type: question?.type || 'INTEGER',
      targetInt: question?.targetInt || '',
      targetBool: question?.targetBool?.toString() || '',
    },
    validateInputOnChange: true,
    validate: zodResolver(createQuestionSchema),
  });

  const handleError = (errors: typeof form.errors) => {
    console.log(errors);
    if (errors) {
      notifications.show({
        message: 'Something went wrong saving this question',
        color: 'red',
      });
    }
  };

  const handleSubmit = (values: typeof form.values) => {
    setSubmitting(true);
    if (question) {
      updateQuestion(question.id, values);
    } else {
      createQuestion(values);
    }
  };
  return (
    <>
      <form
        onSubmit={form.onSubmit(handleSubmit, handleError)}
        className="flex gap-3 items-center"
        ref={focusTrapRef}
      >
        <TextInput
          type="text"
          label="Question"
          placeholder="Did I do my best to..."
          key={form.key('title')}
          {...form.getInputProps('title')}
          data-autofocus
          withAsterisk
        />
        <Select
          label="Type of question"
          placeholder="Pick value"
          key={form.key('type')}
          {...form.getInputProps('type')}
          comboboxProps={{ shadow: 'md' }}
          data={[
            { value: 'BOOLEAN', label: 'Yes/no' },
            { value: 'INTEGER', label: 'Numeric score (1-10)' },
            { value: 'FREETEXT', label: 'Free text' },
          ]}
          withAsterisk
        />

        {form.getValues()['type'] == 'INTEGER' && (
          <NumberInput
            label="Target value (0-10)"
            key={form.key('targetInt')}
            {...form.getInputProps('targetInt')}
            min={0}
            max={10}
            placeholder="Target value"
            withAsterisk
          />
        )}
        {form.getValues()['type'] == 'BOOLEAN' && (
          <Select
            label="Desired value"
            placeholder="Pick value"
            key={form.key('targetBool')}
            {...form.getInputProps('targetBool')}
            comboboxProps={{ shadow: 'md' }}
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            withAsterisk
          />
        )}
        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            data-disabled={submitting}
            leftSection={<IconPlus />}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </Group>
      </form>
    </>
  );
}
