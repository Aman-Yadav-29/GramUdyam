import { Router } from 'express';
import { 
  discoverEnterprisesHandler, 
  discoverByBudgetHandler,
  getEnterpriseByIdHandler, 
  getAllEnterprisesHandler 
} from '../controllers/businessController.ts';

const router = Router();

router.get('/discover-by-budget', discoverByBudgetHandler);
router.post('/discover-by-budget', discoverByBudgetHandler);

router.get('/discover', discoverEnterprisesHandler);
router.post('/discover', discoverEnterprisesHandler);
router.get('/all', getAllEnterprisesHandler);
router.get('/:id', getEnterpriseByIdHandler);

export default router;
