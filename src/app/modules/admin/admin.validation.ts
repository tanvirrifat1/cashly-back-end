import { z } from 'zod';

const createAdminZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'firstName is required' }),
    lastName: z.string({ required_error: 'lastName is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
};
