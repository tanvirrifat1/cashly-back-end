import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import unlinkFile from '../../../shared/unlinkFile';

const createSubUserToDB = async (
  userId: string,
  payload: IUser
): Promise<IUser> => {
  payload.role = USER_ROLES.SUB_USER;
  payload.loginStatus = 'approved';

  const value = {
    ...payload,
    agencis: userId,
  };

  const createSubUser: any = await User.create(value);

  if (!createSubUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Sub User');
  }

  if (createSubUser) {
    // Set verified to true after admin creation
    await User.findByIdAndUpdate(
      { _id: createSubUser._id },
      { verified: true },
      { new: true }
    );
  }

  return createSubUser;
};

const getSubUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency not found');
  }

  const result = await User.find({ agencis: userId }).select(
    '-createdAt -updatedAt -suspensionEndDate -isSuspended -verified -status -loginStatus'
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sub User not found');
  }

  return result;
};

const getAllSubUserForAdmin = async (query: Record<string, unknown>) => {
  const { page, limit } = query;

  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await User.find({ role: USER_ROLES.SUB_USER })
    .populate({
      path: 'agencis',
      select: 'agency',
      populate: {
        path: 'agency',
      },
    })

    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();
  const total = await User.countDocuments({ role: USER_ROLES.SUB_USER });

  const data: any = {
    result,
    meta: {
      page: pages,
      limit: size,
      total,
    },
  };
  return data;
};

const updateUserToDB = async (id: string, payload: IUser) => {
  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  if (payload.image && isUserExist.image) {
    unlinkFile(isUserExist.image);
  }

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

const deleteSubUser = async (id: string) => {
  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  if (isUserExist.image) {
    unlinkFile(isUserExist.image);
  }

  const result = await User.findByIdAndDelete(id);
  return result;
};

export const SubAccountService = {
  createSubUserToDB,
  getSubUser,
  getAllSubUserForAdmin,
  updateUserToDB,
  deleteSubUser,
};
