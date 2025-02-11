import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { UserSuspentionController } from './userSuspention.controller';
import { UserSuspentionService } from './userSuspention.service';
const router = express.Router();

router.post(
  '/suspend-user',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserSuspentionService.suspendUser
);

router.post(
  '/reactivate-user',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserSuspentionController.ReactivateUsers
);

router.get(
  '/get-suspended-users/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserSuspentionController.getAllSuspendedUsers
);

router.get(
  '/get-suspended-users',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserSuspentionController.getSuspendedUsers
);

router.post(
  '/user-active/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserSuspentionController.ActiveUser
);

export const UserSuspentionRoutes = router;
