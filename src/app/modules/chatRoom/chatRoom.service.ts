import { Room } from './chatRoom.model';

const getAllInboxs = async (id: string, query: Record<string, unknown>) => {
  const { page, limit } = query;

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch messages
  const messages = await Room.find({
    userId: id,
  })
    .select('-userId -participants')
    .populate({
      path: 'receiverId',
      select: 'buyer agency',
      populate: {
        path: 'buyer agency',
        select: 'image firstName lastName',
      },
    })

    .skip(skip)
    .limit(size)
    .lean();

  const count = await Room.countDocuments({
    userId: id,
  });

  return {
    result: messages,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const ChatRoomService = {
  getAllInboxs,
};
