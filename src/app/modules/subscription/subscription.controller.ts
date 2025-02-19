import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptationService } from './subscription.service';

const createSusbcription = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await SubscriptationService.createSubscription(
    userId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscription created successfully',
    data: result,
  });
});

export const SubscriptionController = {
  createSusbcription,
};
