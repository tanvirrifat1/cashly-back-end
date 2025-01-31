import { model, Schema } from 'mongoose';
import { IOrderCurrency } from './orderCurrency.interface';

const orderSchema = new Schema<IOrderCurrency>(
  {
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
      enum: ['pending', 'completed', 'cancelled', 'accepted'],
      default: 'pending',
    },
    time: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

//exist user check
export const Order = model<IOrderCurrency>('Order', orderSchema);
