import { Router } from 'express';
import { getDistrictIntelligenceHandler, getLocationsMetadataHandler } from '../controllers/gisController.ts';

const router = Router();

router.get('/district', getDistrictIntelligenceHandler);
router.get('/metadata', getLocationsMetadataHandler);

export default router;
