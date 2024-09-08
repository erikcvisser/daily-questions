import { TypeOf, object, string, z } from 'zod';

export const createQuestionSchema = object({
  title: z
    .string({ required_error: 'Question is required' })
    .min(5, 'Minimum 5 charachters'),
  type: z.enum(['INTEGER', 'BOOLEAN', 'FREETEXT']),
  targetInt: z.coerce.number().optional(),
  targetBool: z.coerce.boolean().optional(),
});

export const createUserSchema = object({
  name: string({ required_error: 'Name is required' }).min(
    1,
    'Name is required'
  ),
  email: string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email'),
  photo: string().optional(),
  password: string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
  passwordConfirm: string({
    required_error: 'Please confirm your password',
  }).min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Passwords do not match',
});

export const loginUserSchema = object({
  email: string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email or password'),
  password: string({ required_error: 'Password is required' }).min(
    1,
    'Password is required'
  ),
});

export type CreateQuestionInput = TypeOf<typeof createQuestionSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type CreateUserInput = TypeOf<typeof createUserSchema>;
