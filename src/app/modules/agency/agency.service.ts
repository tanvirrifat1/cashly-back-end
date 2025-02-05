import { StatusCodes } from 'http-status-codes';
import { IAgency } from './agency.interface';
import { Agency } from './agency.model';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import { Currency } from '../currency/currency.model';

const updateAgencyProfile = async (userId: string, value: IAgency) => {
  const isUser = await User.findById(userId);

  const isExist = await Agency.findById(isUser?.agency);

  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (value.image && isExist.image) {
    unlinkFile(isExist.image);
  }

  const result = await Agency.findByIdAndUpdate(isExist?._id, value, {
    new: true,
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return result;
};

const findUsersNearLocation = async (
  longitude: number,
  latitude: number,
  maxDistanceInMeters = 5000
) => {
  try {
    const agency = await Agency.find({
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

    return agency;
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error finding users near location'
    );
  }
};

const getAllAgencies = async (query: Record<string, unknown>) => {
  const { page, limit, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];
  anyConditions.push({ role: USER_ROLES.AGENCY });
  // Add searchTerm condition if present
  if (searchTerm) {
    const categoriesIds = await Agency.find({
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
    .populate('agency')
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
// const getAllAgenciesBest = async (query: Record<string, unknown>) => {
//   const { page, limit } = query;
//   const pages = parseInt(page as string) || 1;
//   const size = parseInt(limit as string) || 10;
//   const skip = (pages - 1) * size;

//   // Fetch agencies
//   const result = await User.find({ role: USER_ROLES.AGENCY })
//     .populate('agency')
//     .sort({ createdAt: -1 }) // Sort initially by creation date
//     .lean();

//   // Sort manually by rating (descending)
//   const sortedAgencies = result?.sort((a: any, b: any) => {
//     const ratingA = a.agency?.rating || 0;
//     const ratingB = b.agency?.rating || 0;
//     return ratingB - ratingA;
//   });

//   // Paginate after sorting
//   const paginatedAgencies = sortedAgencies.slice(skip, skip + size);

//   const count = await User.countDocuments({ role: USER_ROLES.AGENCY });

//   return {
//     result: paginatedAgencies,
//     meta: {
//       page: pages,
//       total: count,
//     },
//   };
// };

const getAllAgenciesBest = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch agencies
  const result = await Currency.find()
    .populate({
      path: 'userId',
      select: 'agency',
      populate: {
        path: 'agency',
      },
    })
    .sort({ createdAt: -1 }) // Sort initially by creation date
    .lean();

  // Sort manually by rating (descending)
  const sortedAgencies = result?.sort((a: any, b: any) => {
    const ratingA = a.userId?.agency?.rating ?? 0; // Ensure proper access
    const ratingB = b.userId?.agency?.rating ?? 0;

    return ratingB - ratingA;
  });

  // Paginate after sorting
  const paginatedAgencies = sortedAgencies.slice(skip, skip + size);

  const count = await Currency.countDocuments();

  return {
    result: paginatedAgencies,
    meta: {
      page: pages,
      total: count,
    },
  };
};

export const AgencyService = {
  updateAgencyProfile,
  findUsersNearLocation,
  getAllAgencies,
  getAllAgenciesBest,
};
