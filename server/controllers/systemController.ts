import { Request, Response } from 'express';
import { dbManager } from '../models/database.ts';
import { aiService } from '../services/aiService.ts';
import { SystemHealthStatus, ApiResponse } from '../../src/types/api.ts';

const startTime = Date.now();

export const getHealthHandler = async (_req: Request, res: Response) => {
  const dbStatus = dbManager.getStatus();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const healthData: SystemHealthStatus = {
    status: dbStatus.status === 'connected' ? 'healthy' : 'degraded',
    service: 'gramudyam-core-engine',
    version: '1.0.0-phase1',
    uptimeSeconds,
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.status,
      type: dbStatus.driver
    },
    services: {
      businessDiscovery: true,
      financialEngine: true,
      schemeEngine: true,
      loanEngine: true,
      locationGis: true,
      aiAdvisor: aiService.isAvailable()
    }
  };

  const response: ApiResponse<SystemHealthStatus> = {
    success: true,
    data: healthData,
    message: 'GramUdyam core platform backend is active and responsive',
    timestamp: new Date().toISOString()
  };

  res.json(response);
};

export const getSystemInfoHandler = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'GramUdyam',
      purpose: 'Enterprise discovery, capital planning, location intelligence, and financing advisory for Indian entrepreneurs',
      phase: 'Phase 1 Foundation',
      supportedSchemes: ['PMEGP', 'PMFME', 'MUDRA', 'STANDUP_INDIA', 'AIF'],
      supportedLenders: ['Public Sector Banks', 'Regional Rural Banks (RRB)', 'MUDRA Refinance Partners'],
      coreQuestionAnswered: 'Given my available capital and location, what businesses can I realistically start, what will they cost, what financing might I need, what government schemes/loans may be relevant, and what should I do next?'
    },
    timestamp: new Date().toISOString()
  });
};
