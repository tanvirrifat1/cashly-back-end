import express from 'express';
import { packageController } from './package.controller';

const router = express.Router();

router.post('/create-package', packageController.createPlanToDB);

router.patch('/update/:id', packageController.updatePackage);

router.get('/get-all-packages', packageController.getAllPackage);

router.get('/:id', packageController.getSinglePackage);

router.delete('/delete/:id', packageController.deletePackage);

export const PackageRoutes = router;
