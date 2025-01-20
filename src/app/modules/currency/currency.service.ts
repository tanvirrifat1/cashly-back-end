import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICurrency } from './currency.interface';
import { Currency } from './currency.model';

const addToCurrency = async (userId: string, data: ICurrency) => {
  const isExist = await Currency.findOne({
    currency: data.currency,
    userId: userId,
  });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Currency already exist!');
  }

  const value = {
    ...data,
    userId,
  };

  const result = await Currency.create(value);
  return result;
};

export const currencyService = {
  addToCurrency,
};
