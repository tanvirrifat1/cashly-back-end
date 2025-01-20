import { populate } from 'dotenv';
import { BuyerReqForAgency } from './buyerReq.model';

const getOrderRequest = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { page, limit, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];

  if (userId) {
    anyConditions.push({ agencyId: userId });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch campaigns
  const result = await BuyerReqForAgency.find(whereConditions)
    .populate({
      path: 'buyerId',
      select: 'buyer -_id',
      populate: {
        path: 'buyer',
      },
    })
    .populate({
      path: 'orderId',
      //   select: 'order -_id',
      populate: {
        path: 'currency',
        select: 'currency amount',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await BuyerReqForAgency.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const buyerReqService = {
  getOrderRequest,
};
