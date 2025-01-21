import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { CurrencyTransaction } from './currencyTransaction.model';
import { Types } from 'mongoose';

const getAllCurrencyTransactions = async (userId: string) => {
  const isAgency = await User.findOne({ _id: userId });

  if (!isAgency) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  const result = await CurrencyTransaction.aggregate([
    { $match: { agencyId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$currency',
        totalAmount: { $sum: '$amount' },
      },
    },
    { $project: { _id: 0, currency: '$_id', totalAmount: 1 } },
  ]);

  return result;
};

export const currencyTransactionService = {
  getAllCurrencyTransactions,
};
