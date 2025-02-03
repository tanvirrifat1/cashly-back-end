import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { CurrencyTransaction } from './currencyTransaction.model';
import { Types } from 'mongoose';

const getAllCurrencyTransactions = async (userId: string) => {
  const isAgency = await User.findOne({ _id: userId });

  if (!isAgency) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  const result = await CurrencyTransaction.aggregate([
    { $match: { agencyId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$currency',
        totalAmount: { $sum: '$amount' },
      },
    },
    { $project: { _id: 0, currency: '$_id', totalAmount: 1 } },
  ]);

  return result;
};

const getTransaction = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { page, limit, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];

  if (userId) {
    anyConditions.push({ agencyId: userId });
  }

  if (searchTerm) {
    anyConditions.push({ status: { $regex: searchTerm, $options: 'i' } });
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
  const result = await CurrencyTransaction.find(whereConditions)
    .populate({
      path: 'agencyId',
      select: 'agency',
      populate: {
        path: 'agency',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await CurrencyTransaction.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const currencyTransactionService = {
  getAllCurrencyTransactions,
  getTransaction,
};
