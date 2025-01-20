import { Types } from 'mongoose';

export type IBuyerReqForAgency = {
  buyerId: Types.ObjectId;
  agencyId: Types.ObjectId;
  orderId: Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled';
};
