import express, { NextFunction, Request, Response } from 'express';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { AgencyValidation } from './agency.validation';
import { AgencyController } from './agency.controller';

const router = express.Router();

router.patch(
  '/update-agency',
  fileUploadHandler(),
  auth(USER_ROLES.AGENCY),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = AgencyValidation.AgencyShema.parse(JSON.parse(req.body.data));
    }
    return AgencyController.updateAgencyProfile(req, res, next);
  }
);

router.get(
  '/get-all-agencies',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AgencyController.getAllAgencies
);

router.get('/get-all-agency', AgencyController.getAllAgency);

export const AgencyRoutes = router;
