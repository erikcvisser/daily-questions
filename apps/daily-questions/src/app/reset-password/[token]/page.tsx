'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import {
  Button,
  PasswordInput,
  Stack,
  Paper,
  Container,
  Title,
} from '@mantine/core';
import { resetPassword } from '@/lib/actions';

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const result = await resetPassword(params.token, password);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message:
            'Your password has been reset. Please login with your new password.',
          color: 'green',
        });
        router.push('/login');
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="xl" my="lg">
      <Title order={2} mb="xl">
        Reset Password
      </Title>
      <Container size="sm">
        <Paper p="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack>
              {error && (
                <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
              )}
              <PasswordInput
                name="password"
                label="New Password"
                placeholder="Enter new password"
                required
              />
              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                required
              />
              <Button type="submit" loading={submitting}>
                {submitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Container>
  );
}
