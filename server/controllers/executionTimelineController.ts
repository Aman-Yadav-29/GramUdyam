/**
 * Phase 14: Execution Timeline, Milestones & Plan Health Controller
 * 
 * HTTP Handlers for timeline events, milestone queries, and plan health monitoring.
 * 
 * Strict multi-tenant security:
 * - Session bearer token authentication.
 * - Ownership verification on every write/read.
 * - Defensive error handling (no stack trace exposure).
 */

import { Request, Response } from 'express';
import { executionTimelineService } from '../services/executionTimelineService.ts';
import { authService } from '../services/authService.ts';
import { generateTimelineExportText } from '../../src/utils/timelineEngine.ts';

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
 * Retrieves the compiled chronological timeline for a plan.
 * GET /api/execution-timeline/:planId
 */
export function getTimelineHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId parameter is required.' });
    }

    const events = executionTimelineService.getTimeline(planId, userId);
    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve execution timeline.' });
  }
}

/**
 * Creates a custom user execution note or milestone event.
 * POST /api/execution-timeline/events
 */
export function createEventHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'Request body must be a valid JSON object.' });
    }

    const { planId, actionId, title, description, eventDate } = body;

    if (!planId || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: planId, title, and description are mandatory.'
      });
    }

    const event = executionTimelineService.createCustomEvent(
      {
        planId,
        actionId,
        title,
        description,
        eventDate
      },
      userId
    );

    return res.status(201).json({
      success: true,
      data: event
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('Invalid') || err.message?.includes('mandatory') || err.message?.includes('exceeds')
      ? 400
      : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to create timeline event.' });
  }
}

/**
 * Updates a custom user execution event.
 * PATCH /api/execution-timeline/events/:eventId
 */
export function updateEventHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { eventId } = req.params;
    const updates = req.body;

    if (!eventId || !updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'eventId and update payload required.' });
    }

    const updated = executionTimelineService.updateCustomEvent(eventId, updates, userId);
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
    return res.status(status).json({ success: false, error: err.message || 'Failed to update timeline event.' });
  }
}

/**
 * Deletes a custom user timeline event.
 * DELETE /api/execution-timeline/events/:eventId
 */
export function deleteEventHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId parameter is required.' });
    }

    const deleted = executionTimelineService.deleteCustomEvent(eventId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Timeline event not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { deleted: true }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to delete timeline event.' });
  }
}

/**
 * Retrieves the 5 implementation milestone stages and factual progress counts.
 * GET /api/execution-timeline/:planId/milestones
 */
export function getMilestonesHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId parameter is required.' });
    }

    const milestones = executionTimelineService.getMilestones(planId, userId);
    return res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve milestones.' });
  }
}

/**
 * Retrieves the transparent plan health summary without numerical scores.
 * GET /api/execution-timeline/:planId/health
 */
export function getPlanHealthHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId parameter is required.' });
    }

    const health = executionTimelineService.getPlanHealth(planId, userId);
    return res.status(200).json({
      success: true,
      data: health
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve plan health.' });
  }
}

/**
 * Exports formatted plain-text timeline and plan health report.
 * GET /api/execution-timeline/:planId/export?title=...
 */
export function exportTimelineTextHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;
    const planTitle = (req.query.title as string) || 'Business Plan';

    if (!planId) {
      return res.status(400).send('planId parameter is required.');
    }

    const health = executionTimelineService.getPlanHealth(planId, userId);
    const events = executionTimelineService.getTimeline(planId, userId);
    const text = generateTimelineExportText(planTitle, health, events);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).send(err.message || 'Failed to export timeline report.');
  }
}
