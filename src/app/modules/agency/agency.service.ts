import { StatusCodes } from 'http-status-codes';
import { IAgency } from './agency.interface';
import { Agency } from './agency.model';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { Buyer } from '../buyer/buyer.model';
import { User } from '../user/user.model';

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

export const AgencyService = {
  updateAgencyProfile,
  findUsersNearLocation,
};
