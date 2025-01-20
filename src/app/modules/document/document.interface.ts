import { Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IDocument = {
  image: string[];
  userId: Types.ObjectId;
  status: 'active' | 'delete';
  role: USER_ROLES.AGENCY | USER_ROLES.BUYER;
};
