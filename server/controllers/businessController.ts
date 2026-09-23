import { Request, Response } from 'express';
import { businessService } from '../services/businessService.ts';
import { validateBusinessDiscoveryQuery } from '../../src/validation/businessValidator.ts';
import { ApiResponse, ApiErrorResponse } from '../../src/types/api.ts';
import { DiscoverySortOption } from '../../src/types/business.ts';

export const discoverByBudgetHandler = async (req: Request, res: Response) => {
  try {
    const rawCapital = req.method === 'POST' ? req.body.availableCapital : req.query.availableCapital;
    if (rawCapital === undefined || rawCapital === null || rawCapital === '') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'availableCapital is required for budget-first discovery.'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const availableCapital = Number(rawCapital);
    if (isNaN(availableCapital) || availableCapital <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'availableCapital must be a positive number.'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const rawSort = (req.method === 'POST' ? req.body.sortBy : req.query.sortBy) as DiscoverySortOption;
    const allowedSorts: DiscoverySortOption[] = ['lowest_investment', 'highest_profit', 'lowest_gap', 'shortest_payback', 'highest_roi', 'location_relevance'];
    const sortBy = allowedSorts.includes(rawSort) ? rawSort : 'lowest_investment';

    // Extract location fields if provided in POST body or query params
    const state = (req.method === 'POST' ? req.body.state : req.query.state) as string | undefined;
    const district = (req.method === 'POST' ? req.body.district : req.query.district) as string | undefined;
    const subDistrictOrBlock = (req.method === 'POST' ? req.body.subDistrictOrBlock : req.query.subDistrictOrBlock) as string | undefined;
    const villageOrTown = (req.method === 'POST' ? req.body.villageOrTown : req.query.villageOrTown) as string | undefined;
    const rawLocType = (req.method === 'POST' ? req.body.locationType : req.query.locationType) as string | undefined;
    const locationType: 'rural' | 'semi_urban' | 'urban' = (rawLocType === 'urban' || rawLocType === 'semi_urban' || rawLocType === 'rural') ? rawLocType : 'rural';

    const location = (state && district) ? {
      state,
      district,
      subDistrictOrBlock,
      villageOrTown,
      locationType
    } : undefined;

    const result = businessService.discoverByBudget(availableCapital, { sortBy, location });

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to process budget discovery' },
      timestamp: new Date().toISOString()
    });
  }
};

export const discoverEnterprisesHandler = async (req: Request, res: Response) => {
  try {
    const rawCapital = req.query.capital ?? req.body.capitalAvailable;
    if (rawCapital === undefined || rawCapital === null || rawCapital === '') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'capitalAvailable is required.'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const capital = Number(rawCapital);
    const state = (req.query.state as string) || req.body.state || 'Uttar Pradesh';
    const district = (req.query.district as string) || req.body.district || 'Varanasi';
    const locationType = ((req.query.locationType as string) || req.body.locationType || 'rural') as 'rural' | 'semi_urban' | 'urban';
    const preferredCategory = (req.query.category as string) || req.body.preferredCategory;

    const validation = validateBusinessDiscoveryQuery({
      capitalAvailable: capital,
      state,
      district,
      locationType
    });

    if (!validation.isValid) {
      const errorResp: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: validation.errors.join('; '),
          details: validation.errors
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json(errorResp);
      return;
    }

    const result = businessService.discoverEnterprises({
      capitalAvailable: capital,
      state,
      district,
      locationType,
      preferredCategory: preferredCategory === 'all' ? undefined : preferredCategory
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to discover enterprises' },
      timestamp: new Date().toISOString()
    });
  }
};

export const getEnterpriseByIdHandler = async (req: Request, res: Response) => {
  try {
    const enterprise = businessService.getEnterpriseDetails(req.params.id);
    if (!enterprise) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Enterprise with id '${req.params.id}' not found` },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      success: true,
      data: enterprise,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const getAllEnterprisesHandler = async (_req: Request, res: Response) => {
  const all = businessService.getAllEnterprises();
  res.json({
    success: true,
    data: all,
    timestamp: new Date().toISOString()
  });
};
