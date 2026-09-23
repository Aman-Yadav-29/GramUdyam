import { Router } from 'express';
import {
  getAllSchemesHandler,
  calculateSchemeSubsidyHandler,
  matchSchemesHandler
} from '../controllers/schemeController.ts';

const router = Router();

router.get('/', getAllSchemesHandler);
router.post('/evaluate', calculateSchemeSubsidyHandler);
router.post('/match', matchSchemesHandler);

export default router;

