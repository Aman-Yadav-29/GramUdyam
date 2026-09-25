/**
 * Phase 13: Execution Evidence & Progress Record Controller
 * 
 * HTTP Handlers for adding, retrieving, updating, and deleting
 * user-recorded execution progress evidence.
 * 
 * Strict multi-tenant security:
 * - Session bearer token authentication.
 * - Ownership verification on every write/read.
 * - Defensive error handling (no stack trace exposure).
 */

import type { Request, Response } from 'express';
import { executionEvidenceService } from '../services/executionEvidenceService.ts';
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

/**
 * Creates an execution evidence record.
 * POST /api/execution-evidence
 */
export function createEvidenceHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'Request body must be a valid JSON object.' });
    }

    const { actionId, planId, type, title, description, referenceNumber, eventDate } = body;

    if (!actionId || !planId || !type || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: actionId, planId, type, title, and description are mandatory.'
      });
    }

    const record = executionEvidenceService.createEvidence(
      {
        actionId,
        planId,
        type,
        title,
        description,
        referenceNumber,
        eventDate
      },
      userId
    );

    return res.status(201).json({
      success: true,
      data: record
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('Invalid') || err.message?.includes('mandatory') || err.message?.includes('exceeds')
      ? 400
      : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to create execution evidence.' });
  }
}

/**
 * Retrieves all evidence records for a given action.
 * GET /api/execution-evidence/action/:actionId?planId=...
 */
export function getEvidenceByActionHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { actionId } = req.params;
    const planId = req.query.planId as string;

    if (!actionId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'Both actionId parameter and planId query parameter are required.'
      });
    }

    const records = executionEvidenceService.getEvidenceByAction(actionId, planId, userId);

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve evidence records.' });
  }
}

/**
 * Retrieves all evidence records for a given plan.
 * GET /api/execution-evidence/plan/:planId
 */
export function getEvidenceByPlanHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'planId parameter is required.'
      });
    }

    const records = executionEvidenceService.getEvidenceByPlan(planId, userId);

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve evidence records.' });
  }
}

/**
 * Retrieves a single evidence record by ID.
 * GET /api/execution-evidence/:id
 */
export function getEvidenceByIdHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Evidence id parameter is required.' });
    }

    const record = executionEvidenceService.getEvidenceById(id, userId);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Evidence record not found.' });
    }

    return res.status(200).json({
      success: true,
      data: record
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve evidence record.' });
  }
}

/**
 * Updates an evidence record.
 * PATCH /api/execution-evidence/:id
 */
export function updateEvidenceHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { id } = req.params;
    const updates = req.body;

    if (!id || !updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Evidence id and update payload required.' });
    }

    const updated = executionEvidenceService.updateEvidence(id, updates, userId);

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('not found')
      ? 404
      : err.message?.includes('Invalid') || err.message?.includes('cannot be empty') || err.message?.includes('exceeds')
      ? 400
      : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to update evidence record.' });
  }
}

/**
 * Deletes an evidence record.
 * DELETE /api/execution-evidence/:id
 */
export function deleteEvidenceHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Evidence id parameter is required.' });
    }

    const deleted = executionEvidenceService.deleteEvidence(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Evidence record not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { deleted: true }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to delete evidence record.' });
  }
}
