import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ChatRoomController } from './chatRoom.controller';

const router = express.Router();

router.get(
  '/room',
  auth(USER_ROLES.BUYER, USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  ChatRoomController.getOrCreateRoom
);

router.get(
  '/get-inbox',
  auth(USER_ROLES.BUYER, USER_ROLES.AGENCY, USER_ROLES.SUB_USER),
  ChatRoomController.getAllInboxs
);

export const InboxRoutes = router;
