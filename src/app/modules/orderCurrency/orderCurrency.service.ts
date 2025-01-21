import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IOrderCurrency } from './orderCurrency.interface';
import { Order } from './orderCurrency.model';
import { User } from '../user/user.model';
import { Currency } from '../currency/currency.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { BuyerReqForAgency } from '../buyerReqForAgency/buyerReq.model';
import mongoose from 'mongoose';
import { CurrencyTransaction } from '../currencyTransaction/currencyTransaction.model';

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
    time: data.time,
    currency: data.currency,
    location: data.location,
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

const getAllOrder = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];

  if (userId) {
    anyConditions.push({ user: userId });
  }

  if (searchTerm) {
    anyConditions.push({ status: { $regex: searchTerm, $options: 'i' } });
  }

  // Filter by additional filterData fields
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(
      ([field, value]) => ({ [field]: value })
    );
    anyConditions.push({ $and: filterConditions });
  }

  // Combine all conditions
  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch campaigns
  const result = await Order.find(whereConditions)
    .populate({
      path: 'currency',
      select: 'currency amount',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Order.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const getSingleOrder = async (orderId: string) => {
  const isOrderExist = await Order.findOne({ _id: orderId });
  if (!isOrderExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found!');
  }

  const result = await Order.findById(orderId).populate({
    path: 'currency',
    select: 'currency amount userId',
    populate: {
      path: 'userId',
      select: 'agency -_id',
      populate: {
        path: 'agency',
      },
    },
  });
  return result;
};

const updateOrderStatus = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invite = await Order.findById(id).session(session);
    if (!invite) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Order not found!');
    }

    // Update the order status to 'completed'
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: { status: 'completed' } },
      { new: true, session }
    );

    if (!updatedOrder) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to update the order!'
      );
    }

    // Check if there's an agency request associated with the order
    const isAgencyReq = await BuyerReqForAgency.findOne({
      orderId: id,
    }).session(session);

    if (isAgencyReq) {
      const updatedAgencyReq = await BuyerReqForAgency.findByIdAndUpdate(
        isAgencyReq._id,
        { $set: { status: 'completed' } },
        { new: true, session }
      );

      if (!updatedAgencyReq) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to update the agency request!'
        );
      }
    }

    const isCurrency = await Currency.findOne({
      _id: updatedOrder.currency,
    }).session(session);

    // Calculate transaction amount
    const transactionAmount = isCurrency?.amount;

    // Create a currency transaction
    const isCurrencyTransaction = await CurrencyTransaction.create({
      amount: transactionAmount,
      currency: isCurrency?.currency,
      buyerId: updatedOrder.user,
      agencyId: isCurrency?.userId,
    });

    if (!isCurrencyTransaction) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create currency transaction!'
      );
    }

    await session.commitTransaction();
    session.endSession();

    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export default updateOrderStatus;

export const orderCurrencyService = {
  orderCurrency,
  getAllOrder,
  getSingleOrder,
  updateOrderStatus,
};
