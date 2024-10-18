'use client';
import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  NumberInput,
  Select,
  TextInput,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createQuestionSchema } from '@/lib/definitions';
import { IconPlus, IconEdit, IconAlertCircle } from '@tabler/icons-react';
import { Question } from '@prisma/client';
import { createQuestion, updateQuestion } from '@/lib/actions';
import { useFocusTrap } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

export default function QuestionForm({ question }: { question?: Question }) {
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [showLibraryWarning, setShowLibraryWarning] = useState(false);
  const focusTrapRef = useFocusTrap();
  const router = useRouter();

  useEffect(() => {
    if (question?.libraryQuestionId) {
      setShowLibraryWarning(true);
      setIsEditing(false);
    }
  }, [question]);

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

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      if (question) {
        await updateQuestion(question.id, values);
      } else {
        await createQuestion(values);
      }
      router.push('/questions');
    } catch (error) {
      console.error('Error submitting question:', error);
      notifications.show({
        message: 'Something went wrong saving this question',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default button behavior
    setIsEditing(true);
  };

  return (
    <>
      {showLibraryWarning && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Library Question"
          color="blue"
          mb="md"
        >
          This question is linked to a library question. Editing it will create
          a new question and archive the current one.
        </Alert>
      )}
      <form
        onSubmit={form.onSubmit(handleSubmit, handleError)}
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
          disabled={!isEditing && !!question}
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
          disabled={!isEditing && !!question}
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
            disabled={!isEditing && !!question}
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
            disabled={!isEditing && !!question}
          />
        )}
        <Group justify="flex-end" mt="md">
          {question && !isEditing ? (
            <Button onClick={handleEditClick} leftSection={<IconEdit />}>
              Edit
            </Button>
          ) : (
            <Button
              type="submit"
              data-disabled={submitting}
              leftSection={<IconPlus />}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </Group>
      </form>
    </>
  );
}
