import { IMessage } from './message.interface';
import { Message } from './message.model';

const getAllMessages = async (id: string) => {
  const messages = await Message.find({
    $or: [{ senderId: id }, { receiverId: id }],
  })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');
  return messages;
};

export const MessageService = {
  getAllMessages,
};
