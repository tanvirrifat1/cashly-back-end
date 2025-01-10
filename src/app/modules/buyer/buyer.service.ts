import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

import { Buyer } from './buyer.model';
import unlinkFile from '../../../shared/unlinkFile';
import { IBuyer } from './buyer.interface';
import { User } from '../user/user.model';

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

export const BuyerService = {
  updateBuyerProfile,
  findUsersNearLocation,
};
