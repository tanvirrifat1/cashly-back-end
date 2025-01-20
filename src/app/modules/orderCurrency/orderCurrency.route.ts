import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { orderCurrencyController } from './orderCurrency.controller';

const router = express.Router();

router.post(
  '/create-order-currency',
  auth(USER_ROLES.BUYER),
  orderCurrencyController.createOrderCurrency
);

export const OrderRoutes = router;
