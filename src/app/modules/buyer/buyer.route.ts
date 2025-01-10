import express, { NextFunction, Request, Response } from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { BuyerValidation } from './buyer.validation';
import { BuyerController } from './buyer.controller';

const router = express.Router();

router.patch(
  '/update-buyer',
  fileUploadHandler(),
  auth(USER_ROLES.BUYER),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = BuyerValidation.BuyerShema.parse(JSON.parse(req.body.data));
    }
    return BuyerController.updateBuyerProfile(req, res, next);
  }
);

router.get('/get-all-buyer', BuyerController.getAllBuyer);

export const BuyerRoutes = router;
