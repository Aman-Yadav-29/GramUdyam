import { Router } from 'express';
import { getHealthHandler, getSystemInfoHandler } from '../controllers/systemController.ts';
import { getAdvisoryHandler, getAiStatusHandler } from '../controllers/aiController.ts';

const router = Router();

router.get('/health', getHealthHandler);
router.get('/info', getSystemInfoHandler);
router.post('/advisory', getAdvisoryHandler);
router.get('/ai/status', getAiStatusHandler);

export default router;
