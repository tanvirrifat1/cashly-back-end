import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { BuyerReqForAgency } from './buyerReq.model';
import { IBuyerReqForAgency } from './buyerReq.interface';
import { Order } from '../orderCurrency/orderCurrency.model';
import mongoose from 'mongoose';
import { sendNotifications } from '../../../helpers/notificationHelper';

const getOrderRequest = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const { page, limit, searchTerm, ...filterData } = query;
  const anyConditions: any[] = [];

  if (userId) {
    anyConditions.push({ agencyId: userId });
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
  const result = await BuyerReqForAgency.find(whereConditions)
    .populate({
      path: 'buyerId',
      select: 'buyer -_id time',
      populate: {
        path: 'buyer',
      },
    })
    .populate({
      path: 'orderId',
      //   select: 'order -_id',
      populate: {
        path: 'currency',
        select: 'currency amount',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await BuyerReqForAgency.countDocuments(whereConditions);

  return {
    result,
    meta: {
      page: pages,
      total: count,
    },
  };
};

const getSingleOrderRequest = async (id: string) => {
  const isExist = await BuyerReqForAgency.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order request not found');
  }

  const result = await BuyerReqForAgency.findById(id)
    .populate({
      path: 'buyerId',
      select: 'buyer -_id',
      populate: {
        path: 'buyer',
      },
    })
    .populate({
      path: 'currency',
      select: 'currency amount ',
    });
  return result;
};

const updateStatus = async (id: string, payload: IBuyerReqForAgency) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isExist = await BuyerReqForAgency.findById(id).session(session);
    if (!isExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order request not found');
    }

    const result = await BuyerReqForAgency.findByIdAndUpdate(
      id,
      { status: payload.status },
      { new: true, session }
    );

    if (!result) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to update BuyerReqForAgency status'
      );
    }

    const isOrder = await Order.findById(result.orderId).session(session);

    if (isOrder) {
      const updateOrderStatus = await Order.findByIdAndUpdate(
        isOrder._id,
        { status: payload.status },
        { new: true, session }
      );

      if (!updateOrderStatus) {
        throw new ApiError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to update Order status'
        );
      }
    }

    const value = {
      text: `Your order request has been ${payload.status}`,
      receiver: result.buyerId,
    };

    await sendNotifications(value);

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const buyerReqService = {
  getOrderRequest,
  getSingleOrderRequest,
  updateStatus,
};
