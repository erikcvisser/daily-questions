'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { LoginUserInput, loginUserSchema } from '@/lib/definitions';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { Button, Group, PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export function LoginForm({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const methods = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmitHandler: SubmitHandler<LoginUserInput> = async (values) => {
    try {
      setSubmitting(true);

      const res = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        redirectTo: callbackUrl,
      });

      setSubmitting(false);

      if (!res?.error) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        notifications.show({
          title: 'Success!',
          message: 'You have successfully signed in! 🌟',
        });
        // toast.success('successfully logged in');
        router.push(callbackUrl);
      } else {
        reset({ password: '' });
        const message = 'invalid email or password';
        // toast.error(message);
        setError(message);
      }
    } catch (error: any) {
      // toast.error(error.message);
      notifications.show({
        title: 'Default notification',
        message: 'Do not forget to star Mantine on GitHub! 🌟',
      });
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      {error && (
        <p className="text-center bg-red-300 py-4 mb-6 rounded">{error}</p>
      )}
      <TextInput
        type="email"
        label="Email"
        withAsterisk
        placeholder="your@email.com"
        data-autofocus
        {...register('email')}
      />
      {errors['email'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['email']?.message as string}
        </span>
      )}
      <PasswordInput
        label="Pasword"
        withAsterisk
        {...register('password')}
        placeholder="Password"
      />
      {errors['password'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['password']?.message as string}
        </span>
      )}
      <Group justify="flex-end" mt="md">
        <Button
          type="submit"
          data-disabled={submitting}
          // onClick={(event) => event.preventDefault()}
        >
          {submitting ? 'loading...' : 'Sign In'}
        </Button>
      </Group>

      <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
        <p className="text-center font-semibold mx-4 mb-0">OR</p>
      </div>

      <Button
        type="button"
        onClick={() => signIn('google', { callbackUrl })}
        variant="outline"
        leftSection={<IconBrandGoogleFilled />}
        fullWidth
      >
        Continue with Google
      </Button>
    </form>
  );
}
