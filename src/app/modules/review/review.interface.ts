import { Types } from 'mongoose';

export type IReview = {
  rating: number;
  user: Types.ObjectId;
  agency: Types.ObjectId;
};
