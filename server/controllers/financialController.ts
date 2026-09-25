import type { Request, Response } from 'express';
import { financialEngineService } from '../services/financialEngineService.ts';

export const calculateFinancialPlanHandler = async (req: Request, res: Response) => {
  try {
    const { 
      enterpriseId, 
      capitalAvailable, 
      promoterCategory, 
      locationType, 
      state, 
      district,
      scenario,
      customScaleUnits 
    } = req.body;

    if (!enterpriseId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAM', message: 'enterpriseId is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const projections = financialEngineService.generateFinancialProjections({
      enterpriseId,
      capitalAvailable: Number(capitalAvailable) || 300000,
      promoterCategory: promoterCategory === 'special' ? 'special' : 'general',
      locationType: locationType === 'urban' ? 'urban' : 'rural',
      state: state || 'Uttar Pradesh',
      district: district || 'Varanasi',
      scenario: scenario === 'conservative' || scenario === 'optimistic' ? scenario : 'base',
      customScaleUnits: customScaleUnits ? Number(customScaleUnits) : undefined
    });

    res.json({
      success: true,
      data: projections,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CALCULATION_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};
