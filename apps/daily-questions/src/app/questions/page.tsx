import { Button, Container, Title, Group, Stack, Space } from '@mantine/core';
import { Suspense } from 'react';
import QuestionPageContent from './content';

export default function QuestionPage() {
  return (
    <Container size="xl">
      <Stack>
        <Group justify="space-between" align="center">
          <Title order={2}>My Daily Questions</Title>
          <Button
            component="a"
            href="/questions/new"
            size="md"
            variant="filled"
            color="blue"
          >
            Add Question
          </Button>
        </Group>
        <Space h="md" />
        <Suspense fallback={<div>Loading...</div>}>
          <QuestionPageContent />
        </Suspense>
      </Stack>
    </Container>
  );
}
