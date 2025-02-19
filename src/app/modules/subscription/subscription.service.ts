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

const updateExpiredSubscriptions = async () => {
  const currentDate = new Date();

  try {
    // Find all expired subscriptions
    const expiredSubscriptions = await Subscriptation.find({
      expiryDate: { $lt: currentDate },
    });

    if (!expiredSubscriptions.length) {
      return;
    }

    // Extract user IDs from expired subscriptions
    const expiredUserIds = expiredSubscriptions.map(sub => sub.userId);

    // Update all users' subscription status to false
    await User.updateMany(
      { _id: { $in: expiredUserIds } },
      { $set: { subscription: false } }
    );
  } catch (error) {
    console.error('Error updating expired subscriptions:', error);
  }
};

export const SubscriptationService = {
  createSubscription,
  updateExpiredSubscriptions,
};
