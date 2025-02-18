import { model, Schema } from 'mongoose';
import { ICurrency } from './currency.interface';

export const currencySchema = new Schema<ICurrency>(
  {
    amount: { type: String, required: true },
    currency: { type: String, required: true },
    rate: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'deleted'], default: 'active' },
    count: { type: String },
    rating: { type: Number },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

currencySchema.index({ location: '2dsphere' });

export const Currency = model<ICurrency>('Currency', currencySchema);
