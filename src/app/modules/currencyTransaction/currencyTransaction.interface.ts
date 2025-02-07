import { Types } from 'mongoose';

export type ICurrencyTransaction = {
  amount: number;
  currency: string;
  agencyId: Types.ObjectId;
  buyerId: Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled' | 'accepted';
};
