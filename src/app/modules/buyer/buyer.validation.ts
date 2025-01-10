import { z } from 'zod';

export const BuyerShema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  maxDistanceInMeters: z.string().optional(),
});

export const BuyerValidation = {
  BuyerShema,
};
