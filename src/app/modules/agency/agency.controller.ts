import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { getFilePathMultiple } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { AgencyService } from './agency.service';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const updateAgencyProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await AgencyService.updateAgencyProfile(userId, value);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Agency profile updated successfully',
    data: result,
  });
});

const getAllAgency = catchAsync(async (req: Request, res: Response) => {
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

  const result = await AgencyService.findUsersNearLocation(
    parsedLongitude,
    parsedLatitude,
    parsedMaxDistance
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agency retrieved successfully',
    data: result,
  });
});

const getAllAgencies = catchAsync(async (req: Request, res: Response) => {
  const result = await AgencyService.getAllAgencies(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agencies retrieved successfully',
    data: result,
  });
});

const getAllAgenciesBest = catchAsync(async (req: Request, res: Response) => {
  const result = await AgencyService.getAllAgenciesBest(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Agencies retrieved successfully',
    data: result,
  });
});

export const AgencyController = {
  updateAgencyProfile,
  getAllAgency,
  getAllAgencies,
  getAllAgenciesBest,
};
