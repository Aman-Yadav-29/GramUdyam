import { Router } from 'express';
import {
  getAllSchemesHandler,
  calculateSchemeSubsidyHandler,
  matchSchemesHandler,
  getSchemeReadinessHandler,
  saveSchemeReadinessHandler
} from '../controllers/schemeController.ts';

const router = Router();

router.get('/', getAllSchemesHandler);
router.post('/evaluate', calculateSchemeSubsidyHandler);
router.post('/match', matchSchemesHandler);
router.get('/:schemeId/readiness', getSchemeReadinessHandler);
router.post('/readiness', saveSchemeReadinessHandler);

export default router;

