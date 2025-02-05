import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { twilioClient } from '../../../shared/mesg.send';
import { IUser } from '../user/user.interface';

const getAllBuyer = async () => {
  const result = await User.find({
    role: USER_ROLES.BUYER,
    loginStatus: 'pending',
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No buyer found!');
  }

  return result;
};
const getAllAgency = async () => {
  const result = await User.find({
    role: USER_ROLES.AGENCY,
    loginStatus: 'pending',
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No agency found!');
  }

  return result;
};

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
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
      contentSid: process.env.TWILIO_CONTACT_SID,
      contentVariables: `{"1":"${'Your account has been approved'}","2":"5"}`,
      to: `whatsapp:${result?.phone}`,
    });
  } else if (result?.loginStatus === 'cancel') {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATAPP_NUMBER}`,
      contentSid: process.env.TWILIO_CONTACT_SID,
      contentVariables: `{"1":"${'Your account has been rejected'}","2":"5"}`,
      to: `whatsapp:${result?.phone}`,
    });
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
