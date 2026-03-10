'use client';

import { Button } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useTransition } from 'react';
import { addStarterQuestions } from '@/lib/actions';

export default function AddStarterQuestionsButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="md"
      leftSection={<IconSparkles size={20} />}
      loading={isPending}
      onClick={() => startTransition(() => addStarterQuestions())}
    >
      Add Starter Questions
    </Button>
  );
}
