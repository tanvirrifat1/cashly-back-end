import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';

// const suspendUser = async (userId: string, days: number) => {
//   const suspensionEndDate = new Date();
//   suspensionEndDate.setDate(suspensionEndDate.getDate() + days);

//   const isUser = await User.findById(userId);

//   if (!isUser) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
//   }

//   const user = await User.findByIdAndUpdate(
//     userId,
//     { isSuspended: true, suspensionEndDate },
//     { new: true }
//   );

//   if (!user) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
//   }

//   const value = {
//     receiver: userId,
//     text: `Your account has been suspended for ${days} days.`,
//   };

//   if (user) {
//     sendNotifications(value);
//   }

//   return user;
// };

const suspendUser = async (userId: string, days: number) => {
  const suspensionEndDate = new Date();
  suspensionEndDate.setDate(suspensionEndDate.getDate() + days);

  const isUser = await User.findById(userId);

  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Suspend the agency
  const agency = await User.findByIdAndUpdate(
    userId,
    { isSuspended: true, suspensionEndDate },
    { new: true }
  );

  if (!agency) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to suspend agency');
  }

  // Find sub-users associated with the agency
  const subUsers = await User.find({ agencis: isUser._id });

  // Suspend all sub-users
  const suspendedSubUsers = await Promise.all(
    subUsers.map(subUser =>
      User.findByIdAndUpdate(
        subUser._id,
        { isSuspended: true, suspensionEndDate },
        { new: true }
      )
    )
  );

  // Notify the agency
  sendNotifications({
    receiver: userId,
    text: `Your account has been suspended for ${days} days.`,
  });

  // Notify sub-users
  suspendedSubUsers.forEach(subUser => {
    if (subUser) {
      sendNotifications({
        receiver: subUser._id,
        text: `Your account has been suspended because the agency has been suspended for ${days} days.`,
      });
    }
  });

  return { agency, suspendedSubUsers };
};

// const reactivateUsers = async () => {
//   const now = new Date();
//   const users = await User.updateMany(
//     { isSuspended: true, suspensionEndDate: { $lte: now } },
//     { isSuspended: false, suspensionEndDate: null }
//   );

//   if (users.matchedCount === 0) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'No suspended users found');
//   }

//   return users;
// };

const reactivateUsers = async (userId: string) => {
  const now = new Date();

  // Find and reactivate the agency
  const agency = await User.findByIdAndUpdate(
    userId,
    { isSuspended: false, suspensionEndDate: null },
    { new: true }
  );

  if (!agency) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Agency not found');
  }

  // Find sub-users associated with the agency
  const subUsers = await User.find({ agencis: agency._id, isSuspended: true });

  // Reactivate all sub-users
  const reactivatedSubUsers = await Promise.all(
    subUsers.map(subUser =>
      User.findByIdAndUpdate(
        subUser._id,
        { isSuspended: false, suspensionEndDate: null },
        { new: true }
      )
    )
  );

  // Return reactivated agency and its sub-users
  return { agency, reactivatedSubUsers };
};

const getUserStatus = async (userId: string) => {
  const user = await User.findById(userId).populate('driver client');

  if (!user) {
    throw new Error('User not found');
  }

  return {
    isSuspended: user.isSuspended,
    suspensionEndDate: user.suspensionEndDate,
    user,
  };
};

const getAllSuspendedUsers = async () => {
  const users = await User.find({ isSuspended: true }).populate(
    'driver client'
  );

  if (users.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No suspended users found');
  }

  return users;
};

// const ActiveUser = async (userId: string) => {
//   const user = await User.findByIdAndUpdate(
//     userId,
//     { isSuspended: false, suspensionEndDate: null },
//     { new: true }
//   );

//   if (!user) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
//   }

//   const value = {
//     receiver: userId,
//     text: `Your account has been reactivated.`,
//   };

//   if (user) {
//     sendNotifications(value);
//   }

//   return user;
// };

const ActiveUser = async (userId: string) => {
  // Reactivate the agency user
  const user = await User.findByIdAndUpdate(
    userId,
    { isSuspended: false, suspensionEndDate: null },
    { new: true }
  );

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Find sub-users associated with this user (agency)
  const subUsers = await User.find({ agencis: user._id, isSuspended: true });

  // Reactivate all sub-users
  const reactivatedSubUsers = await Promise.all(
    subUsers.map(subUser =>
      User.findByIdAndUpdate(
        subUser._id,
        { isSuspended: false, suspensionEndDate: null },
        { new: true }
      )
    )
  );

  // Notify the reactivated agency
  const agencyNotification = {
    receiver: userId,
    text: `Your account has been reactivated.`,
  };
  sendNotifications(agencyNotification);

  // Notify all reactivated sub-users
  reactivatedSubUsers.forEach(subUser => {
    if (subUser) {
      const subUserNotification = {
        receiver: subUser._id,
        text: `Your account has been reactivated because the agency has been reactivated.`,
      };
      sendNotifications(subUserNotification);
    }
  });

  return { user, reactivatedSubUsers };
};

export const UserSuspentionService = {
  suspendUser,
  reactivateUsers,
  getUserStatus,
  ActiveUser,
  getAllSuspendedUsers,
};
