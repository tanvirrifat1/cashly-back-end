import express from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
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
    USER_ROLES.SUPER_ADMIN
  ),
  UserController.getUserProfile
);

router.get(
  '/get-all-users/:id',
  auth(USER_ROLES.ADMIN),
  UserController.getSingleUser
);

export const UserRoutes = router;
