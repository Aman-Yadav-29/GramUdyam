import { Router } from 'express';
import { getAllSchemesHandler, calculateSchemeSubsidyHandler } from '../controllers/schemeController.ts';

const router = Router();

router.get('/', getAllSchemesHandler);
router.post('/evaluate', calculateSchemeSubsidyHandler);

export default router;
