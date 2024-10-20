import { Card, Container, Title, Stack, Space } from '@mantine/core';
import { CombiForm } from '@/components/Authenticate/CombiForm';
import { Suspense } from 'react';

export default async function LoginPage() {
  return (
    <Container size="sm">
      <Stack>
        <Title order={1}>Login</Title>
        <Space h="md" />
        <Card shadow="sm" padding="lg" withBorder>
          <Suspense fallback="Loading...">
            <CombiForm />
          </Suspense>
        </Card>
      </Stack>
    </Container>
  );
}
