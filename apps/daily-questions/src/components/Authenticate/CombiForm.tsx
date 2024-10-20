'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import {
  IconBrandGoogleFilled,
  IconMail,
  IconBrandAzure,
} from '@tabler/icons-react';
import {
  Button,
  Group,
  PasswordInput,
  TextInput,
  Box,
  Stack,
  SegmentedControl,
  Paper,
  Divider,
  Text,
} from '@mantine/core';

import {
  LoginUserInput,
  loginUserSchema,
  CreateUserInput,
  createUserSchema,
} from '@/lib/definitions';
import { registerUser } from '@/lib/actions';

export function CombiForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const loginMethods = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
  });

  const registerMethods = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const onLoginSubmit: SubmitHandler<LoginUserInput> = async (values) => {
    try {
      setSubmitting(true);
      const res = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        redirectTo: callbackUrl,
      });

      if (!res?.error) {
        if (onLoginSuccess) onLoginSuccess();
        notifications.show({
          title: 'Success!',
          message: 'You have successfully signed in! 🌟',
        });
        router.push(callbackUrl);
        router.refresh();
      } else {
        loginMethods.reset({ password: '' });
        setError('Invalid email or password');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onRegisterSubmit: SubmitHandler<CreateUserInput> = async (values) => {
    try {
      setSubmitting(true);
      const result = await registerUser(values);

      if (result.success) {
        const signInResult = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          if (onLoginSuccess) onLoginSuccess();
          notifications.show({
            title: 'Success!',
            message: 'You have successfully registered and signed in! 🎉',
          });
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError('Failed to sign in after registration');
        }
      } else {
        setError('Registration failed');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  const handleMicrosoftSignIn = () => {
    signIn('microsoft-entra-id', { callbackUrl });
  };

  const handleMagicLinkSignIn = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;
    setSubmitting(true);
    try {
      const result = await signIn('postmark', {
        email,
        redirect: false,
        callbackUrl,
      });
      if (result?.ok) {
        notifications.show({
          title: 'Magic Link Sent',
          message: 'Check your email for the login link.',
          color: 'green',
        });
      } else {
        setError('Failed to send magic link. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack>
        <SegmentedControl
          value={mode}
          onChange={(value) => setMode(value as 'login' | 'register')}
          data={[
            { label: 'Login', value: 'login' },
            { label: 'Register', value: 'register' },
          ]}
          fullWidth
        />

        {error && (
          <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
        )}

        {mode === 'login' ? (
          <form onSubmit={loginMethods.handleSubmit(onLoginSubmit)}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                {...loginMethods.register('email')}
                error={loginMethods.formState.errors.email?.message}
              />
              <PasswordInput
                label="Password"
                placeholder="Password"
                {...loginMethods.register('password')}
                error={loginMethods.formState.errors.password?.message}
              />
              <Button type="submit" loading={submitting}>
                {submitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
        ) : (
          <form onSubmit={registerMethods.handleSubmit(onRegisterSubmit)}>
            <Stack>
              <TextInput
                label="Name"
                placeholder="Your Name"
                {...registerMethods.register('name')}
                error={registerMethods.formState.errors.name?.message}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                {...registerMethods.register('email')}
                error={registerMethods.formState.errors.email?.message}
              />
              <PasswordInput
                label="Password"
                placeholder="Password"
                {...registerMethods.register('password')}
                error={registerMethods.formState.errors.password?.message}
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm Password"
                {...registerMethods.register('passwordConfirm')}
                error={
                  registerMethods.formState.errors.passwordConfirm?.message
                }
              />
              <Button type="submit" loading={submitting}>
                {submitting ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </Stack>
          </form>
        )}

        <Divider
          my="xs"
          label={<Text size="sm">OR</Text>}
          labelPosition="center"
        />

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          leftSection={<IconBrandGoogleFilled />}
          fullWidth
        >
          Continue with Google
        </Button>

        <Button
          onClick={handleMicrosoftSignIn}
          variant="outline"
          leftSection={<IconBrandAzure />}
          fullWidth
        >
          Continue with Microsoft
        </Button>

        <form onSubmit={handleMagicLinkSignIn}>
          <Stack>
            <TextInput
              name="email"
              label="Email for Magic Link"
              placeholder="your@email.com"
              required
            />
            <Button
              type="submit"
              variant="outline"
              leftSection={<IconMail />}
              fullWidth
              loading={submitting}
            >
              {submitting ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
