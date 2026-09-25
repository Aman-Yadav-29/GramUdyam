/**
 * Phase 12: Action Center Routes
 */

import { Router } from 'express';
import {
  initializeActionsHandler,
  getActionsHandler,
  saveActionsHandler,
  updateActionHandler,
  addActionHandler,
  deleteActionHandler,
  exportActionsTextHandler
} from '../controllers/actionCenterController.ts';

const router = Router();

// Initialize or generate
router.post('/initialize', initializeActionsHandler);

// Plan action operations
router.get('/:planId', getActionsHandler);
router.post('/:planId', saveActionsHandler);
router.post('/:planId/items', addActionHandler);
router.put('/:planId/items/:actionId', updateActionHandler);
router.delete('/:planId/items/:actionId', deleteActionHandler);
router.get('/:planId/export', exportActionsTextHandler);

export default router;
