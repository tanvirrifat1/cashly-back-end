import { Types } from 'mongoose';

export type IReview = {
  rating: number;
  review: string;
  user: Types.ObjectId;
  currency: Types.ObjectId;
  status: 'active' | 'delete';
};
