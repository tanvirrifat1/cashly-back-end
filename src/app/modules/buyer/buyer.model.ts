import { model, Schema } from 'mongoose';
import { IBuyer } from './buyer.interface';

const buyerSchema = new Schema<IBuyer>({
  address: {
    type: String,
    required: false,
  },

  email: {
    type: String,
    required: false,
    unique: true,
  },

  firstName: {
    type: String,
    required: false,
  },

  lastName: {
    type: String,
    required: false,
  },

  phone: {
    type: String,
  },
  image: {
    type: String,
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

  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },
});

buyerSchema.index({ location: '2dsphere' });

export const Buyer = model<IBuyer>('Buyer', buyerSchema);
