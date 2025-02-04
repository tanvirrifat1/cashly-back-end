import { Model, Types } from 'mongoose';

export type IAgency = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  status: 'active' | 'suspended' | 'deleted';
  image: string;
  phone: string;
  location: {
    type: { type: String; enum: ['Point']; default: 'Point' };
    coordinates: [number, number];
  };
  rating?: number;
  count?: string;
};
