import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { Currency } from '../currency/currency.model';

const createReviewToDB = async (payload: Partial<IReview>) => {
  // Check if the review already exists
  const isExist = await Review.findOne({
    currency: payload.currency,
    user: payload.user,
  });

  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Review already exists');
  }
  const isCurrencyExist = await Currency.findById(payload.currency);
  if (!isCurrencyExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Currency not found');
  }

  const result = await Review.create(payload);

  if (!result) {
    return 'Review not created!';
  }

  const reviews = await Review.find({ currency: payload.currency });

  const totalRatings = reviews.reduce(
    (sum, review) => sum + (review.rating || 0),
    0
  );
  const reviewCount = reviews.length;
  //   const averageRating = totalRatings / reviewCount;
  const averageRating = Math.round(totalRatings / reviewCount);

  await Currency.updateOne(
    { _id: payload.currency },
    {
      $set: {
        rating: averageRating,
        count: reviewCount,
      },
    }
  );

  return result;
};

export const reviewService = {
  createReviewToDB,
};
