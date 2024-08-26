'use client';

import { ActionIcon, Button, CloseButton, List, ListItem } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Question } from '@prisma/client';

export const QuestionItem = ({ questions }: { questions: Question[] }) => {
  const router = useRouter();

  const deleteQuestion = async (question: Question) => {
    await fetch(`/api/questions/${question.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: question.id,
      }),
    });

    router.refresh();
  };

  return (
    <List>
      {questions.map((question) => (
        <ListItem key={question.id}>
          <ActionIcon
            onClick={() => deleteQuestion(question)}
            aria-label="delete question"
          >
            <CloseButton />
          </ActionIcon>
          {question.title}
        </ListItem>
      ))}
    </List>
  );
};
