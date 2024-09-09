import { Container, Title } from '@mantine/core';
import { LoginForm } from './login-form';
import { Suspense } from 'react';

export default async function LoginPage() {
  return (
    <Container size="xs">
      <Title order={1}>Login</Title>
      <Suspense fallback="Loading...">
        <LoginForm />
      </Suspense>
    </Container>
  );
}
