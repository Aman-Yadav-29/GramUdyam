import { Request, Response } from 'express';
import { locationGisService } from '../services/locationGisService.ts';

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
