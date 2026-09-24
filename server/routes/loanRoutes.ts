import { Router } from 'express';
import { getAllLoansHandler, matchLoansHandler, getBankAppraisalHandler } from '../controllers/loanController.ts';

const router = Router();

router.get('/', getAllLoansHandler);
router.get('/match', matchLoansHandler);
router.post('/match', matchLoansHandler);
router.post('/appraisal', getBankAppraisalHandler);

export default router;

