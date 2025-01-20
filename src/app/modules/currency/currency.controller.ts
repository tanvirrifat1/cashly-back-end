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

const getAllCurrency = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await currencyService.getAllCurrency(userId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Currency retrived successfully',
    data: result,
  });
});

const getAllCurrencyForBuyer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await currencyService.getAllCurrencyForBuyer(req.query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Currency retrived for buyer successfully',
      data: result,
    });
  }
);

const CurrencyUpdate = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const value = {
    ...req.body,
    userId,
  };

  const result = await currencyService.updateCurrency(req.params.id, value);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Currency updated successfully',
    data: result,
  });
});

export const currencyController = {
  addToCurrency,
  getAllCurrency,
  getAllCurrencyForBuyer,
  CurrencyUpdate,
};
