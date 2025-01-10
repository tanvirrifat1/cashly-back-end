import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { PermissionController } from './permission.controller';

const router = express.Router();

router.get('/get-buyer', PermissionController.getAllBuyer);
router.get('/get-agency', PermissionController.getAllAgency);
router.patch('/update/:id', PermissionController.updateStatus);

export const PermissionRoutes = router;
