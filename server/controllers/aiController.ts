import { Request, Response } from 'express';
import { aiService } from '../services/aiService.ts';

export const getAdvisoryHandler = async (req: Request, res: Response) => {
  try {
    const { enterpriseName, capital, district, state, promoterCategory } = req.body;

    const advisory = await aiService.generateBusinessAdvisory({
      enterpriseName: enterpriseName || 'Agro-processing Micro Enterprise',
      capital: Number(capital) || 500000,
      district: district || 'Varanasi',
      state: state || 'Uttar Pradesh',
      promoterCategory: promoterCategory || 'General'
    });

    res.json({
      success: true,
      data: advisory,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AI_ADVISORY_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const getAiStatusHandler = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      isAvailable: aiService.isAvailable(),
      model: 'gemini-3.8-flash'
    },
    timestamp: new Date().toISOString()
  });
};
