import { Types } from 'mongoose';

export type IMessage = {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  roomId: Types.ObjectId;
  message: string;
};
