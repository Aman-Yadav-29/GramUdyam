/**
 * Phase 9: Business Plan Controller
 * 
 * HTTP handlers for Business & Financing Plan generation, retrieval,
 * narrative editing, and persistence.
 * 
 * Strict authorization:
 * - Server verifies bearer session token.
 * - Does not trust client-supplied userId.
 * - Guest mode fully supported.
 */

import type { Request, Response } from 'express';
import { businessPlanService } from '../services/businessPlanService.ts';
import { authService } from '../services/authService.ts';

function extractAuthContext(req: Request): { userId?: string; isGuest: boolean } {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: undefined, isGuest: true };
  }

  const token = authHeader.substring(7).trim();
  const user = authService.verifySession(token);
  if (!user) {
    return { userId: undefined, isGuest: true };
  }

  return { userId: user.id, isGuest: Boolean(user.isGuest) };
}

export function generatePlanHandler(req: Request, res: Response) {
  try {
    const payload = req.body;
    if (!payload || !payload.enterprise || !payload.financialPlan) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payload: enterprise and financialPlan must be provided.'
      });
    }

    const plan = businessPlanService.generatePlan({
      enterprise: payload.enterprise,
      financialPlan: payload.financialPlan,
      availableCapital: Number(payload.availableCapital) || 0,
      location: payload.location || {
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        locationType: 'rural'
      },
      districtData: payload.districtData,
      agriLocationAnalysis: payload.agriLocationAnalysis,
      schemeMatches: payload.schemeMatches || [],
      documentReadiness: payload.documentReadiness,
      entrepreneurProfile: payload.entrepreneurProfile,
      scenarioSnapshots: payload.scenarioSnapshots,
      narrative: payload.narrative,
      existingId: payload.existingId
    });

    return res.status(200).json({
      success: true,
      plan
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to assemble business plan.'
    });
  }
}

export function savePlanHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { plan, title } = req.body;

    if (!plan || !plan.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan payload: plan and plan.id are required.'
      });
    }

    const record = businessPlanService.savePlan(userId, isGuest, plan, title);

    return res.status(200).json({
      success: true,
      record
    });
  } catch (err: any) {
    const statusCode = err.message?.includes('Forbidden') ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to save business plan.'
    });
  }
}

export function getPlanByIdHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID parameter is required.'
      });
    }

    const record = businessPlanService.getPlanById(id, userId, isGuest);

    return res.status(200).json({
      success: true,
      record
    });
  } catch (err: any) {
    const isNotFound = err.message?.includes('not found');
    const isForbidden = err.message?.includes('Forbidden');
    const statusCode = isNotFound ? 404 : isForbidden ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to retrieve business plan.'
    });
  }
}

export function getUserPlansHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);

    if (isGuest || !userId) {
      return res.status(200).json({
        success: true,
        plans: []
      });
    }

    const statusFilter = req.query.status as any;
    const plans = businessPlanService.getUserPlans(userId, statusFilter);

    return res.status(200).json({
      success: true,
      plans
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve user business plans.'
    });
  }
}

export function updateNarrativeHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;
    const { narrative } = req.body;

    if (!id || !narrative) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID and narrative payload are required.'
      });
    }

    const record = businessPlanService.updatePlanNarrative(id, userId, narrative, isGuest);

    return res.status(200).json({
      success: true,
      record
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const statusCode = isForbidden ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to update plan narrative.'
    });
  }
}

export function updateStatusHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID and status are required.'
      });
    }

    const record = businessPlanService.updatePlanStatus(id, userId, status, isGuest);

    return res.status(200).json({
      success: true,
      record
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const statusCode = isForbidden ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to update plan status.'
    });
  }
}

export function updateTitleHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;
    const { title } = req.body;

    if (!id || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID and title string are required.'
      });
    }

    const record = businessPlanService.updatePlanTitle(id, userId, title, isGuest);

    return res.status(200).json({
      success: true,
      record
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const statusCode = isForbidden ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to update plan title.'
    });
  }
}

