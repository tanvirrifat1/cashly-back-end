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

export const orderCurrencyController = {
  createOrderCurrency,
};
