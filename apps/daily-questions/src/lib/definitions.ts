import { z } from 'zod';

export const createQuestionSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['INTEGER', 'BOOLEAN', 'RATING', 'FREETEXT']),
    targetInt: z.coerce.number().optional(),
    targetBool: z.string().optional(),
    targetRating: z.string().optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    frequencyInterval: z.coerce.number().optional(),
    dayOfWeek: z.coerce.number().optional(),
    monthlyTrigger: z.string().optional(),
  })
  .refine(
    (data) => {
      // Make targetInt required when type is INTEGER
      if (data.type === 'INTEGER') {
        return data.targetInt !== undefined;
      }
      return true;
    },
    {
      message: 'Target value is required for numeric questions',
      path: ['targetInt'],
    }
  )
  .refine(
    (data) => {
      // Make targetBool required when type is BOOLEAN
      if (data.type === 'BOOLEAN') {
        return data.targetBool !== '';
      }
      return true;
    },
    {
      message: 'Target value is required for yes/no questions',
      path: ['targetBool'],
    }
  )
  .refine(
    (data) => {
      // Make targetRating required when type is RATING
      if (data.type === 'RATING') {
        return data.targetRating !== '';
      }
      return true;
    },
    {
      message: 'Target rating is required for rating questions',
      path: ['targetRating'],
    }
  )
  .refine(
    (data) => {
      // Make dayOfWeek required when frequency is WEEKLY
      if (data.frequency === 'WEEKLY') {
        return data.dayOfWeek !== undefined;
      }
      return true;
    },
    {
      message: 'Day of week is required for weekly questions',
      path: ['dayOfWeek'],
    }
  )
  .refine(
    (data) => {
      // Make monthlyTrigger required when frequency is MONTHLY
      if (data.frequency === 'MONTHLY') {
        return data.monthlyTrigger !== '';
      }
      return true;
    },
    {
      message: 'Monthly trigger is required for monthly questions',
      path: ['monthlyTrigger'],
    }
  );

export const submitQuestionnaireSchema = z.object({
  date: z.date(),
  answers: z.record(
    z.union([z.string(), z.number().transform((n) => n.toString())])
  ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

export const loginUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email or password'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type CreateQuestionInput = z.TypeOf<typeof createQuestionSchema>;
export type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
