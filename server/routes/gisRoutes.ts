import { Router } from 'express';
import { 
  getDistrictIntelligenceHandler, 
  getLocationsMetadataHandler,
  getAgriLocationAnalysisHandler 
} from '../controllers/gisController.ts';

const router = Router();

router.get('/district', getDistrictIntelligenceHandler);
router.get('/metadata', getLocationsMetadataHandler);
router.get('/agri-analysis', getAgriLocationAnalysisHandler);
router.post('/agri-analysis', getAgriLocationAnalysisHandler);

export default router;
