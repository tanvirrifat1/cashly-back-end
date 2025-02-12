import { JwtPayload } from 'jsonwebtoken';
import { Room } from './chatRoom.model';
import { Message } from '../message/message.model';

const getAllInboxs = async (id: string, query: Record<string, unknown>) => {
  const { page, limit } = query;

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch rooms
  const messages = await Room.find({
    userId: id,
  })
    .select('-userId -participants')
    .populate({
      path: 'receiverId',
      select: 'buyer agency',
      populate: [
        {
          path: 'buyer',
          select: 'image firstName lastName',
        },
        {
          path: 'agency',
          select: 'image firstName lastName',
        },
      ],
    })
    .skip(skip)
    .limit(size)
    .lean();

  // Fetch full last message for each room
  const roomIds = messages.map(msg => msg._id);
  const lastMessages = await Message.aggregate([
    { $match: { roomId: { $in: roomIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$roomId', lastMessage: { $first: '$$ROOT' } } }, // Get the full message document
  ]);

  // Convert lastMessages array into a dictionary for quick lookup
  const lastMessageMap = new Map(
    lastMessages.map(msg => [msg._id.toString(), msg.lastMessage])
  );

  // Transform data
  const transformedMessages = messages.map(msg => {
    const receiver = msg.receiverId as any;
    return {
      roomId: msg._id, // Room Collection ID (Room Name ID)
      receiverId: receiver?._id || null,
      image: receiver?.agency?.image || receiver?.buyer?.image || null,
      firstName:
        receiver?.agency?.firstName || receiver?.buyer?.firstName || '',
      lastName: receiver?.agency?.lastName || receiver?.buyer?.lastName || '',
      lastMessage: lastMessageMap.get(msg._id.toString()) || null, // Full last message document
    };
  });

  const count = await Room.countDocuments({
    userId: id,
  });

  return {
    result: transformedMessages,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const ChatRoomService = {
  getAllInboxs,
};
