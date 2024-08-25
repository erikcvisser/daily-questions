import { Container, Title } from '@mantine/core';
import { RegisterForm } from './register-form';

export default async function RegisterPage() {
  return (
    <Container size="xs">
      <Title order={1}>Register</Title>
      <RegisterForm />
    </Container>
  );
}
