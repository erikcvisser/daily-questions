'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Group, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export const NewQuestion = () => {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const create = async (e: React.SyntheticEvent) => {
    setSubmitting(true);
    e.preventDefault();
    await fetch(`/api/questions`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
      }),
    });

    setSubmitting(false);
    router.refresh();
    setTitle('');
  };
  return (
    <>
      <form onSubmit={create} className="flex gap-3 items-center">
        <TextInput
          type="text"
          label="Question"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title question"
          required
        />

        <Group justify="flex-end" mt="md">
          <Button
            type="submit"
            data-disabled={submitting}
            leftSection={<IconPlus />}
          >
            {submitting ? 'saving...' : 'Save'}
          </Button>
        </Group>
      </form>
    </>
  );
};
