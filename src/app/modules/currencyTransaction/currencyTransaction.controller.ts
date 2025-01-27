import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { currencyTransactionService } from './currencyTransaction.service';

const getAllCurrencyTransactions = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await currencyTransactionService.getAllCurrencyTransactions(
    userId
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Currency transactions retrived successfully',
    data: result,
  });
});

const getTransaction = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await currencyTransactionService.getTransaction(
    userId,
    req.query
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Currency transactions retrived successfully',
    data: result,
  });
});

export const currencyTransactionController = {
  getAllCurrencyTransactions,
  getTransaction,
};
