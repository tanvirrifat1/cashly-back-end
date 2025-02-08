import { model, Schema, Types } from 'mongoose';
import { IChatRoom } from './chatRoom.interface';

const roomSchema = new Schema<IChatRoom>(
  {
    participants: [{ type: Types.ObjectId, ref: 'User', required: true }],
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
  },

  { timestamps: true }
);

export const Room = model('Room', roomSchema);
