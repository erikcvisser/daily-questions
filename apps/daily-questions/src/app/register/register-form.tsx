'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  Group,
  PasswordInput,
  TextInput,
  Box,
  Stack,
} from '@mantine/core';
import { useState } from 'react';
import { CreateUserInput, createUserSchema } from '@/lib/definitions';
import { registerUser } from '@/lib/actions';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const methods = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = methods;

  const onSubmitHandler: SubmitHandler<CreateUserInput> = async (values) => {
    try {
      setSubmitting(true);
      const result = await registerUser(values);

      if (result.success) {
        // User registered successfully, now sign them in
        const signInResult = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: true,
        });

        if (signInResult?.ok) {
          // router.push('/');
          setSubmitting(false);
        } else {
          // Sign-in failed
          setError('root', { message: 'Failed to sign in after registration' });
        }
      } else {
        // Registration failed
        setError('root', { message: 'Registration failed' });
      }
    } catch (error: any) {
      setError('root', { message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maw={400} mx="auto">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Stack gap={'sm'}>
          <TextInput
            {...register('name')}
            label="Name"
            placeholder="Name"
            error={errors['name'] && (errors['name']?.message as string)}
          />
          <TextInput
            {...register('email')}
            label="Email"
            placeholder="Email address"
            error={errors['email'] && (errors['email']?.message as string)}
          />
          <PasswordInput
            {...register('password')}
            label="Password"
            placeholder="Password"
            error={
              errors['password'] && (errors['password']?.message as string)
            }
          />
          <PasswordInput
            {...register('passwordConfirm')}
            label="Confirm Password"
            placeholder="Confirm Password"
            error={
              errors['passwordConfirm'] &&
              (errors['passwordConfirm']?.message as string)
            }
          />
          {errors.root && (
            <div style={{ color: 'red' }}>{errors.root.message}</div>
          )}
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={submitting}>
              {submitting ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
};
