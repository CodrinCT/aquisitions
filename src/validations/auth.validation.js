import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.email('Invalid email address').trim(),
  password: z
    .string()
    .min(3, 'Password must be at least 3 characters long')
    .max(128, 'Password must be at most 128 characters long'),
  role: z.enum(['user', 'admin']).default('user').optional(),
});

export const signInSchema = z.object({
  email: z.email('Invalid email address').trim(),
  password: z
    .string()
    .min(3, 'Password must be at least 3 characters long')
    .max(128, 'Password must be at most 128 characters long'),
});
