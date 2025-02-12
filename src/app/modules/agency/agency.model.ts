import { model, Schema } from 'mongoose';
import { IAgency } from './agency.interface';

const agencySchema = new Schema<IAgency>({
  address: {
    type: String,
    required: true,
    trim: false,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: false,
  },

  lastName: {
    type: String,
    required: false,
    trim: true,
  },

  phone: {
    type: String,
  },

  image: {
    type: String,
    required: false,
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
  count: {
    type: String,
  },
  rating: {
    type: Number,
  },
});

agencySchema.index({ location: '2dsphere' });

export const Agency = model<IAgency>('Agency', agencySchema);
