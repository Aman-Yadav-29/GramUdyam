/**
 * Phase 13: Execution Evidence & Progress Record Service
 * 
 * Strict architectural rules:
 * - ADDITIVE ONLY to Action Center.
 * - Factual execution record-keeping and progress tracking.
 * - Explicit non-verification: User-recorded evidence is NEVER treated as
 *   official government, bank, statutory, or third-party verification.
 * - Strong multi-tenant authorization and ownership isolation.
 * - Input validation against oversized text, malformed dates, and mass-assignment.
 */

import { EVIDENCE_USER_DISCLAIMER } from '../../src/types/executionEvidence.ts';
import type { ExecutionEvidence, EvidenceType, CreateEvidenceInput, UpdateEvidenceInput } from '../../src/types/executionEvidence.ts';
import { actionCenterService } from './actionCenterService.ts';

const VALID_EVIDENCE_TYPES: Set<EvidenceType> = new Set([
  'note',
  'quotation',
  'application_reference',
  'meeting_record',
  'site_verification',
  'document_submission',
  'purchase_record',
  'inspection_record',
  'photo_reference',
  'other'
]);

function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return false;
  
  // Disallow future event dates
  const today = new Date().toISOString().split('T')[0];
  if (dateStr > today) return false;

  return true;
}

export class ExecutionEvidenceService {
  // Map of evidenceId -> ExecutionEvidence
  private evidenceStore: Map<string, ExecutionEvidence> = new Map();
  // Map of evidenceId -> ownerUserId (if authenticated)
  private evidenceOwners: Map<string, string | undefined> = new Map();
  private counter: number = 0;

  /**
   * Resets in-memory state (useful for test runs)
   */
  public reset(): void {
    this.evidenceStore.clear();
    this.evidenceOwners.clear();
    this.counter = 0;
  }

  /**
   * Creates a new execution evidence record.
   */
  public createEvidence(input: CreateEvidenceInput, userId?: string): ExecutionEvidence {
    // 1. Validate required identifiers
    if (!input.planId || typeof input.planId !== 'string' || input.planId.trim().length === 0) {
      throw new Error('Invalid planId: planId is required.');
    }
    if (!input.actionId || typeof input.actionId !== 'string' || input.actionId.trim().length === 0) {
      throw new Error('Invalid actionId: actionId is required.');
    }

    const planId = input.planId.trim();
    const actionId = input.actionId.trim();

    // 2. Authorization & Ownership Check
    this.verifyPlanOwnership(planId, userId);

    // 3. Validate Evidence Type
    if (!input.type || !VALID_EVIDENCE_TYPES.has(input.type)) {
      throw new Error(`Invalid evidence type. Allowed types: ${Array.from(VALID_EVIDENCE_TYPES).join(', ')}`);
    }

    // 4. Validate Title
    if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
      throw new Error('Evidence title is mandatory.');
    }
    const title = input.title.trim();
    if (title.length > 160) {
      throw new Error('Evidence title exceeds maximum limit of 160 characters.');
    }

    // 5. Validate Description
    if (!input.description || typeof input.description !== 'string' || input.description.trim().length === 0) {
      throw new Error('Evidence description is mandatory.');
    }
    const description = input.description.trim();
    if (description.length > 2000) {
      throw new Error('Evidence description exceeds maximum limit of 2000 characters.');
    }

    // 6. Validate Reference Number (optional)
    let referenceNumber: string | undefined = undefined;
    if (input.referenceNumber && typeof input.referenceNumber === 'string') {
      const ref = input.referenceNumber.trim();
      if (ref.length > 80) {
        throw new Error('Reference number exceeds maximum limit of 80 characters.');
      }
      if (ref.length > 0) {
        referenceNumber = ref;
      }
    }

    // 7. Validate Event Date (optional)
    let eventDate: string | undefined = undefined;
    if (input.eventDate && typeof input.eventDate === 'string') {
      const dateStr = input.eventDate.trim();
      if (dateStr.length > 0) {
        if (!isValidDateString(dateStr)) {
          throw new Error('Invalid event date format or future date. Must be YYYY-MM-DD on or before today.');
        }
        eventDate = dateStr;
      }
    }

    // 8. Generate Record
    this.counter++;
    const now = new Date().toISOString();
    const id = `${planId}_evi_${Date.now()}_${this.counter}`;

    const record: ExecutionEvidence = {
      id,
      actionId,
      planId,
      type: input.type,
      title,
      description,
      referenceNumber,
      eventDate,
      source: 'user_recorded',
      verificationStatus: 'user_recorded',
      disclaimer: EVIDENCE_USER_DISCLAIMER,
      createdAt: now,
      updatedAt: now
    };

    this.evidenceStore.set(id, record);
    if (userId) {
      this.evidenceOwners.set(id, userId);
    }

