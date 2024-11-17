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
  PasswordInput,
  TextInput,
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
import posthog from 'posthog-js';

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
        posthog.capture('user_login_success', {
          method: 'credentials',
          email: values.email,
        });
        router.push(callbackUrl);
        router.refresh();
      } else {
        loginMethods.reset({ password: '' });
        setError('Invalid email or password');
        posthog.capture('user_login_failed', {
          method: 'credentials',
          error: 'Invalid credentials',
          email: values.email,
        });
      }
    } catch (error: any) {
      setError(error.message);
      posthog.capture('user_login_error', {
        method: 'credentials',
        error: error.message,
        email: values.email,
      });
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
          posthog.capture('user_registration_success', {
            method: 'credentials',
            email: values.email,
          });
          router.push(callbackUrl);
          router.refresh();
        } else {
          setError('Failed to sign in after registration');
          posthog.capture('user_registration_signin_failed', {
            method: 'credentials',
            email: values.email,
          });
        }
      } else {
        setError('Registration failed');
        posthog.capture('user_registration_failed', {
          method: 'credentials',
          email: values.email,
        });
      }
    } catch (error: any) {
      setError(error.message);
      posthog.capture('user_registration_error', {
        method: 'credentials',
        error: error.message,
        email: values.email,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    posthog.capture('auth_provider_selected', { provider: 'google' });
    signIn('google', { callbackUrl });
  };

  const handleMicrosoftSignIn = () => {
    posthog.capture('auth_provider_selected', { provider: 'microsoft' });
    signIn('microsoft-entra-id', { callbackUrl });
  };

  const handleMagicLinkSignIn = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const email = event.currentTarget.email.value;
    setSubmitting(true);
    try {
      const result = await signIn('resend', {
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
        posthog.capture('magic_link_sent', { email });
      } else {
        setError('Failed to send magic link. Please try again.');
        posthog.capture('magic_link_failed', {
          email,
          error: 'Failed to send magic link',
        });
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      posthog.capture('magic_link_error', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeChange = (value: 'login' | 'register') => {
    setMode(value);
    posthog.capture('auth_mode_changed', { mode: value });
  };

  return (
    <Paper p="md" withBorder>
      <Stack>
        <SegmentedControl
          value={mode}
          onChange={(value) => handleModeChange(value as 'login' | 'register')}
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
                required
                {...loginMethods.register('email')}
                error={loginMethods.formState.errors.email?.message}
              />
              <PasswordInput
                label="Password"
                required
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
                required
                {...registerMethods.register('name')}
                error={registerMethods.formState.errors.name?.message}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...registerMethods.register('email')}
                error={registerMethods.formState.errors.email?.message}
              />
              <PasswordInput
                label="Password"
                placeholder="Password"
                required
                {...registerMethods.register('password')}
                error={registerMethods.formState.errors.password?.message}
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm Password"
                required
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
