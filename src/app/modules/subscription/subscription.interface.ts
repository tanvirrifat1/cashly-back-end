import { Types } from 'mongoose';

export interface ISubscription {
  productId: string;
  purchaseId: string;
  expiryData: string;
  purchaseDate: Date;
  packageName: string;
  purchaseToken: string;
  packagePrice: number;
  userId: Types.ObjectId;
}
