import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { currencyTransactionController } from './currencyTransaction.controller';

const router = express.Router();

router.get(
  '/get-all-transactions',
  auth(USER_ROLES.AGENCY),
  currencyTransactionController.getAllCurrencyTransactions
);

router.get(
  '/get-transactions',
  auth(USER_ROLES.AGENCY),
  currencyTransactionController.getTransaction
);

export const CurrencyTransactionRoutes = router;
