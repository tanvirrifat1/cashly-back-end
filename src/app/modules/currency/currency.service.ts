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

  if (isUser?.subscription !== true) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot add currency you are not subscribed!'
    );
  }

  const isExist = await Currency.findOne({
    currency: data.currency,
    amount: data.amount,
    userId: userId,
  });
  // if (isExist) {
  //   throw new ApiError(
  //     StatusCodes.BAD_REQUEST,
  //     'Currency and amount already exist!'
  //   );
  // }

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
const getAllCurrencyForBuyer = async (query: Record<string, unknown>) => {
  const { page, limit, currency, amount, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];

  // Filter by currency
  if (currency) {
    anyConditions.push({ currency });
  }

  // Filter by amount (gte the specified amount)
  if (amount) {
    anyConditions.push({ amount: { $gte: parseFloat(amount as string) } });
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

  // Fetch currencies with filtering and sorting
  const result = await Currency.find(whereConditions)
    .populate({
      path: 'userId',
      select: 'agency ',
      populate: {
        path: 'agency',
      },
    })
    .sort({ createdAt: -1 }) // Sort by createdAt first
    .lean();

  // Sort by agency rating
  const sortedAgencies = result.sort((a: any, b: any) => {
    const ratingA = a.userId?.agency?.rating ?? 0; // Ensure proper access
    const ratingB = b.userId?.agency?.rating ?? 0;

    return ratingB - ratingA; // Descending order (highest rating first)
  });

  // Paginate after sorting
  const paginatedAgencies = sortedAgencies.slice(skip, skip + size);

  // Count total documents matching the conditions
  const count = await Currency.countDocuments(whereConditions);

  return {
    result: paginatedAgencies,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const updateCurrency = async (id: string, data: ICurrency) => {
  const isUser = await User.findById({ _id: data.userId });

  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found!');
  }

  const isExist = await Currency.findOne({
    currency: data.currency,
    amount: data.amount,
    userId: data.userId,
  });

  // if (isExist) {
  //   throw new ApiError(
  //     StatusCodes.BAD_REQUEST,
  //     'Currency and amount already exist!'
  //   );
  // }

  const result = await Currency.findByIdAndUpdate(id, data, {
    new: true,
  });

  console.log(result);

  return result;
};

const deleteCurrency = async (id: string) => {
  const isExist = await Currency.findById(id);

  if (!isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Currency not found!');
  }

  const result = await Currency.findByIdAndDelete(id, { new: true });
  return result;
};

export const currencyService = {
  addToCurrency,
  getAllCurrency,
  getAllCurrencyForBuyer,
  updateCurrency,
  deleteCurrency,
};
