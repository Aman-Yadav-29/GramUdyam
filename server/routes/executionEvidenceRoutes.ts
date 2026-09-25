/**
 * Phase 13: Execution Evidence Routes
 */

import { Router } from 'express';
import {
  createEvidenceHandler,
  getEvidenceByActionHandler,
  getEvidenceByPlanHandler,
  getEvidenceByIdHandler,
  updateEvidenceHandler,
  deleteEvidenceHandler
} from '../controllers/executionEvidenceController.ts';

const router = Router();

router.post('/', createEvidenceHandler);
router.get('/action/:actionId', getEvidenceByActionHandler);
router.get('/plan/:planId', getEvidenceByPlanHandler);
router.get('/:id', getEvidenceByIdHandler);
router.patch('/:id', updateEvidenceHandler);
router.delete('/:id', deleteEvidenceHandler);

export default router;
