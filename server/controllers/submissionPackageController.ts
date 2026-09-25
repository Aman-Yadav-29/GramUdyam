/**
 * Phase 15: Submission Package Controller
 * 
 * HTTP Handlers for Bank & Government Submission Packages.
 * 
 * Strict multi-tenant security:
 * - Session bearer token authentication.
 * - Ownership verification on every write/read.
 * - Defensive error handling (no stack trace exposure).
 */

import type { Request, Response } from 'express';
import { submissionPackageService } from '../services/submissionPackageService.ts';
import { authService } from '../services/authService.ts';
import type { GenerateSubmissionPackageParams } from '../../src/types/submissionPackage.ts';

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
 * Generates a new submission package.
 * POST /api/submission-packages/generate
 */
export function generatePackageHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const body = req.body as GenerateSubmissionPackageParams;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'Request body must be a valid JSON object.' });
    }

    if (!body.planId || !body.business || !body.packageType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: planId, business, and packageType are mandatory.'
      });
    }

    if (body.packageType !== 'bank_submission' && body.packageType !== 'government_scheme_submission') {
      return res.status(400).json({
        success: false,
        error: "Invalid packageType: must be 'bank_submission' or 'government_scheme_submission'."
      });
    }

    const pkg = submissionPackageService.generate(body, userId);
    return res.status(201).json({
      success: true,
      data: pkg
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('Invalid') || err.message?.includes('mandatory')
      ? 400
      : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to generate submission package.' });
  }
}

/**
 * Retrieves a submission package by ID.
 * GET /api/submission-packages/:packageId
 */
export function getPackageHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { packageId } = req.params;

    if (!packageId) {
      return res.status(400).json({ success: false, error: 'packageId parameter is required.' });
    }

    const pkg = submissionPackageService.getById(packageId, userId);
    return res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('not found')
      ? 404
      : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve submission package.' });
  }
}

/**
 * Retrieves all submission packages for a given plan ID.
 * GET /api/submission-packages/plan/:planId
 */
export function getPackagesForPlanHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { planId } = req.params;

    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId parameter is required.' });
    }

    const pkgs = submissionPackageService.getByPlanId(planId, userId);
    return res.status(200).json({
      success: true,
      data: pkgs
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to retrieve packages for plan.' });
  }
}

/**
 * Updates user inputs for a submission package.
 * PATCH /api/submission-packages/:packageId/user-inputs
 */
export function updateUserInputsHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { packageId } = req.params;
    const body = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, error: 'packageId parameter is required.' });
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'Payload must be a valid JSON object.' });
    }

    const updated = submissionPackageService.updateUserInputs(packageId, body, userId);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('not found')
      ? 404
      : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to update user inputs.' });
  }
}

/**
 * Deletes a submission package.
 * DELETE /api/submission-packages/:packageId
 */
export function deletePackageHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { packageId } = req.params;

    if (!packageId) {
      return res.status(400).json({ success: false, error: 'packageId parameter is required.' });
    }

    const deleted = submissionPackageService.delete(packageId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Submission package not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { deleted: true }
    });
  } catch (err: any) {
    const status = err.message?.includes('Forbidden') ? 403 : 500;
    return res.status(status).json({ success: false, error: err.message || 'Failed to delete submission package.' });
  }
}

/**
 * Exports submission package as plain text.
 * GET /api/submission-packages/:packageId/export/text
 */
export function exportPackageTextHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { packageId } = req.params;

    if (!packageId) {
      return res.status(400).send('packageId parameter is required.');
    }

    const text = submissionPackageService.exportAsText(packageId, userId);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('not found')
      ? 404
      : 500;
    return res.status(status).send(err.message || 'Failed to export package text.');
  }
}

/**
 * Exports submission package as printable HTML.
 * GET /api/submission-packages/:packageId/export/html
 */
export function exportPackageHtmlHandler(req: Request, res: Response) {
  try {
    const { userId } = extractAuthContext(req);
    const { packageId } = req.params;

    if (!packageId) {
      return res.status(400).send('packageId parameter is required.');
    }

    const html = submissionPackageService.exportAsHtml(packageId, userId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err: any) {
    const status = err.message?.includes('Forbidden')
      ? 403
      : err.message?.includes('not found')
      ? 404
      : 500;
    return res.status(status).send(err.message || 'Failed to export package html.');
  }
}
