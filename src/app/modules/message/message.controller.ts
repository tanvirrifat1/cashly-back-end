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

const sendMesg = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;

  const { id: receiverId } = req.params as { id: string }; // Receiver's ID from route params
  const senderId = req.user.id as string; // Sender's ID from authenticated user

  const isUser = await User.findById(receiverId);

  if (!isUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  //@ts-ignore
  const socketIo = global.io; // Assuming Socket.IO is initialized globally

  // Step 1: Create and Save the Message
  const newMessage = await Message.create({
    senderId: new Types.ObjectId(senderId),
    receiverId: new Types.ObjectId(receiverId),
    message,
  });

  // Step 2: Send the Message via Socket.IO
  const receiverSocketId = getRecieverSocketId(receiverId);

  if (receiverSocketId) {
    //@ts-ignore
    socketIo.to(receiverSocketId).emit('newMessage', newMessage);
  }

  const value = {
    text: `You have a new message`,
    receiver: receiverId,
  };

  if (receiverId) {
    sendNotifications(value);
  }

  //@ts-ignore
  socketIo.emit('newMessage', newMessage);

  // Step 3: Send Response Back to Client
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Message sent successfully',
    data: newMessage,
  });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await MessageService.getAllMessages(userId, req.query);
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
