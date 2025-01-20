import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { DocumentController } from './document.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { DocumentSchema } from './document.validation';

const router = express.Router();

router.post(
  '/create-document',
  fileUploadHandler(),
  auth(USER_ROLES.AGENCY, USER_ROLES.BUYER),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = DocumentSchema.parse(JSON.parse(req.body.data));
    }
    return DocumentController.createDocumentToDB(req, res, next);
  }
);

router.get(
  '/get-document',
  auth(USER_ROLES.AGENCY, USER_ROLES.BUYER),
  DocumentController.getAllDocument
);

router.get(
  '/get-document-agency',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DocumentController.getAllDocumentForAgency
);

router.get(
  '/get-document-buyer',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DocumentController.getAllDocumentBuyer
);

export const DocumentRoutes = router;
