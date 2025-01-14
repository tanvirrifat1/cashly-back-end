import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { PermissionController } from './permission.controller';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get(
  '/get-buyer',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PermissionController.getAllBuyer
);

router.get(
  '/get-agency',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PermissionController.getAllAgency
);

router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PermissionController.updateStatus
);

export const PermissionRoutes = router;
