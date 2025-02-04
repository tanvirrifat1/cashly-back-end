import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DashboardService } from './dashboard.service';

const totalStatistics = catchAsync(async (req, res) => {
  const result = await DashboardService.totalStatistics();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Dashboard statistics retrived successfully',
    data: result,
  });
});

const getEarningChartData = catchAsync(async (req, res) => {
  const result = await DashboardService.getEarningChartData();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Dashboard earning chart retrived successfully',
    data: result,
  });
});

const getRecentUsers = catchAsync(async (req, res) => {
  const result = await DashboardService.getRecentUsers();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Recent users retrived successfully',
    data: result,
  });
});

export const DashboardController = {
  totalStatistics,
  getEarningChartData,
  getRecentUsers,
};
