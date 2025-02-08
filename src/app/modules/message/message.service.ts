import { IMessage } from './message.interface';
import { Message } from './message.model';

const getAllMessages = async (id: string, query: Record<string, unknown>) => {
  const { page, limit } = query;

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch messages
  const messages = await Message.find({
    $or: [{ senderId: id }, { receiverId: id }],
  })
    .populate({
      path: 'senderId',
      select: 'agency',
      populate: {
        path: 'agency',
        select: 'email image',
      },
    })
    .populate({
      path: 'receiverId',
      select: 'buyer',
      populate: {
        path: 'buyer',
        select: 'email image',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Message.countDocuments({
    $or: [{ senderId: id }, { receiverId: id }],
  });

  return {
    result: messages,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const MessageService = {
  getAllMessages,
};
