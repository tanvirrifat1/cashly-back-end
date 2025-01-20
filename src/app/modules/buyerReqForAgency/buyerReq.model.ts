import { model, Schema } from 'mongoose';
import { IBuyerReqForAgency } from './buyerReq.interface';

const buyerReqSchema = new Schema<IBuyerReqForAgency>({
  agencyId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
  },
});

export const BuyerReqForAgency = model<IBuyerReqForAgency>(
  'BuyerReqForAgency',
  buyerReqSchema
);
