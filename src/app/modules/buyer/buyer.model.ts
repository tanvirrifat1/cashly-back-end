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
    default:
      'https://www.shutterstock.com/shutterstock/photos/1153673752/display_1500/stock-vector-profile-placeholder-image-gray-silhouette-no-photo-1153673752.jpg',
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
