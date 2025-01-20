import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IOrderCurrency } from './orderCurrency.interface';
import { Order } from './orderCurrency.model';
import { User } from '../user/user.model';
import { Currency } from '../currency/currency.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { BuyerReqForAgency } from '../buyerReqForAgency/buyerReq.model';

const orderCurrency = async (data: IOrderCurrency) => {
  const isExistUser = await User.findOne({ _id: data.user });

  if (isExistUser?.loginStatus === 'pending') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are not approved, You cannot order!'
    );
  }

  const isUserExist = await User.findOne({ _id: data.user });
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found!');
  }

  const isCurrencyExist = await Currency.findOne({
    _id: data.currency,
  }).populate('userId');
  if (!isCurrencyExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Currency not found!');
  }

  const isOrder = await Order.findOne({
    user: data.user,
    currency: data.currency,
  });

  if (isOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order already exist!');
  }

  const result = await Order.create(data);

  const createReqForAgency = await BuyerReqForAgency.create({
    buyerId: data.user,
    agencyId: isCurrencyExist.userId._id,
    orderId: result._id,
    status: result.status,
  });

  if (!createReqForAgency) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not created!');
  }

  const value = {
    text: 'You have a new order request',
    receiver: isCurrencyExist.userId._id,
  };

  if (result?.status === 'pending') {
    sendNotifications(value);
  }

  return result;
};

export const orderCurrencyService = {
  orderCurrency,
};
