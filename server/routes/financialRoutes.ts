import { Router } from 'express';
import { calculateFinancialPlanHandler } from '../controllers/financialController.ts';

const router = Router();

router.post('/plan', calculateFinancialPlanHandler);

export default router;
