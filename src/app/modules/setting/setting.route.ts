import express from 'express';
import { SettingController } from './setting.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-terms',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SettingController.createTermsAndCondition
);
router.get('/get-terms', SettingController.getTermsAndCondition);

router.post(
  '/create-privacy',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SettingController.createReturnPolicy
);

router.get('/get-privacy', SettingController.getReturnPolicy);

export const SettingRoutes = router;
