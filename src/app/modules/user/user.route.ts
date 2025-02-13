import express, { NextFunction, Request, Response } from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();

router.post(
  '/create-agency',
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createAgencyToDB
);
router.post(
  '/create-buyer',
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUserToDB
);

router.get(
  '/profile',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.AGENCY,
    USER_ROLES.BUYER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.SUB_USER
  ),
  UserController.getUserProfile
);

router.patch(
  '/update-profile',
  fileUploadHandler(),
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.AGENCY,
    USER_ROLES.BUYER,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.SUB_USER
  ),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = UserValidation.updateZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    return UserController.updateProfile(req, res, next);
  }
);

router.get(
  '/get-all-users/:id',
  auth(USER_ROLES.ADMIN),
  UserController.getSingleUser
);

export const UserRoutes = router;
