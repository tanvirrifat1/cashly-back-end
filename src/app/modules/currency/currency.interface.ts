import { Types } from 'mongoose';

export type ICurrency = {
  amount: string;
  currency: string;
  location: string;
  date: Date;
  userId: Types.ObjectId;
  status: 'active' | 'deleted';
};
