import { Types } from 'mongoose';

export type ICurrency = {
  amount: string;
  rate: string;
  currency: string;
  location: {
    type: { type: String; enum: ['Point']; default: 'Point' };
    coordinates: [number, number];
  };
  date: Date;
  userId: Types.ObjectId;
  status: 'active' | 'deleted';
  rating?: number;
  count?: string;
};
