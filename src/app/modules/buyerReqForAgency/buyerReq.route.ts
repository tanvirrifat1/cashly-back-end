import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { buyerReqController } from './buyerReq.controller';

const router = express.Router();

router.get(
  '/get-all-req',
  auth(USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  buyerReqController.getOrderRequest
);

router.get(
  '/get-single-req/:id',
  auth(USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  buyerReqController.getSingleOrderRequest
);

router.patch(
  '/status/:id',
  auth(USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  buyerReqController.updateStatus
);

export const BuyerReqForAgencyRoutes = router;
