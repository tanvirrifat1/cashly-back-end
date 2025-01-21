import { z } from 'zod';
import { Types } from 'mongoose';

const ReviewSchemaValidation = z.object({
  body: z.object({
    rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
    review: z.string({ required_error: 'Review is required' }),
    currency: z
      .string({ required_error: 'Currency is required' })
      .refine(val => Types.ObjectId.isValid(val)),
  }),
});

export default ReviewSchemaValidation;
