import { Request, Response } from 'express';
import { schemeEngineService } from '../services/schemeEngineService.ts';
import { schemeMatchingService } from '../services/schemeMatchingService.ts';

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

/**
 * Phase 7: Match government schemes & loans based on business plan, financing gap, location, and entrepreneur profile.
 */
export const matchSchemesHandler = async (req: Request, res: Response) => {
  try {
    const { businessId, availableCapital, projectCost, financingGap, location, entrepreneurProfile } = req.body;

    // 1. Validate businessId
    if (!businessId || typeof businessId !== 'string' || businessId.trim() === '') {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Valid non-empty businessId is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 2. Validate numeric financial values
    if (availableCapital === undefined || typeof availableCapital !== 'number' || isNaN(availableCapital) || availableCapital < 0) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'availableCapital must be a non-negative number' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (projectCost === undefined || typeof projectCost !== 'number' || isNaN(projectCost) || projectCost < 0) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'projectCost must be a non-negative number' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (financingGap !== undefined && (typeof financingGap !== 'number' || isNaN(financingGap) || financingGap < 0)) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'financingGap must be a non-negative number when provided' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 3. Validate location
    if (!location || typeof location !== 'object' || !location.state || typeof location.state !== 'string' || location.state.trim() === '') {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Valid location object with a non-empty state is required' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 4. Validate profile if supplied
    if (entrepreneurProfile !== undefined && typeof entrepreneurProfile !== 'object') {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'entrepreneurProfile must be an object' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (entrepreneurProfile?.age !== undefined && (typeof entrepreneurProfile.age !== 'number' || isNaN(entrepreneurProfile.age) || entrepreneurProfile.age < 0 || entrepreneurProfile.age > 120)) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Applicant age must be a valid number between 0 and 120' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 5. Execute deterministic matching
    const result = schemeMatchingService.matchSchemes({
      businessId: businessId.trim(),
      availableCapital,
      projectCost,
      financingGap: financingGap ?? Math.max(0, projectCost - availableCapital),
      location: {
        state: location.state.trim(),
        district: location.district?.trim(),
        ruralUrban: location.ruralUrban
      },
      entrepreneurProfile
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SCHEME_MATCHING_ERROR', message: error.message || 'An error occurred during scheme matching' },
      timestamp: new Date().toISOString()
    });
  }
};

