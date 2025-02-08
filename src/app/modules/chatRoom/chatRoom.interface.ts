import { Types } from 'mongoose';

export type IChatRoom = {
  participants: Types.ObjectId[];
  userId: Types.ObjectId;
  receiverId: Types.ObjectId;
};
