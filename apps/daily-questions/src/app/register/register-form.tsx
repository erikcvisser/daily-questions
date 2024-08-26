'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Group,
  Input,
  Notification,
  PasswordInput,
  rem,
  TextInput,
} from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { CreateUserInput, createUserSchema } from '@/lib/user-schema';

export const RegisterForm = () => {
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmitHandler: SubmitHandler<CreateUserInput> = async (values) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();

        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorData.errors.forEach((error: any) => {
            // toast.error(error.message);
          });

          return;
        }

        // toast.error(errorData.message);
        return;
      }

      signIn(undefined, { callbackUrl: '/' });
    } catch (error: any) {
      // toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <TextInput {...register('name')} label="Name" placeholder="Name" />
      {errors['name'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['name']?.message as string}
        </span>
      )}
      <TextInput
        type="email"
        data-autofocus
        {...register('email')}
        placeholder="Email address"
      />
      {errors['email'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['email']?.message as string}
        </span>
      )}
      <PasswordInput
        label="Password"
        {...register('password')}
        placeholder="Password"
      />
      {errors['password'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['password']?.message as string}
        </span>
      )}
      <PasswordInput
        type="password"
        label="Confirm Password"
        {...register('passwordConfirm')}
        placeholder="Confirm Password"
      />
      {errors['passwordConfirm'] && (
        <span className="text-red-500 text-xs pt-1 block">
          {errors['passwordConfirm']?.message as string}
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
    </form>
  );
};
