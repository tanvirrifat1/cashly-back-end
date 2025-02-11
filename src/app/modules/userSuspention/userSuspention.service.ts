import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { twilioClient } from '../../../shared/mesg.send';

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
  // sendNotifications({
  //   receiver: userId,
  //   text: `Your account has been suspended for ${days} days.`,
  // });

  // if (agency?.loginStatus === 'approved') {
  //   await twilioClient.messages.create({
  //     body: `Your account has been suspended for ${days} days.`,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: agency?.phone || '',
  //   });
  // }

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

const reactivateUsers = async () => {
  const now = new Date();

  // Reactivate agencies whose suspension has expired
  const agencies = await User.find({
    isSuspended: true,
    suspensionEndDate: { $lte: now },
  });

  if (agencies.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No suspended agencies found');
  }

  // Reactivate each agency and its sub-users
  for (const agency of agencies) {
    // Reactivate the agency
    await User.findByIdAndUpdate(
      agency._id,
      { isSuspended: false, suspensionEndDate: null },
      { new: true }
    );

    const subUsers = await User.find({
      agencis: agency._id,
    });

    // Reactivate each sub-user
    await Promise.all(
      subUsers.map(subUser =>
        User.findByIdAndUpdate(
          subUser._id,
          { isSuspended: false, suspensionEndDate: null },
          { new: true }
        )
      )
    );
  }

  // if (agencies[0].loginStatus === 'approved') {
  //   await twilioClient.messages.create({
  //     body: `Your account has been reactivated.`,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: agencies[0].phone || '',
  //   });
  // }

  return { message: 'Agencies and sub-users reactivated successfully.' };
};

const getUserStatus = async (userId: string) => {
  const user = await User.findById(userId).populate('agency buyer');

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
  const users = await User.find({ isSuspended: true }).populate('agency buyer');

  // if (users.length === 0) {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'No suspended users found');
  // }

  return users;
};

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

  // if (user?.loginStatus === 'approved') {
  //   await twilioClient.messages.create({
  //     body: `Your account has been reactivated.`,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: user.phone,
  //   });
  // }

  return { user, reactivatedSubUsers };
};

export const UserSuspentionService = {
  suspendUser,
  reactivateUsers,
  getUserStatus,
  ActiveUser,
  getAllSuspendedUsers,
};
