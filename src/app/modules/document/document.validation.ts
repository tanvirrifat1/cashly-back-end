import { Types } from 'mongoose';
import { z } from 'zod';

export const DocumentSchema = z.object({
  image: z.array(z.string().url()), // Validates an array of strings as URLs
  userId: z.string().refine(id => Types.ObjectId.isValid(id), {
    message: 'Invalid ObjectId format',
  }), // Validates that userId is a valid ObjectId string
});
