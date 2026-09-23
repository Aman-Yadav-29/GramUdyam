import { Request, Response } from 'express';
import { schemeEngineService } from '../services/schemeEngineService.ts';

export const getAllSchemesHandler = async (_req: Request, res: Response) => {
  try {
    const schemes = schemeEngineService.getAllSchemes();
    res.json({
      success: true,
      data: schemes,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SCHEME_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const calculateSchemeSubsidyHandler = async (req: Request, res: Response) => {
  try {
    const { schemeCode, projectCost, promoterCategory, locationType, activityType } = req.body;

    if (!schemeCode || !projectCost) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'schemeCode and projectCost are required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const result = schemeEngineService.evaluateScheme({
      schemeCode,
      projectCost: Number(projectCost),
      promoterCategory: promoterCategory || 'general',
      locationType: locationType || 'rural',
      activityType: activityType || 'manufacturing'
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'EVALUATION_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};
