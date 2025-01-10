import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NotificationController } from './notification.controller';

const router = express.Router();

router.get(
  '/',

  NotificationController.getNotificationToDb
);

router.patch(
  '/',

  NotificationController.readNotification
);

router.get(
  '/admin',

  NotificationController.adminNotificationFromDB
);

router.patch(
  '/admin',

  NotificationController.adminReadNotification
);

//driver
router.get(
  '/driver',

  NotificationController.getNotificationFromDriver
);

//client
router.get(
  '/client',

  NotificationController.getNotificationFromClient
);

router.delete(
  '/delete-all',
  auth(USER_ROLES.ADMIN),
  NotificationController.deleteAllNotifications
);

export const NotificationRoutes = router;
