import { z } from 'zod';

export const AgencyShema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  location: z
    .object({
      type: z.literal('Point'),
      coordinates: z
        .array(z.number())
        .length(
          2,
          'Coordinates must include exactly two values (longitude and latitude)'
        ),
    })
    .optional(),
});

export const AgencyValidation = {
  AgencyShema,
};
