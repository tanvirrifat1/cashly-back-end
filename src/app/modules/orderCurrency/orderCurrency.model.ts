import { model, Schema } from 'mongoose';
import { IOrderCurrency } from './orderCurrency.interface';

const orderSchema = new Schema<IOrderCurrency>(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: 'Currency',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    time: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ location: '2dsphere' });

//exist user check
export const Order = model<IOrderCurrency>('Order', orderSchema);
