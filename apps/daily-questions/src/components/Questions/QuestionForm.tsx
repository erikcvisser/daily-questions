'use client';
import { useEffect, useState } from 'react';
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
  // const [title, setTitle] = useState('dummy string');
  // const [type, setType] = useState<string | null>('INTEGER');
  // const [targetInt, setTargetInt] = useState<string | number | null>();
  // const [targetBool, setTargetBool] = useState<string | null>();
  const [submitting, setSubmitting] = useState(false);
  const focusTrapRef = useFocusTrap();

  // useEffect(() => {
  //   if (question) {
  //     setTitle(question.title);
  //     setType(question.type);
  //     setTargetInt(question.targetInt || '');
  //     setTargetBool(question.targetBool?.toString());
  //   }
  // }, [question]);

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

  // const updateQuestionWithId = question
  //   ? updateQuestion.bind(null, question.id)
  //   : undefined;

  const handleSubmit = (values: typeof form.values) => {
    setSubmitting(true);
    if (question) {
      // const updateQuestionWithId = updateQuestion.bind(null, question.id);
      updateQuestion(question.id, values);
    } else {
      createQuestion(values);
    }
  };
  return (
    <>
      <form
        onSubmit={form.onSubmit(handleSubmit, handleError)}
        // onSubmit={form.onSubmit(() => {
        //   console.log('123');
        // })}
        //onSubmit={form.onSubmit(setSubmittedValues)}
        //action={question ? updateQuestionWithId : createQuestion}
        className="flex gap-3 items-center"
        //    onSubmit={() => setSubmitting(true)}
        ref={focusTrapRef}
      >
        <TextInput
          type="text"
          label="Question"
          placeholder="Did I do my best to..."
          key={form.key('title')}
          {...form.getInputProps('title')}
          //      name="title"
          //      value={title}
          data-autofocus
          //     onChange={(e) => setTitle(e.currentTarget.value)}
          withAsterisk
        />
        <Select
          label="Type of question"
          placeholder="Pick value"
          key={form.key('type')}
          {...form.getInputProps('type')}
          //      value={type}
          // name="type"
          //      onChange={(_value, option) => setType(_value)}
          comboboxProps={{ shadow: 'md' }}
          data={[
            { value: 'BOOLEAN', label: 'Yes/no' },
            { value: 'INTEGER', label: 'Numeric score (1-10)' },
            { value: 'FREETEXT', label: 'Free text' },
          ]}
          required
        />

        {form.getValues()['type'] == 'INTEGER' && (
          <NumberInput
            label="Target value (0-10)"
            //name="targetInt"
            key={form.key('targetInt')}
            {...form.getInputProps('targetInt')}
            min={0}
            max={10}
            //    value={parseInt(targetInt as string)}
            //    onChange={setTargetInt}
            placeholder="Target value"
            withAsterisk
          />
        )}
        {form.getValues()['type'] == 'BOOLEAN' && (
          <Select
            label="Desired value"
            placeholder="Pick value"
            // name="targetBool"
            key={form.key('targetBool')}
            {...form.getInputProps('targetBool')}
            // value={targetBool}
            // onChange={(_value, option) => setTargetBool(_value)}
            comboboxProps={{ shadow: 'md' }}
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            required
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
