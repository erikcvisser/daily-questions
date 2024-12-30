'use client';
import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  NumberInput,
  Select,
  TextInput,
  Alert,
  Stack,
  Grid,
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
      targetRating: question?.targetRating?.toString() || '',
      frequency: question?.frequency || 'DAILY',
      frequencyInterval: question?.frequencyInterval?.toString() || '1',
      dayOfWeek: question?.dayOfWeek?.toString() || '0',
      monthlyTrigger: question?.monthlyTrigger || '1',
    },
    validateInputOnChange: true,
    validate: zodResolver(createQuestionSchema),
  });

  const handleError = (errors: typeof form.errors) => {
    if (errors) {
      console.log('Form errors:', errors);
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
    e.preventDefault();
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
        <Stack>
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
              { value: 'RATING', label: 'Rating (0-5)' },
              { value: 'FREETEXT', label: 'Free text' },
            ]}
            withAsterisk
            allowDeselect={false}
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
              required
              disabled={!isEditing && !!question}
            />
          )}
          {form.getValues()['type'] == 'RATING' && (
            <Select
              label="Target rating (0-5)"
              key={form.key('targetRating')}
              {...form.getInputProps('targetRating')}
              min={0}
              max={5}
              placeholder="Target rating"
              withAsterisk
              data={[
                { value: '0', label: '0. Not done' },
                { value: '1', label: '1. Marginal effort' },
                { value: '2', label: '2. Some effort' },
                { value: '3', label: '3. OK' },
                { value: '4', label: '4. Very good' },
                { value: '5', label: '5. Exceptional' },
              ]}
              disabled={!isEditing && !!question}
              allowDeselect={false}
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
              allowDeselect={false}
            />
          )}

          <Select
            label="Frequency"
            placeholder="Select frequency"
            key={form.key('frequency')}
            {...form.getInputProps('frequency')}
            comboboxProps={{ shadow: 'md' }}
            data={[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Monthly', value: 'MONTHLY' },
            ]}
            withAsterisk
            disabled={!isEditing && !!question}
            allowDeselect={false}
          />

          {form.getValues()['frequency'] === 'WEEKLY' && (
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, xs: 4 }}>
                <NumberInput
                  label="Every N weeks"
                  {...form.getInputProps('frequencyInterval')}
                  min={1}
                  max={52}
                  placeholder="1"
                  disabled={!isEditing && !!question}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, xs: 8 }}>
                <Select
                  label="Day of week"
                  placeholder="Select day of week"
                  {...form.getInputProps('dayOfWeek')}
                  data={[
                    { value: '0', label: 'Sunday' },
                    { value: '1', label: 'Monday' },
                    { value: '2', label: 'Tuesday' },
                    { value: '3', label: 'Wednesday' },
                    { value: '4', label: 'Thursday' },
                    { value: '5', label: 'Friday' },
                    { value: '6', label: 'Saturday' },
                  ]}
                  disabled={!isEditing && !!question}
                  allowDeselect={false}
                />
              </Grid.Col>
            </Grid>
          )}
          {form.getValues()['frequency'] === 'MONTHLY' && (
            <>
              <Select
                label="Monthly trigger"
                placeholder="Select when to trigger"
                {...form.getInputProps('monthlyTrigger')}
                data={[
                  { value: '1', label: '1st of month' },
                  { value: '15', label: '15th of month' },
                  { value: 'LAST_DAY', label: 'Last day of month' },
                  { value: 'FIRST_MONDAY', label: 'First Monday' },
                  { value: 'FIRST_TUESDAY', label: 'First Tuesday' },
                  { value: 'FIRST_WEDNESDAY', label: 'First Wednesday' },
                  { value: 'FIRST_THURSDAY', label: 'First Thursday' },
                  { value: 'FIRST_FRIDAY', label: 'First Friday' },
                  { value: 'LAST_MONDAY', label: 'Last Monday' },
                  { value: 'LAST_TUESDAY', label: 'Last Tuesday' },
                  { value: 'LAST_WEDNESDAY', label: 'Last Wednesday' },
                  { value: 'LAST_THURSDAY', label: 'Last Thursday' },
                  { value: 'LAST_FRIDAY', label: 'Last Friday' },
                ]}
                disabled={!isEditing && !!question}
                withAsterisk
                allowDeselect={false}
              />
            </>
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
        </Stack>
      </form>
    </>
  );
}
