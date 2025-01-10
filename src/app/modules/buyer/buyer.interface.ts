import { Model, Types } from 'mongoose';

export type IBuyer = {
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
};
