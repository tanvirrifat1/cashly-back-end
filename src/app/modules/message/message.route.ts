import express from 'express';

import { MessageController } from './message.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/send-message/:id',
  auth(
    USER_ROLES.BUYER,
    USER_ROLES.AGENCY,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  MessageController.sendMesg
);

router.get(
  '/get-message/:id',
  auth(
    USER_ROLES.BUYER,
    USER_ROLES.AGENCY,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  ),
  MessageController.getAllMessages
);

export const MessageRoutes = router;
