import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SubscriptionController } from './subscription.controller';
import validateRequest from '../../middlewares/validateRequest';
import { zodSubscriptionSchema } from './subscriptation.validation';

const router = Router();

router.post(
  '/create',
  auth(USER_ROLES.BUYER, USER_ROLES.AGENCY),
  validateRequest(zodSubscriptionSchema),
  SubscriptionController.createSusbcription
);

router.post(
  '/update-expired',
  SubscriptionController.updateExpiredSubscriptions
);

export const SubscriptionRoutes = router;
