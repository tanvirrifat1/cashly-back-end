import { Types } from 'mongoose';

export type IBuyerReqForAgency = {
  buyerId: Types.ObjectId;
  agencyId: Types.ObjectId;
  orderId: Types.ObjectId;
  currency: Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled' | 'accepted';
  time: Date;
  location: {
    type: { type: String; enum: ['Point']; default: 'Point' };
    coordinates: [number, number];
  };
};
