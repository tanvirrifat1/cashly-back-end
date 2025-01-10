import { Types } from 'mongoose';

export type IMessage = {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
};
