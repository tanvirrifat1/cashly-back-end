import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  role: USER_ROLES;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  password: string;
  status: 'active' | 'suspended' | 'deleted';
  loginStatus: 'pending' | 'approved';
  verified: boolean;
  phone: string;
  image: string;
  isSuspended: boolean;
  suspensionEndDate?: Date;
  agency?: Types.ObjectId;
  buyer?: Types.ObjectId;

  agencis?: Types.ObjectId;

  location: {
    type: { type: String; enum: ['Point']; default: 'Point' };
    coordinates: [number, number];
  };
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isExistUserByPhone(phone: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
