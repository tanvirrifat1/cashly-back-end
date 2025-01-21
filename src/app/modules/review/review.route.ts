import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { reviewController } from './review.controller';
import validateRequest from '../../middlewares/validateRequest';
import ReviewSchemaValidation from './review.validation';

const router = express.Router();

router.post(
  '/send-review',
  auth(USER_ROLES.BUYER),
  validateRequest(ReviewSchemaValidation),
  reviewController.createReview
);

export const ReviewRoutes = router;
