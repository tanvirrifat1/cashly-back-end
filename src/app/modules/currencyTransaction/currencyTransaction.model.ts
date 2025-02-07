import { model, Schema } from 'mongoose';
import { ICurrencyTransaction } from './currencyTransaction.interface';

const currencyTransactionSchema = new Schema<ICurrencyTransaction>(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
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

    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'accepted'],
    },
  },
  {
    timestamps: true,
  }
);

export const CurrencyTransaction = model<ICurrencyTransaction>(
  'CurrencyTransaction',
  currencyTransactionSchema
);
