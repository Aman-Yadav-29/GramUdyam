/**
 * Phase 15: Submission Package Routes
 */

import { Router } from 'express';
import {
  generatePackageHandler,
  getPackageHandler,
  getPackagesForPlanHandler,
  updateUserInputsHandler,
  deletePackageHandler,
  exportPackageTextHandler,
  exportPackageHtmlHandler
} from '../controllers/submissionPackageController.ts';

const router = Router();

router.post('/generate', generatePackageHandler);
router.get('/plan/:planId', getPackagesForPlanHandler);
router.get('/:packageId', getPackageHandler);
router.patch('/:packageId/user-inputs', updateUserInputsHandler);
router.delete('/:packageId', deletePackageHandler);
router.get('/:packageId/export/text', exportPackageTextHandler);
router.get('/:packageId/export/html', exportPackageHtmlHandler);

export default router;
