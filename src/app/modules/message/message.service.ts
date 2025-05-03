import { Room } from '../chatRoom/chatRoom.model';
import { Message } from './message.model';
import { SortOrder } from 'mongoose';


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
