import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NotificationController } from './notification.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.AGENCY, USER_ROLES.BUYER),
  NotificationController.getNotificationToDb
);

router.patch(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.AGENCY, USER_ROLES.BUYER),
  NotificationController.readNotification
);

router.get(
  '/admin',
  auth(USER_ROLES.ADMIN),
  NotificationController.adminNotificationFromDB
);

router.patch(
  '/admin',
  auth(USER_ROLES.ADMIN),
  NotificationController.adminReadNotification
);

router.delete(
  '/delete-all',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.deleteAllNotifications
);

export const NotificationRoutes = router;
