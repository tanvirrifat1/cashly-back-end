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

router.get(
  '/get-all-order',
  auth(USER_ROLES.BUYER),
  orderCurrencyController.getAllOrder
);

router.get(
  '/get-single-order/:id',
  auth(USER_ROLES.BUYER),
  orderCurrencyController.getSingleOrder
);

router.post(
  '/updated/:id',
  auth(USER_ROLES.BUYER),
  orderCurrencyController.updateOrderStatus
);

export const OrderRoutes = router;
