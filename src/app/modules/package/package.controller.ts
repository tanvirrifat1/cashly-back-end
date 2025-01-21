import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { packageService } from './package.service';

const createPlanToDB = catchAsync(async (req, res) => {
  const result = await packageService.createPackage(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package created successfully',
    data: result,
  });
});

const getAllPackage = catchAsync(async (req, res) => {
  const result = await packageService.getAllPackage();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package retrived successfully',
    data: result,
  });
});

const updatePackage = catchAsync(async (req, res) => {
  const result = await packageService.updatePackage(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package updated successfully',
    data: result,
  });
});

const deletePackage = catchAsync(async (req, res) => {
  const result = await packageService.deletePackage(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Package deleted successfully',
    data: result,
  });
});

const getSinglePackage = catchAsync(async (req, res) => {
  const result = await packageService.getPackageById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single-Package retrived successfully',
    data: result,
  });
});

export const packageController = {
  createPlanToDB,
  getAllPackage,
  updatePackage,
  deletePackage,
  getSinglePackage,
};
