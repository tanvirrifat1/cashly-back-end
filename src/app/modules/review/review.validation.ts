import { z } from 'zod';
import { Types } from 'mongoose';

const ReviewSchemaValidation = z.object({
  body: z.object({
    rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
    agency: z
      .string({ required_error: 'Agency is required' })
      .refine(val => Types.ObjectId.isValid(val)),
  }),
});

export default ReviewSchemaValidation;
