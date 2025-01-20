import { model, Schema } from 'mongoose';
import { ICurrency } from './currency.interface';

export const currencySchema = new Schema<ICurrency>(
  {
    amount: { type: String, required: true },
    currency: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  },
  { timestamps: true }
);

export const Currency = model<ICurrency>('Currency', currencySchema);
