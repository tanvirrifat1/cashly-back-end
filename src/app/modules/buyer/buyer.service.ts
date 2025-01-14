import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

import { Buyer } from './buyer.model';
import unlinkFile from '../../../shared/unlinkFile';
import { IBuyer } from './buyer.interface';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';

const updateBuyerProfile = async (id: string, payload: IBuyer) => {
  const isUser = await User.findById(id);

  const isExistBuyer = await Buyer.findById(isUser?.buyer);

  if (!isExistBuyer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User doesn't exist!");
  }

  if (payload.image && isExistBuyer.image) {
    unlinkFile(isExistBuyer.image);
  }

  const result = await Buyer.findByIdAndUpdate(isExistBuyer?._id, payload, {
    new: true,
  });

  return result;
};

const findUsersNearLocation = async (
  longitude: number,
  latitude: number,
  maxDistanceInMeters = 5000
) => {
  try {
    const buyer = await Buyer.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistanceInMeters,
        },
      },
    });

    return buyer;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error finding users near location'
    );
  }
};

const getAllBuyers = async (query: Record<string, unknown>) => {
  const { page, limit, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];
  anyConditions.push({ role: USER_ROLES.BUYER });
  // Add searchTerm condition if present
  if (searchTerm) {
    const categoriesIds = await Buyer.find({
      firstName: { $regex: searchTerm, $options: 'i' },
    }).distinct('_id');

    if (categoriesIds.length > 0) {
      anyConditions.push({ client: { $in: categoriesIds } });
    }
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
  const result = await User.find(whereConditions)
    .populate('buyer')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await User.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const BuyerService = {
  updateBuyerProfile,
  findUsersNearLocation,
  getAllBuyers,
};
