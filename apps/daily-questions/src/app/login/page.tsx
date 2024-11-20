import { Container, Title, Stack, Space } from '@mantine/core';
import { CombiForm } from '@/components/Authenticate/CombiForm';
import { Suspense } from 'react';

export default async function LoginPage() {
  return (
    <Container size="sm" mt="lg">
      <Stack>
        <Title order={2} mb="md">
          Login
        </Title>
        <Suspense fallback="Loading...">
          <CombiForm />
        </Suspense>
      </Stack>
    </Container>
  );
}
