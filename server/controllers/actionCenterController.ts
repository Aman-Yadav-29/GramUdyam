/**
 * Phase 12: Action Center Controller
 * 
 * HTTP handlers for Business Plan Action Center & Monitoring.
 * 
 * Strict authorization:
 * - Server verifies bearer session token.
 * - Supports guest mode and authenticated users.
 * - Does not recalculate Phase 3-11 figures.
 */

import { Request, Response } from 'express';
import { actionCenterService } from '../services/actionCenterService.ts';
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
 * Generates or initializes actions for a business plan.
 */
export function initializeActionsHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const payload = req.body;

    if (!payload || !payload.planId || !payload.enterprise) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: planId and enterprise are mandatory.'
      });
    }

    const actions = actionCenterService.generateOrGetActions(payload, userId);
    const summary = actionCenterService.getSummary(payload.planId, userId);

    return res.status(200).json({
      success: true,
      data: {
        actions,
        summary
      }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to initialize actions.' });
  }
}

/**
 * Gets all actions and summary for a plan.
 */
export function getActionsHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId parameter required.' });
    }

    const actions = actionCenterService.getActions(planId, userId);
    const summary = actionCenterService.getSummary(planId, userId);

    return res.status(200).json({
      success: true,
      data: {
        actions,
        summary
      }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to get actions.' });
  }
}

/**
 * Saves entire action list for a plan.
 */
export function saveActionsHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;
    const { actions } = req.body;

    if (!planId || !Array.isArray(actions)) {
      return res.status(400).json({ success: false, error: 'planId and actions array required.' });
    }

    const saved = actionCenterService.saveActions(planId, actions, userId);
    const summary = actionCenterService.getSummary(planId, userId);

    return res.status(200).json({
      success: true,
      data: {
        actions: saved,
        summary
      }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to save actions.' });
  }
}

/**
 * Updates a specific action.
 */
export function updateActionHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId, actionId } = req.params;
    const updates = req.body;

    if (!planId || !actionId) {
      return res.status(400).json({ success: false, error: 'planId and actionId required.' });
    }

    const updated = actionCenterService.updateAction(planId, actionId, updates, userId);
    const summary = actionCenterService.getSummary(planId, userId);

    return res.status(200).json({
      success: true,
      data: {
        action: updated,
        summary
      }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : err.message?.includes('not found') ? 404 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to update action.' });
  }
}

/**
 * Adds a new custom action.
 */
export function addActionHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;
    const actionData = req.body;

    if (!planId || !actionData?.title) {
      return res.status(400).json({ success: false, error: 'planId and action title required.' });
    }

    const created = actionCenterService.addAction(planId, actionData, userId);
    const summary = actionCenterService.getSummary(planId, userId);

    return res.status(201).json({
      success: true,
      data: {
        action: created,
        summary
      }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to add action.' });
  }
}

/**
 * Deletes an action.
 */
export function deleteActionHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId, actionId } = req.params;

    if (!planId || !actionId) {
      return res.status(400).json({ success: false, error: 'planId and actionId required.' });
    }

    const deleted = actionCenterService.deleteAction(planId, actionId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Action not found.' });
    }

    const summary = actionCenterService.getSummary(planId, userId);

    return res.status(200).json({
      success: true,
      data: {
        deleted: true,
        summary
      }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to delete action.' });
  }
}

/**
 * Exports actions as plain text for download/print.
 */
export function exportActionsTextHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;
    const planTitle = (req.query.title as string) || 'Business Plan';

    if (!planId) {
      return res.status(400).send('planId parameter required.');
    }

    const text = actionCenterService.exportText(planId, planTitle, userId);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).send(err.message || 'Failed to export action list.');
  }
}
