import { JwtPayload } from 'jsonwebtoken';
import { Room } from './chatRoom.model';
import { Message } from '../message/message.model';

const getAllInboxs = async (id: string, query: Record<string, unknown>) => {
  const { page, limit } = query;

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch rooms where user is either sender or receiver
  const messages = await Room.find({
    $or: [{ userId: id }, { receiverId: id }],
  })
    .select('-participants')
    .populate([
      {
        path: 'userId',
        select: 'buyer agency',
        populate: [
          { path: 'buyer', select: 'image firstName lastName' },
          { path: 'agency', select: 'image firstName lastName' },
        ],
      },
      {
        path: 'receiverId',
        select: 'buyer agency',
        populate: [
          { path: 'buyer', select: 'image firstName lastName' },
          { path: 'agency', select: 'image firstName lastName' },
        ],
      },
    ])
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
    const isUserSender = msg.userId?._id.toString() === id; // Check if logged-in user is the sender
    const receiver = isUserSender ? msg.receiverId : msg.userId; // Get the other party's data

    return {
      roomId: msg._id, // Room Collection ID (Room Name ID)
      receiverId: receiver?._id || null,
      image: (receiver?.agency?.image as any) || receiver?.buyer?.image || null,
      firstName:
        receiver?.agency?.firstName || receiver?.buyer?.firstName || '',
      lastName: receiver?.agency?.lastName || receiver?.buyer?.lastName || '',
      lastMessage: lastMessageMap.get(msg._id.toString()) || null, // Full last message document
    };
  });

  const count = await Room.countDocuments({
    $or: [{ userId: id }, { receiverId: id }],
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
