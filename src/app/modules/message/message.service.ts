import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Room } from '../chatRoom/chatRoom.model';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import { SortOrder } from 'mongoose';

// const getAllMessages = async (id: string, query: Record<string, unknown>) => {
//   const { page, limit } = query;

//   const pages = parseInt(page as string) || 1;
//   const size = parseInt(limit as string) || 10;
//   const skip = (pages - 1) * size;

//   const messages = await Message.find({ roomId: id })
//     // .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(size)
//     .lean();

//   const count = await Message.countDocuments({ roomId: id });

//   // Find the room to get sender and receiver details
//   const room = await Room.findById(id);
//   if (!room) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');
//   }

//   // Mark messages as read where the current user is the receiver
//   await Message.updateMany(
//     { roomId: id, receiverId: room.receiverId, unreadCount: 0 },
//     { read: true }
//   );

//   // Also mark the room as read
//   await Room.updateOne({ _id: id }, { unreadCount: 0 });

//   return {
//     result: messages,
//     meta: {
//       page: pages,
//       total: count,
//     },
//   };
// };

const getAllMessages = async (id: string, query: Record<string, unknown>) => {
  const {
    searchTerm,
    page,
    limit,
    sortBy = 'createdAt',
    order = 'desc',
    ...filterData
  } = query;

  const anyConditions: any[] = [{ roomId: id }];

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Apply filter conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const sortOrder: SortOrder = order === 'desc' ? -1 : 1;
  const sortCondition: { [key: string]: SortOrder } = {
    [sortBy as string]: sortOrder,
  };

  const result = await Message.find(whereConditions)
    .sort(sortCondition)
    .skip(skip)
    .limit(size);
  const count = await Message.countDocuments(whereConditions);

  await Room.updateOne({ _id: id }, { unreadCount: 0 });

  return {
    result,
    meta: {
      page: pages,
      limit: size,
      total: count,
      totalPages: Math.ceil(count / size),
      currentPage: pages,
    },
  };
};

export const MessageService = {
  getAllMessages,
};
