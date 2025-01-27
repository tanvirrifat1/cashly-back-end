import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get(
  '/get-total-statistics',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.totalStatistics
);

router.get(
  '/get-total-earning',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.getEarningChartData
);

export const DashboardRoutes = router;
