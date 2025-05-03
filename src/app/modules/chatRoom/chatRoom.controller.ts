import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { Room } from './chatRoom.model';
import sendResponse from '../../../shared/sendResponse';
import { ChatRoomService } from './chatRoom.service';
import { StatusCodes } from 'http-status-codes';

const getOrCreateRoom = catchAsync(async (req: Request, res: Response) => {
  const { id: receiverId } = req.params;
  const senderId = req.user.id as string;

  let room = await Room.findOne({
    // participants: { $all: [senderId, receiverId] },
  }).populate({
    path: 'participants',
    select: 'agency buyer -_id ',
    populate: {
      path: 'buyer agency',
      select: 'image firstName lastName',
    },
  });

  //   if (!room) {
  //     room = await Room.create({ participants: [senderId, receiverId] });
  //   }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    data: room,
  });
});

const getAllInboxs = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.getAllInboxs(req.user.id, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Inbox retrived successfully',
    data: result,
  });
});

export const ChatRoomController = {
  getOrCreateRoom,
  getAllInboxs,
};
