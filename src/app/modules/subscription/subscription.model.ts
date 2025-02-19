import { model, Schema } from 'mongoose';
import { ISubscription } from './subscription.interface';

const subscribtionSchema = new Schema<ISubscription>({
  productId: { type: String, required: true },
  purchaseId: { type: String, required: true },
  expiryData: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  packageName: { type: String, required: true },
  purchaseToken: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Subscriptation = model('subscriptation', subscribtionSchema);
