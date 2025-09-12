import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { twilioClient } from '../../../shared/mesg.send';
import { IUser } from '../user/user.interface';
import { sendEmail } from '../../../helpers/sendMail';

const getAllBuyer = async (query: Record<string, unknown>) => {
  const { page, limit } = query;

  // Apply filter conditions

  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Set default sort order to show new data first

  const result = await User.find({
    role: USER_ROLES.BUYER,
    loginStatus: 'pending',
  })

    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();
  const total = await User.countDocuments({
    role: USER_ROLES.BUYER,
    loginStatus: 'pending',
  });

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

const getAllAgency = async (query: Record<string, unknown>) => {
  const { page, limit } = query;

  // Apply filter conditions

  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Set default sort order to show new data first

  const result = await User.find({
    role: USER_ROLES.AGENCY,
    loginStatus: 'pending',
  })

    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();
  const total = await User.countDocuments({
    role: USER_ROLES.AGENCY,
    loginStatus: 'pending',
  });

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

// const updateStatus = async (id: string, payload: IUser) => {
//   const isUser = await User.findById(id);
//   if (!isUser) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
//   }

//   const result = await User.findByIdAndUpdate(
//     id,
//     { loginStatus: payload.loginStatus },
//     { new: true }
//   );

//   if (result?.loginStatus === 'approved') {
//     await twilioClient.messages.create({
//       from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
//       contentSid: process.env.TWILIO_CONTACT_SID,
//       contentVariables: `{"1":"${'Your account has been approved'}","2":"5"}`,
//       to: `whatsapp:${result?.phone}`,
//     });
//   } else if (result?.loginStatus === 'cancel') {
//     await twilioClient.messages.create({
//       from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
//       contentSid: process.env.TWILIO_CONTACT_SID,
//       contentVariables: `{"1":"${'Your account has been rejected'}","2":"5"}`,
//       to: `whatsapp:${result?.phone}`,
//     });
//   }

//   return result;
// };

const updateStatus = async (id: string, payload: IUser) => {
  const isUser = await User.findById(id);
  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { loginStatus: payload.loginStatus },
    { new: true }
  );

  if (result?.loginStatus === 'approved') {
    sendEmail(
      result.email,
      'Your Account Has Been Approved 🎉',
      'Congratulations! Your account has been approved. You can now log in and start using our services.'
    ).catch(err => console.error('Email failed:', err));
  } else if (result?.loginStatus === 'cancel') {
    sendEmail(
      result.email,
      'Your Account Application Was Rejected ❌',
      'We’re sorry to inform you that your account application has been rejected. If you believe this was a mistake, please contact support.'
    ).catch(err => console.error('Email failed:', err));
  }

  return result;
};

export const PermissionService = {
  getAllBuyer,
  getAllAgency,
  updateStatus,
};

// await twilioClient.messages.create({
//   body: `Your account has been rejected`,
//   from: process.env.TWILIO_PHONE_NUMBER,
//   to: result?.phone || '',
// });
