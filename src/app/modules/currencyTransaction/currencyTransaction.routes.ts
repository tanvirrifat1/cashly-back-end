import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { currencyTransactionController } from './currencyTransaction.controller';

const router = express.Router();

router.get(
  '/get-all-transactions',
  auth(USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  currencyTransactionController.getAllCurrencyTransactions
);

router.get(
  '/get-transactions',
  auth(USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  currencyTransactionController.getTransaction
);

export const CurrencyTransactionRoutes = router;
