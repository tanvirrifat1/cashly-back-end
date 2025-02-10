import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PermissionService } from './permission.service';

const getAllBuyer = catchAsync(async (req, res) => {
  const result = await PermissionService.getAllBuyer(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Buyer retrived successfully',
    data: result,
  });
});

const getAllAgency = catchAsync(async (req, res) => {
  const result = await PermissionService.getAllAgency(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agency retrived successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const result = await PermissionService.updateStatus(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User login status updated successfully',
    data: result,
  });
});

export const PermissionController = {
  getAllBuyer,
  getAllAgency,
  updateStatus,
};
