import { Request, Response } from 'express';
import { locationGisService } from '../services/locationGisService.ts';
import { agriLocationService } from '../services/agriLocationService.ts';
import { entityRepository } from '../models/schema.ts';
import { BUSINESS_TEMPLATES } from '../../src/data/businessTemplates.ts';

export const getAgriLocationAnalysisHandler = async (req: Request, res: Response) => {
  try {
    const rawBusinessId = (req.query.businessId as string) ?? (req.body?.businessId as string);
    const rawState = (req.query.state as string) ?? (req.body?.state as string);
    const rawDistrict = (req.query.district as string) ?? (req.body?.district as string);

    if (!rawBusinessId || typeof rawBusinessId !== 'string' || !rawBusinessId.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'businessId is required for agriculture location analysis.' },
        timestamp: new Date().toISOString()
      });
    }

    const businessId = rawBusinessId.trim();
    const state = (rawState && typeof rawState === 'string' && rawState.trim()) ? rawState.trim() : 'Uttar Pradesh';
    const district = (rawDistrict && typeof rawDistrict === 'string' && rawDistrict.trim()) ? rawDistrict.trim() : 'Varanasi';
    const villageOrTown = (req.query.villageOrTown as string) || (req.body?.villageOrTown as string);
    const subDistrictOrBlock = (req.query.subDistrictOrBlock as string) || (req.body?.subDistrictOrBlock as string);
    const locationType = ((req.query.locationType as string) || (req.body?.locationType as string) || 'rural') as 'rural' | 'semi_urban' | 'urban';

    // Look up template if available
    const template = BUSINESS_TEMPLATES.find((t) => t.id === businessId) || entityRepository.getEnterpriseById(businessId);
    const analysis = agriLocationService.analyzeAgriLocation(
      template || businessId,
      state,
      district,
      {
        villageOrTown,
        subDistrictOrBlock,
        locationType
      }
    );

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AGRI_LOCATION_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const getDistrictIntelligenceHandler = async (req: Request, res: Response) => {
  try {
    const state = (req.query.state as string) || 'Uttar Pradesh';
    const district = (req.query.district as string) || 'Varanasi';

    const intel = locationGisService.getDistrictData(state, district);
    res.json({
      success: true,
      data: intel,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GIS_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const getLocationsMetadataHandler = async (_req: Request, res: Response) => {
  try {
    const states = locationGisService.getSupportedStates();
    res.json({
      success: true,
      data: {
        states
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'GIS_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};
