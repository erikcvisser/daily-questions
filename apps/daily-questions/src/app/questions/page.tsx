import { Button, Container, Title, Group, Stack, Space } from '@mantine/core';
import { Suspense } from 'react';
import QuestionPageContent from './content';
import Link from 'next/link';

export default function QuestionPage() {
  return (
    <Container size="xl" mt="lg">
      <Stack>
        <Group justify="space-between" align="center" mb="lg">
          <Title order={2}>My Daily Questions</Title>
          <Button
            component={Link}
            href="/questions/new"
            size="md"
            variant="filled"
            color="blue"
          >
            Add Question
          </Button>
        </Group>
        <Suspense fallback={<div>Loading...</div>}>
          <QuestionPageContent />
        </Suspense>
      </Stack>
    </Container>
  );
}
