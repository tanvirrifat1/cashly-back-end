import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { currencyService } from './currency.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addToCurrency = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await currencyService.addToCurrency(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Currency Created successfully',
    data: result,
  });
});

export const currencyController = {
  addToCurrency,
};
