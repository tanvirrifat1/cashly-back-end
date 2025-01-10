import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { SubAccountService } from './subAccount.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createSubuser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await SubAccountService.createSubUserToDB(userId, value);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sub User created Successfully',
    data: result,
  });
});

const getSubuser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await SubAccountService.getSubUser(userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sub User retrieved Successfully',
    data: result,
  });
});

const getAllSubUserForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SubAccountService.getAllSubUserForAdmin(req.query);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Sub User retrieved for admin Successfully',
      data: result,
    });
  }
);

const updateSubuser = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await SubAccountService.updateUserToDB(req.params.id, value);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sub-User updated Successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await SubAccountService.deleteSubUser(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Sub-User deleted Successfully',
    data: result,
  });
});

export const SubAccountController = {
  createSubuser,
  getSubuser,
  getAllSubUserForAdmin,
  updateSubuser,
  deleteUser,
};
