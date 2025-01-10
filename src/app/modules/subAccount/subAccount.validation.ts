import { z } from 'zod';

const SubUserShemaCreate = z.object({
  firstName: z.string({ required_error: 'firstName is required' }),
  lastName: z.string({ required_error: 'lastName is required' }),
  email: z.string({ required_error: 'Email is required' }),
  address: z.string({ required_error: 'Address is required' }),
  phone: z.string({ required_error: 'Phone is required' }),
  password: z.string({ required_error: 'Password is required' }),
});
const SubUserShemaUpdate = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
});

export const SubUserValidation = {
  SubUserShemaUpdate,
  SubUserShemaCreate,
};
