import express from 'express';

import { MessageController } from './message.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/send-message/:id',
  auth(USER_ROLES.BUYER, USER_ROLES.AGENCY),
  MessageController.sendMesg
);

router.get(
  '/get-message',
  auth(USER_ROLES.BUYER, USER_ROLES.AGENCY),
  MessageController.getAllMessages
);

export const MessageRoutes = router;
