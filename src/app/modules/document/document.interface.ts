import { Types } from 'mongoose';

export type IDocument = {
  image: string[];
  userId: Types.ObjectId;
  status: 'active' | 'delete';
};