export function deletePlanHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID parameter is required.'
      });
    }

    businessPlanService.deletePlan(id, userId, isGuest);

    return res.status(200).json({
      success: true,
      message: 'Business plan deleted successfully.'
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const isNotFound = err.message?.includes('not found');
    const statusCode = isForbidden ? 403 : isNotFound ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to delete business plan.'
    });
  }
}

export function createShareHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required.'
      });
    }

    const shareData = businessPlanService.createShareToken(id, userId, isGuest);

    return res.status(200).json({
      success: true,
      ...shareData
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const isNotFound = err.message?.includes('not found');
    const statusCode = isForbidden ? 403 : isNotFound ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to generate share token.'
    });
  }
}

export function revokeShareHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required.'
      });
    }

    businessPlanService.revokeShareToken(id, userId, isGuest);

    return res.status(200).json({
      success: true,
      message: 'Plan sharing revoked successfully.'
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const isNotFound = err.message?.includes('not found');
    const statusCode = isForbidden ? 403 : isNotFound ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Failed to revoke plan sharing.'
    });
  }
}

export function getSharedPlanHandler(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Share token is required.'
      });
    }

    const shared = businessPlanService.getSharedPlan(token);

    return res.status(200).json({
      success: true,
      data: shared
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      error: err.message || 'Shared plan not found or share link has been revoked.'
    });
  }
}

export function exportPlanHandler(req: Request, res: Response) {
  try {
    const { userId, isGuest } = extractAuthContext(req);
    const { id } = req.params;
    const format = req.query.format === 'html' ? 'html' : 'text';

    if (!id) {
      return res.status(400).send('Plan ID parameter is required.');
    }

    const record = businessPlanService.getPlanById(id, userId, isGuest);

    if (format === 'html') {
      const html = businessPlanService.exportPlanAsHtml(record.plan, record.title);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } else {
      const text = businessPlanService.formatPlanAsText(record.plan);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(text);
    }
  } catch (err: any) {
    const isForbidden = err.message?.includes('Forbidden');
    const isNotFound = err.message?.includes('not found');
    const statusCode = isForbidden ? 403 : isNotFound ? 404 : 400;
    return res.status(statusCode).send(err.message || 'Failed to export business plan.');
  }
}

/**
 * Generates a 25-section Detailed Project Report (DPR).
 */
export function generateDprHandler(req: Request, res: Response) {
  try {
    const payload = req.body;
    if (!payload || !payload.enterprise || !payload.financialPlan) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payload: enterprise and financialPlan must be provided.'
      });
    }

    const dpr = businessPlanService.generateDpr({
      enterprise: payload.enterprise,
      financialPlan: payload.financialPlan,
      capex: payload.capex,
      opex: payload.opex,
      availableCapital: Number(payload.availableCapital) || 0,
      location: payload.location || {
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        locationType: 'rural'
      },
      promoterProfile: payload.promoterProfile,
      districtData: payload.districtData,
      agriLocationAnalysis: payload.agriLocationAnalysis,
      schemeMatches: payload.schemeMatches || [],
      matchedLoans: payload.matchedLoans || [],
      documentReadiness: payload.documentReadiness,
      customScaleLabel: payload.customScaleLabel,
      reportId: payload.reportId
    });

    return res.status(200).json({
      success: true,
      dpr
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to generate Detailed Project Report (DPR).'
    });
  }
}

/**
 * Direct export handler for DPR payload.
 */
export function exportDprHandler(req: Request, res: Response) {
  try {
    const { dpr, format } = req.body;
    if (!dpr || !dpr.sections) {
      return res.status(400).send('Invalid request: Valid DPR payload required.');
    }

    if (format === 'html') {
      const html = businessPlanService.exportDprAsHtml(dpr);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } else {
      const text = businessPlanService.exportDprAsText(dpr);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(text);
    }
  } catch (err: any) {
    return res.status(400).send(err.message || 'Failed to export DPR.');
  }
}


