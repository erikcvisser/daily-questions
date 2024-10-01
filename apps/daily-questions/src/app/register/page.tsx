import { Container, Title, Stack, Space } from '@mantine/core';
import { RegisterForm } from './register-form';

export default async function RegisterPage() {
  return (
    <Container size="sm">
      <Stack>
        <Title order={1}>Register</Title>
        <Space h="md" />
        <RegisterForm />
      </Stack>
    </Container>
  );
}
