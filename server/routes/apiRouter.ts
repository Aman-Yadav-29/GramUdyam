import { Router } from 'express';
import businessRoutes from './businessRoutes.ts';
import financialRoutes from './financialRoutes.ts';
import schemeRoutes from './schemeRoutes.ts';
import loanRoutes from './loanRoutes.ts';
import gisRoutes from './gisRoutes.ts';
import authRoutes from './authRoutes.ts';
import systemRoutes from './systemRoutes.ts';
import { getHealthHandler } from '../controllers/systemController.ts';

const apiRouter = Router();

// Core sub-routers
apiRouter.use('/business', businessRoutes);
apiRouter.use('/financial', financialRoutes);
apiRouter.use('/schemes', schemeRoutes);
apiRouter.use('/loans', loanRoutes);
apiRouter.use('/gis', gisRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/system', systemRoutes);

// Direct top-level health probe
apiRouter.get('/health', getHealthHandler);

export default apiRouter;
