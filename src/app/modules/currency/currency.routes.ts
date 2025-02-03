import express from 'express';
import { currencyController } from './currency.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { currencyValidation } from './currency.validation';

const router = express.Router();

router.post(
  '/add',
  auth(USER_ROLES.AGENCY),
  validateRequest(currencyValidation.currencySchema),
  currencyController.addToCurrency
);

router.get('/get', auth(USER_ROLES.AGENCY), currencyController.getAllCurrency);

router.get(
  '/get-for-buyer',
  auth(USER_ROLES.AGENCY, USER_ROLES.BUYER),
  currencyController.getAllCurrencyForBuyer
);

router.patch(
  '/update/:id',
  auth(USER_ROLES.AGENCY),
  validateRequest(currencyValidation.CurrencyUpdate),
  currencyController.CurrencyUpdate
);

router.delete(
  '/delete/:id',
  // auth(USER_ROLES.AGENCY),
  currencyController.deleteCurrency
);

export const currencyRoutes = router;