    return record;
  }

  /**
   * Retrieves all evidence records for an action, ordered newest first.
   */
  public getEvidenceByAction(actionId: string, planId: string, userId?: string): ExecutionEvidence[] {
    this.verifyPlanOwnership(planId, userId);
    const results: ExecutionEvidence[] = [];

    for (const record of this.evidenceStore.values()) {
      if (record.planId === planId && record.actionId === actionId) {
        // Enforce record-level ownership check
        this.verifyEvidenceOwnership(record.id, userId);
        results.push(record);
      }
    }

    // Newest first by eventDate/createdAt
    return results.sort((a, b) => {
      const dateA = a.eventDate || a.createdAt;
      const dateB = b.eventDate || b.createdAt;
      return dateB.localeCompare(dateA);
    });
  }

  /**
   * Retrieves all evidence records for a plan.
   */
  public getEvidenceByPlan(planId: string, userId?: string): ExecutionEvidence[] {
    this.verifyPlanOwnership(planId, userId);
    const results: ExecutionEvidence[] = [];

    for (const record of this.evidenceStore.values()) {
      if (record.planId === planId) {
        this.verifyEvidenceOwnership(record.id, userId);
        results.push(record);
      }
    }

    return results.sort((a, b) => {
      const dateA = a.eventDate || a.createdAt;
      const dateB = b.eventDate || b.createdAt;
      return dateB.localeCompare(dateA);
    });
  }

  /**
   * Retrieves a single evidence record by ID.
   */
  public getEvidenceById(id: string, userId?: string): ExecutionEvidence | undefined {
    const record = this.evidenceStore.get(id);
    if (!record) return undefined;

    this.verifyPlanOwnership(record.planId, userId);
    this.verifyEvidenceOwnership(id, userId);
    return record;
  }

  /**
   * Updates an existing evidence record.
   */
  public updateEvidence(id: string, updates: UpdateEvidenceInput, userId?: string): ExecutionEvidence {
    const existing = this.evidenceStore.get(id);
    if (!existing) {
      throw new Error(`Evidence record with id ${id} not found.`);
    }

    this.verifyPlanOwnership(existing.planId, userId);
    this.verifyEvidenceOwnership(id, userId);

    // Validate type if updating
    let newType = existing.type;
    if (updates.type !== undefined) {
      if (!VALID_EVIDENCE_TYPES.has(updates.type)) {
        throw new Error(`Invalid evidence type. Allowed types: ${Array.from(VALID_EVIDENCE_TYPES).join(', ')}`);
      }
      newType = updates.type;
    }

    // Validate title if updating
    let newTitle = existing.title;
    if (updates.title !== undefined) {
      const t = updates.title.trim();
      if (t.length === 0) {
        throw new Error('Evidence title cannot be empty.');
      }
      if (t.length > 160) {
        throw new Error('Evidence title exceeds maximum limit of 160 characters.');
      }
      newTitle = t;
    }

    // Validate description if updating
    let newDescription = existing.description;
    if (updates.description !== undefined) {
      const d = updates.description.trim();
      if (d.length === 0) {
        throw new Error('Evidence description cannot be empty.');
      }
      if (d.length > 2000) {
        throw new Error('Evidence description exceeds maximum limit of 2000 characters.');
      }
      newDescription = d;
    }

    // Validate reference number if updating
    let newRef = existing.referenceNumber;
    if (updates.referenceNumber !== undefined) {
      const r = updates.referenceNumber.trim();
      if (r.length > 80) {
        throw new Error('Reference number exceeds maximum limit of 80 characters.');
      }
      newRef = r.length > 0 ? r : undefined;
    }

    // Validate eventDate if updating
    let newEventDate = existing.eventDate;
    if (updates.eventDate !== undefined) {
      const ed = updates.eventDate.trim();
      if (ed.length > 0) {
        if (!isValidDateString(ed)) {
          throw new Error('Invalid event date format or future date. Must be YYYY-MM-DD on or before today.');
        }
        newEventDate = ed;
      } else {
        newEventDate = undefined;
      }
    }

    // Construct updated record with mass-assignment defense
    const updated: ExecutionEvidence = {
      id: existing.id,
      actionId: existing.actionId,
      planId: existing.planId,
      type: newType,
      title: newTitle,
      description: newDescription,
      referenceNumber: newRef,
      eventDate: newEventDate,
      source: existing.source,
      verificationStatus: existing.verificationStatus,
      disclaimer: existing.disclaimer,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.evidenceStore.set(id, updated);
    return updated;
  }

  /**
   * Deletes an evidence record.
   */
  public deleteEvidence(id: string, userId?: string): boolean {
    const existing = this.evidenceStore.get(id);
    if (!existing) {
      return false;
    }

    this.verifyPlanOwnership(existing.planId, userId);
    this.verifyEvidenceOwnership(id, userId);

    this.evidenceStore.delete(id);
    this.evidenceOwners.delete(id);
    return true;
  }

  private verifyPlanOwnership(planId: string, userId?: string) {
    const planOwner = actionCenterService.getPlanOwner(planId);
    if (planOwner && userId && planOwner !== userId) {
      throw new Error('Forbidden: You do not have permission to access or modify evidence for this business plan.');
    }
  }

  private verifyEvidenceOwnership(evidenceId: string, userId?: string) {
    const owner = this.evidenceOwners.get(evidenceId);
    if (owner && userId && owner !== userId) {
      throw new Error('Forbidden: You do not have permission to access or modify this evidence record.');
    }
  }
}

export const executionEvidenceService = new ExecutionEvidenceService();
