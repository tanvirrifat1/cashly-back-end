import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SettingService } from './setting.service';
import { StatusCodes } from 'http-status-codes';

const createTermsAndCondition = catchAsync(async (req, res) => {
  const result = await SettingService.createTermsAndCondition(req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms-and-condition updated successfully',
    data: result,
  });
});

const getTermsAndCondition = catchAsync(async (req, res) => {
  const result = await SettingService.getTermsAndCondition();
  res.status(StatusCodes.OK).json({
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms-and-condition retrived successfully',
    data: result,
  });
});

const createReturnPolicy = catchAsync(async (req, res) => {
  const result = await SettingService.createReturnPolicy(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy updated successfully',
    data: result,
  });
});

const getReturnPolicy = catchAsync(async (req, res) => {
  const result = await SettingService.getReturnPolicy();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy retrived successfully',
    data: result,
  });
});

export const SettingController = {
  createTermsAndCondition,
  createReturnPolicy,
  getTermsAndCondition,
  getReturnPolicy,
};
