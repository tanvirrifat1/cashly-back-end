import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MessageService } from './message.service';
import { getRecieverSocketId } from '../../../helpers/socketHelper';
import { Message } from './message.model';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { Room } from '../chatRoom/chatRoom.model';
import { Agency } from '../agency/agency.model';
import { Buyer } from '../buyer/buyer.model';

const sendMesg = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  const { id: receiverId } = req.params as { id: string };
  const senderId = req.user.id as string;

  const isUser = await User.findById(receiverId);
  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  let room = await Room.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!room) {
    room = await Room.create({
      participants: [senderId, receiverId],
      userId: senderId,
      receiverId: receiverId,
      unreadCount: 1,
    });
  } else {
    // await Room.updateOne({ _id: room._id }, { $inc: { unreadCount: 1 } });
  }

  const value = {
    roomId: room._id,
    text: `create a new message`,
  };

  // const newMessage = await Message.create({
  //   roomId: room._id,
  //   senderId,
  //   receiverId,
  //   message,
  // });

  const receiverSocketId = getRecieverSocketId(receiverId);
  if (receiverSocketId) {
    //@ts-ignore
    global.io.to(receiverSocketId).emit('newMessage', newMessage);
  }

  const user = await User.findById(receiverId);

  const isAgency = await Agency.findById(user?.agency);

  const isBuyer = await Buyer.findById(user?.buyer);

  const data = {
    text: `You have a new message from ${
      isAgency?.firstName || isBuyer?.firstName
    } ${isAgency?.lastName || isBuyer?.lastName}`,
    receiver: receiverId,
  };
  await sendNotifications(data);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Message sent successfully',
    data: value,
  });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getAllMessages(req.params.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Messages retrived successfully',
    data: result,
  });
});

export const MessageController = {
  sendMesg,
  getAllMessages,
};
