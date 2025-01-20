import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { orderCurrencyService } from './orderCurrency.service';

const createOrderCurrency = catchAsync(async (req, res) => {
  const user = req.user.id;

  const data = {
    ...req.body,
    user,
  };

  const result = await orderCurrencyService.orderCurrency(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order currency successfully',
    data: result,
  });
});

const getAllOrder = catchAsync(async (req, res) => {
  const user = req.user.id;

  const result = await orderCurrencyService.getAllOrder(user, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order retrived successfully',
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req, res) => {
  const result = await orderCurrencyService.getSingleOrder(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Signle Order retrived successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const result = await orderCurrencyService.updateOrderStatus(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Signle Order updated successfully',
    data: result,
  });
});

export const orderCurrencyController = {
  createOrderCurrency,
  getAllOrder,
  getSingleOrder,
  updateOrderStatus,
};
