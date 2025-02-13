import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { startSession } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import unlinkFile from '../../../shared/unlinkFile';
import { twilioClient } from '../../../shared/mesg.send';
import { IAgency } from '../agency/agency.interface';
import { Agency } from '../agency/agency.model';
import { Buyer } from '../buyer/buyer.model';

const createAgencyToDB = async (payload: Partial<IUser & IAgency>) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Set role
    payload.role = USER_ROLES.AGENCY;

    const isEmail = await User.findOne({ email: payload.email });
    if (isEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist');
    }

    // Validate required fields
    if (!payload.email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide email');
    }
    if (!payload.phone) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please provide phone number'
      );
    }

    const userPayload = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      address: payload.address,
      email: payload.email,
      phone: payload.phone,
      location: payload.location,
    };

    // Create brand
    const [agency] = await Agency.create([userPayload], {
      session,
    });

    if (!agency) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Influencer'
      );
    }

    payload.agency = agency._id;

    const value = {
      email: payload.email,
      password: payload.password,
      role: USER_ROLES.AGENCY,
      agency: agency._id,
      phone: payload.phone,
    };

    // Create user
    const [user] = await User.create([value], { session });
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Generate OTP
    const otp = generateOTP();
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 30 * 60000), // OTP valid for 3 minutes
    };

    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone || payload.phone,
    });

    // await twilioClient.messages.create({
    //   from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
    //   contentSid: process.env.TWILIO_CONTACT_SID,
    //   contentVariables: `{"1":"${otp}","2":"5"}`,
    //   to: `whatsapp:${user.phone || payload.phone}`,
    // });

    // Update user with authentication details
    const updatedAuthenticationUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session, new: true }
    );

    if (!updatedAuthenticationUser) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'User not found for authentication update'
      );
    }

    // Commit transaction
    await session.commitTransaction();

    return updatedAuthenticationUser;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session ends regardless of success or failure
    await session.endSession();
  }
};

const createUserToDB = async (payload: Partial<IUser & IAgency>) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Set role
    payload.role = USER_ROLES.BUYER;

    const isEmail = await User.findOne({ email: payload.email });
    if (isEmail) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist');
    }

    // Validate required fields
    if (!payload.email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide email');
    }
    if (!payload.phone) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Please provide phone number'
      );
    }

    const userPayload = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      address: payload.address,
      email: payload.email,
      phone: payload.phone,
      location: payload.location,
    };

    // Create brand
    const [buyer] = await Buyer.create([userPayload], {
      session,
    });

    if (!buyer) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create buyer');
    }

    payload.buyer = buyer._id;

    const value = {
      email: payload.email,
      password: payload.password,
      role: USER_ROLES.BUYER,
      buyer: buyer._id,
      phone: payload.phone,
    };

    // Create user
    const [user] = await User.create([value], { session });
    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // Generate OTP
    const otp = generateOTP();
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 30 * 60000), // OTP valid for 3 minutes
    };

    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone || payload.phone,
    });

    // await twilioClient.messages.create({
    //   from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
    //   contentSid: process.env.TWILIO_CONTACT_SID,
    //   contentVariables: `{"1":"${otp}","2":"5"}`,
    //   to: `whatsapp:${user.phone || payload.phone}`,
    // });

    // Update user with authentication details
    const updatedAuthenticationUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { authentication } },
      { session, new: true }
    );

    if (!updatedAuthenticationUser) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'User not found for authentication update'
      );
    }

    // Commit transaction
    await session.commitTransaction();

    return updatedAuthenticationUser;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure session ends regardless of success or failure
    await session.endSession();
  }
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findById(id).populate('agency buyer');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const updateProfile = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateProfile;
};

const getSingleUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findById(id);
  return result;
};

//user suspend

export const UserService = {
  getUserProfileFromDB,
  createUserToDB,
  updateProfileToDB,
  getSingleUser,
  createAgencyToDB,
};
