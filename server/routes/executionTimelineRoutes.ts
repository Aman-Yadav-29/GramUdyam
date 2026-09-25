/**
 * Phase 14: Execution Timeline Routes
 */

import { Router } from 'express';
import {
  getTimelineHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
  getMilestonesHandler,
  getPlanHealthHandler,
  exportTimelineTextHandler
} from '../controllers/executionTimelineController.ts';

const router = Router();

// Timeline Events
router.get('/:planId', getTimelineHandler);
router.post('/events', createEventHandler);
router.patch('/events/:eventId', updateEventHandler);
router.delete('/events/:eventId', deleteEventHandler);

// Milestones & Health
router.get('/:planId/milestones', getMilestonesHandler);
router.get('/:planId/health', getPlanHealthHandler);
router.get('/:planId/export', exportTimelineTextHandler);

export default router;
