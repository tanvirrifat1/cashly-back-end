import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { ISubscription } from './subscription.interface';
import { Subscriptation } from './subscription.model';

const createSubscription = async (userId: string, data: ISubscription) => {
  const isUser = await User.findById(userId);

  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found!');
  }

  if (isUser?.loginStatus !== 'approved') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot add a subscription because you are not approved!'
    );
  }

  const result = await Subscriptation.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true }
  );

  const isSubcribed = await User.findByIdAndUpdate(
    userId,
    { $set: { subscription: true } },
    { new: true }
  );

  if (!isSubcribed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You cannot add a subscription because you are not subscribed!'
    );
  }

  return result;
};

export const SubscriptationService = {
  createSubscription,
};
