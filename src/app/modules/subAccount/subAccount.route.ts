import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SubAccountController } from './subAccount.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { SubUserValidation } from './subAccount.validation';

const router = express.Router();

router.post(
  '/create-subuser',
  fileUploadHandler(),
  auth(USER_ROLES.AGENCY),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = SubUserValidation.SubUserShemaCreate.parse(
        JSON.parse(req.body.data)
      );
    }
    return SubAccountController.createSubuser(req, res, next);
  }
);

router.patch(
  '/update-subuser/:id',
  fileUploadHandler(),
  auth(USER_ROLES.AGENCY),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = SubUserValidation.SubUserShemaUpdate.parse(
        JSON.parse(req.body.data)
      );
    }
    return SubAccountController.updateSubuser(req, res, next);
  }
);

router.get(
  '/get-all',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SubAccountController.getAllSubUserForAdmin
);

router.get(
  '/get-all-subuser',
  auth(USER_ROLES.AGENCY),
  SubAccountController.getSubuser
);

router.delete(
  '/delete/:id',
  auth(USER_ROLES.AGENCY),
  SubAccountController.deleteUser
);

export const SubUserRoutes = router;
