'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { LoginUserInput, loginUserSchema } from '../../lib/user-schema';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { Button, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export const LoginForm = () => {
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
        {...register('email')}
      />
      {errors['email'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['email']?.message as string}
        </span>
      )}
      <TextInput
        type="password"
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

      <a
        className="px-7 py-2 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full flex justify-center items-center mb-3"
        style={{ backgroundColor: '#3b5998' }}
        onClick={() => signIn('google', { callbackUrl })}
        role="button"
      >
        <IconBrandGoogleFilled className="mr-2" />
        Continue with Google
      </a>
    </form>
  );
};
