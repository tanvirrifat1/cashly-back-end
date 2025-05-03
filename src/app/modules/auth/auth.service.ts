import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelper } from '../../../helpers/jwtHelper';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { User } from '../user/user.model';
import { ResetToken } from '../resetToken/resetToken.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { twilioClient } from '../../../shared/mesg.send';
import { USER_ROLES } from '../../../enums/user';

const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;

  if (!password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required');
  }

  const isExistUser = await User.findOne({ email }).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Check if verified
  if (!isExistUser.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  // Check if account is deleted
  if (isExistUser.status === 'deleted') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content. It looks like your account has been deactivated.'
    );
  }

  // Check if account is suspended
  if (isExistUser.isSuspended === true) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Account is suspended, Please contact the admin'
    );
  }

  // Check password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  let agencyTokens = null;

  if (isExistUser.role === USER_ROLES.SUB_USER) {
    const agency = await User.findOne({ _id: isExistUser.agencis });

    if (!agency) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Associated agency not found'
      );
    }

    // Check if the agency's subscription is active
    if (!agency.subscription) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Your agency’s subscription is inactive. Please contact the agency admin.'
      );
    }

    // Generate tokens for the agency
    agencyTokens = {
      accessToken: jwtHelper.createToken(
        { id: agency._id, role: agency.role, email: agency.email },
        config.jwt.jwt_secret as Secret,
        '60d'
      ),
    };
  }

  // Generate tokens for SUB_USER or regular user
  const userTokens = {
    accessToken: jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      '60d'
    ),
  };

  // Remove sensitive data before sending response
  const user = isExistUser.toObject();

  return {
    userTokens, // SUB_USER's own token
    agencyTokens, // Agency's token (if SUB_USER)
    user,
  };
};

// const loginUserFromDB = async (payload: ILoginData) => {
//   const { email, password } = payload;

//   if (!password) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is required');
//   }

//   const isExistUser = await User.findOne({ email }).select('+password');
//   if (!isExistUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//   }

//   // Check verified and status
//   if (!isExistUser.verified) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Please verify your account, then try to login again'
//     );
//   }

//   // Check user status
//   if (isExistUser.status === 'deleted') {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'You don’t have permission to access this content. It looks like your account has been deactivated.'
//     );
//   }

//   if (isExistUser.role === USER_ROLES.SUB_USER) {
//     const agency = await User.findOne({ _id: isExistUser.agencis });
//     if (!agency) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Associated agency not found'
//       );
//     }

//     // Check if the agency's subscription is active
//     if (!agency.subscription === true) {
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         'Your agency’s subscription is inactive. Please contact the agency admin.'
//       );
//     }
//   }

//   // Check login status
//   if (isExistUser.isSuspended === true) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Account is suspended, Please contact the admin'
//     );
//   }

//   // Check match password
//   if (
//     password &&
//     !(await User.isMatchPassword(password, isExistUser.password))
//   ) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
//   }

//   // Create access token
//   const accessToken = jwtHelper.createToken(
//     { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
//     config.jwt.jwt_secret as Secret,
//     '30d'
//   );

//   // Create refresh token
//   const refreshToken = jwtHelper.createToken(
//     { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
//     config.jwt.jwtRefreshSecret as Secret,
//     '60d'
//   );

//   // Remove sensitive data before sending response
//   const user = isExistUser.toObject();

//   return { accessToken, refreshToken, user };
// };

const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const otp = generateOTP();
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 30 * 60000),
  };

  // Send OTP via Twilio
  if (isExistUser.phone) {
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number
      to: isExistUser.phone,
    });
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Phone number not found. OTP not sent via SMS.'
    );
  }

  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please provide the OTP. Check your phone; we sent a code.'
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided the wrong OTP.');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'OTP has expired. Please try again.'
    );
  }

  let message;
  let data;
  let accessToken;
  let refreshToken;

  if (!isExistUser.verified) {
    await User.findByIdAndUpdate(isExistUser._id, {
      verified: true,
      authentication: { oneTimeCode: null, expireAt: null },
    });

    message =
      'Your phone has been successfully verified. Your account is now fully activated.';
  } else {
    await User.findByIdAndUpdate(isExistUser._id, {
      authentication: {
        isResetPassword: true,
        oneTimeCode: null,
        expireAt: null,
      },
    });

    // Create reset token
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 30 * 60000), // 30 min expiry
    });

    message =
      'Verification Successful: Please securely store and use this code to reset your password.';
    data = createToken;
  }

  const user = isExistUser.toObject();

  // Generate JWT tokens
  accessToken = jwtHelper.createToken(
    { email: isExistUser.email, id: isExistUser._id, role: isExistUser.role },
    config.jwt.jwt_secret as Secret,
    '30d'
  );

  refreshToken = jwtHelper.createToken(
    { email: isExistUser.email, id: isExistUser._id, role: isExistUser.role },
    config.jwt.jwtRefreshSecret as Secret,
    '60d' // Adjust expiration as needed
  );

  return { message, data, accessToken, refreshToken, user };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });

  const value = {
    receiver: isExistUser._id,
    text: 'Your password changed successfully',
  };

  if (isExistUser) {
    sendNotifications(value);
  }
};

const deleteAccountToDB = async (user: JwtPayload) => {
  const result = await User.findByIdAndDelete(user?.id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No User found');
  }

  return result;
};

const newAccessTokenToUser = async (token: string) => {
  // Check if the token is provided
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is required!');
  }

  const verifyUser = jwtHelper.verifyToken(
    token,
    config.jwt.jwtRefreshSecret as Secret
  );

  const isExistUser = await User.findById(verifyUser?.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access');
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { accessToken };
};

// const resendVerificationEmailToDB = async (phone: string) => {
//   // Find the user by ID
//   const existingUser: any = await User.findOne({ phone: phone }).lean();

//   if (!existingUser) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       'User with this email does not exist!'
//     );
//   }

//   if (existingUser?.isVerified) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already verified!');
//   }

//   // Generate OTP
//   const otp = generateOTP();
//   const authentication = {
//     oneTimeCode: otp,
//     expireAt: new Date(Date.now() + 5 * 60000), // OTP valid for 3 minutes
//   };

//   const value = await twilioClient.messages.create({
//     body: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
//     from: process.env.TWILIO_PHONE_NUMBER,
//     to: existingUser.phone,
//   });

//   await User.findOneAndUpdate(
//     { phone: phone },
//     { $set: { authentication } },
//     { new: true }
//   );
// };

const resendVerificationEmailToDB = async (email: string) => {
  const existingUser: any = await User.findOne({ email: email }).lean();

  if (!existingUser) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'User with this phone number does not exist!'
    );
  }

  if (existingUser?.isVerified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already verified!');
  }

  // Generate OTP
  const otp = generateOTP();
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 30 * 60000), // OTP valid for 5 minutes
  };

  try {
    // Send OTP via WhatsApp using Twilio
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
      contentSid: process.env.TWILIO_CONTACT_SID,
      contentVariables: `{"1":"${otp}","2":"5"}`,
      to: `whatsapp:${existingUser.phone}`,
    });

    // Update the user with OTP and expiration time
    await User.findOneAndUpdate(
      { email: email },
      { $set: { authentication } },
      { new: true }
    );

    return 'OTP sent successfully';
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error sending OTP via WhatsApp.'
    );
  }
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  deleteAccountToDB,
  newAccessTokenToUser,
  resendVerificationEmailToDB,
};
