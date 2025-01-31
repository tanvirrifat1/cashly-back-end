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
    enum: ['pending', 'completed', 'cancelled', 'accepted'],
  },
  time: {
    type: Date,
    required: true,
  },
  currency: {
    type: Schema.Types.ObjectId,
    ref: 'Currency',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
});

buyerReqSchema.index({ location: '2dsphere' });

export const BuyerReqForAgency = model<IBuyerReqForAgency>(
  'BuyerReqForAgency',
  buyerReqSchema
);
