import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getFilePathMultiple } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { BuyerService } from './buyer.service';
import { Request, Response } from 'express';
import ApiError from '../../../errors/ApiError';
import { AgencyService } from '../agency/agency.service';

const updateBuyerProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await BuyerService.updateBuyerProfile(userId, value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const getAllBuyer = catchAsync(async (req: Request, res: Response) => {
  const { longitude, latitude, maxDistanceInMeters } = req.query;

  if (!longitude || !latitude) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Longitude and latitude are required'
    );
  }

  const parsedLongitude = parseFloat(longitude as string);
  const parsedLatitude = parseFloat(latitude as string);
  const parsedMaxDistance = maxDistanceInMeters
    ? parseInt(maxDistanceInMeters as string, 10)
    : 5000;

  if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid longitude or latitude'
    );
  }

  const result = await BuyerService.findUsersNearLocation(
    parsedLongitude,
    parsedLatitude,
    parsedMaxDistance
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Buyers retrieved successfully',
    data: result,
  });
});

export const BuyerController = {
  updateBuyerProfile,
  getAllBuyer,
};
