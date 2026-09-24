import { Router } from 'express';
import {
  generatePlanHandler,
  savePlanHandler,
  getPlanByIdHandler,
  getUserPlansHandler,
  updateNarrativeHandler,
  updateStatusHandler,
  updateTitleHandler,
  deletePlanHandler,
  createShareHandler,
  revokeShareHandler,
  getSharedPlanHandler,
  exportPlanHandler,
  generateDprHandler,
  exportDprHandler
} from '../controllers/businessPlanController.ts';

const router = Router();

// DPR (Detailed Project Report - 25 Chapters)
router.post('/generate-dpr', generateDprHandler);
router.post('/dpr/export', exportDprHandler);

// Generation & Persistence
router.post('/generate', generatePlanHandler);
router.post('/save', savePlanHandler);
router.post('/', savePlanHandler);
router.get('/', getUserPlansHandler);

// Public Shared Plan (Placed before /:id to avoid collision)
router.get('/shared/:token', getSharedPlanHandler);

// Individual Plan Operations
router.get('/:id', getPlanByIdHandler);
router.delete('/:id', deletePlanHandler);
router.patch('/:id/narrative', updateNarrativeHandler);
router.put('/:id/narrative', updateNarrativeHandler);
router.patch('/:id/status', updateStatusHandler);
router.patch('/:id/title', updateTitleHandler);

// Export & Sharing
router.get('/:id/export', exportPlanHandler);
router.post('/:id/share', createShareHandler);
router.delete('/:id/share', revokeShareHandler);

export default router;

