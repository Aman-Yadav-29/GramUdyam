import { Router } from 'express';
import { getAllLoansHandler, matchLoansHandler } from '../controllers/loanController.ts';

const router = Router();

router.get('/', getAllLoansHandler);
router.get('/match', matchLoansHandler);
router.post('/match', matchLoansHandler);

export default router;
