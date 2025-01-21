import { Router } from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SubscriptionController } from './subscription.controller';

const router = Router();

router.post(
  '/check-out',
  auth(USER_ROLES.AGENCY),
  SubscriptionController.createCheckoutSessionController
);

export const SubscriptionRoutessss = router;
