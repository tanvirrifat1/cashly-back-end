import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { buyerReqService } from './buyerReq.service';

const getOrderRequest = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await buyerReqService.getOrderRequest(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order retrived successfully',
    data: result,
  });
});

const getSingleOrderRequest = catchAsync(async (req, res) => {
  const result = await buyerReqService.getSingleOrderRequest(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single Order retrived successfully',
    data: result,
  });
});

export const buyerReqController = {
  getOrderRequest,
  getSingleOrderRequest,
};
