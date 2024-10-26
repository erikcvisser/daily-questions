import { Suspense } from 'react';
import OverviewContent from './content';
import { Stack, Container, Title, Space } from '@mantine/core';

export default function OverviewPage() {
  return (
    <Container size="xl" mt="lg">
      <Stack>
        <Title order={2}>Overview of your submissions</Title>
        <Space h="md" />
        <Suspense fallback={<div>Loading...</div>}>
          <OverviewContent />
        </Suspense>
      </Stack>
    </Container>
  );
}
