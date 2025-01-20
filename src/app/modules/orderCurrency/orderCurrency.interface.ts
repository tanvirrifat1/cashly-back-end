import { Types } from 'mongoose';

export type IOrderCurrency = {
  currency: Types.ObjectId;
  user: Types.ObjectId;
  location: {
    type: { type: String; enum: ['Point']; default: 'Point' };
    coordinates: [number, number];
  };
  status: 'pending' | 'completed' | 'cancelled';
  time: Date;
};
