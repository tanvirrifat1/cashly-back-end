import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { buyerReqController } from './buyerReq.controller';

const router = express.Router();

router.get(
  '/get-all-req',
  auth(USER_ROLES.AGENCY),
  buyerReqController.getOrderRequest
);

export const BuyerReqForAgencyRoutes = router;
