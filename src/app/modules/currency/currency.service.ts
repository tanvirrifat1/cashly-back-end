import { User } from './../user/user.model';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICurrency } from './currency.interface';
import { Currency } from './currency.model';

const addToCurrency = async (userId: string, data: ICurrency) => {
  const isUser = await User.findById({ _id: userId });

  if (isUser?.loginStatus !== 'approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot add currency you are not approved!'
    );
  }

  const isExist = await Currency.findOne({
    currency: data.currency,
    userId: userId,
  });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Currency already exist!');
  }

  const value = {
    ...data,
    userId,
  };

  const result = await Currency.create(value);
  return result;
};

const getAllCurrency = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { page, limit, currency, amount, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];

  // Add searchTerm condition if present
  anyConditions.push({ userId });

  if (currency) {
    anyConditions.push({ currency });
  }

  if (amount) {
    anyConditions.push({ amount });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // anyConditions.push({ verified: true });

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch campaigns
  const result = await Currency.find(whereConditions)
    .populate({
      path: 'userId',
      select: 'agency -_id',
      populate: {
        path: 'agency',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Currency.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};
export const currencyService = {
  addToCurrency,
  getAllCurrency,
};
