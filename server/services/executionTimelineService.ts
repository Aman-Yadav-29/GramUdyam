/**
 * Phase 14: Execution Timeline, Milestones & Plan Health Service
 * 
 * Strict architectural boundaries:
 * - ADDITIVE ONLY to Action Center and Execution Evidence.
 * - Sourced strictly from validated Phase 8-13 records.
 * - Multi-tenant security with session bearer token verification.
 * - Ownership isolation: User B cannot view or modify User A's timeline.
 * - Zero financial or scoring recalculation.
 */

import {
  ExecutionTimelineEvent,
  ExecutionMilestone,
  PlanHealthSummary,
  CreateUserNoteEventInput,
  UpdateUserNoteEventInput,
  TIMELINE_DISCLAIMER
} from '../../src/types/executionTimeline.ts';
import { actionCenterService } from './actionCenterService.ts';
import { executionEvidenceService } from './executionEvidenceService.ts';
import {
  buildTimelineEvents,
  calculateMilestones,
  computePlanHealth
} from '../../src/utils/timelineEngine.ts';

function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) return false;
  return true;
}

export class ExecutionTimelineService {
  // Store of custom manual timeline events: eventId -> ExecutionTimelineEvent
  private customEventsStore: Map<string, ExecutionTimelineEvent> = new Map();
  // Map of eventId -> ownerUserId
  private eventOwners: Map<string, string | undefined> = new Map();
  private counter: number = 0;

  /**
   * Resets in-memory state (useful for test runs)
   */
  public reset(): void {
    this.customEventsStore.clear();
    this.eventOwners.clear();
    this.counter = 0;
  }

  /**
   * Creates a custom user execution note or milestone event.
   */
  public createCustomEvent(
    input: CreateUserNoteEventInput,
    userId?: string
  ): ExecutionTimelineEvent {
    if (!input.planId || typeof input.planId !== 'string' || input.planId.trim().length === 0) {
      throw new Error('Invalid planId: planId is mandatory.');
    }
    const planId = input.planId.trim();

    this.verifyPlanOwnership(planId, userId);

    if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
      throw new Error('Timeline event title is mandatory.');
    }
    const title = input.title.trim();
    if (title.length > 160) {
      throw new Error('Event title exceeds maximum limit of 160 characters.');
    }

    if (!input.description || typeof input.description !== 'string' || input.description.trim().length === 0) {
      throw new Error('Timeline event description is mandatory.');
    }
    const description = input.description.trim();
    if (description.length > 2000) {
      throw new Error('Event description exceeds maximum limit of 2000 characters.');
    }

    let eventDate: string | undefined = undefined;
    if (input.eventDate && typeof input.eventDate === 'string') {
      const d = input.eventDate.trim();
      if (d.length > 0) {
        if (!isValidDateString(d)) {
          throw new Error('Invalid event date format. Must be YYYY-MM-DD.');
        }
        eventDate = d;
      }
    }

    this.counter++;
    const now = new Date().toISOString();
    const id = `${planId}_tle_${Date.now()}_${this.counter}`;

    const newEvent: ExecutionTimelineEvent = {
      id,
      planId,
      actionId: input.actionId?.trim() || undefined,
      eventType: 'user_note',
      title,
      description,
      eventDate,
      recordedAt: now,
      source: 'user_manual',
      sourcePhase: 'phase_14',
      verificationStatus: 'user_recorded',
      userCreated: true
    };

    this.customEventsStore.set(id, newEvent);
    if (userId) {
      this.eventOwners.set(id, userId);
    }

    return newEvent;
  }

  /**
   * Compiles the full chronological timeline from actions, evidence, and custom events.
   */
  public getTimeline(planId: string, userId?: string): ExecutionTimelineEvent[] {
    this.verifyPlanOwnership(planId, userId);

    // 1. Fetch actions from Phase 12
    const actions = actionCenterService.hasPlan(planId)
      ? actionCenterService.getActions(planId, userId)
      : [];

    // 2. Fetch evidence from Phase 13
    const evidence = executionEvidenceService.getEvidenceByPlan(planId, userId);

    // 3. Fetch custom user events
    const customEvents: ExecutionTimelineEvent[] = [];
    for (const evt of this.customEventsStore.values()) {
      if (evt.planId === planId) {
        this.verifyEventOwnership(evt.id, userId);
        customEvents.push(evt);
      }
    }

    return buildTimelineEvents({
      planId,
      actions,
      evidenceList: evidence,
      userNotes: customEvents
    });
  }

  /**
   * Retrieves factual milestone status for the 5 implementation stages.
   */
  public getMilestones(planId: string, userId?: string): ExecutionMilestone[] {
    this.verifyPlanOwnership(planId, userId);

    const actions = actionCenterService.hasPlan(planId)
      ? actionCenterService.getActions(planId, userId)
      : [];
    const evidence = executionEvidenceService.getEvidenceByPlan(planId, userId);

    return calculateMilestones(actions, evidence);
  }

  /**
   * Computes plan health and execution blockers without numerical scores.
   */
  public getPlanHealth(planId: string, userId?: string): PlanHealthSummary {
    this.verifyPlanOwnership(planId, userId);

    const actions = actionCenterService.hasPlan(planId)
      ? actionCenterService.getActions(planId, userId)
      : [];
    const evidence = executionEvidenceService.getEvidenceByPlan(planId, userId);

    return computePlanHealth({
      planId,
      actions,
      evidenceList: evidence
    });
  }

  /**
   * Updates an existing custom user timeline event.
   */
  public updateCustomEvent(
    id: string,
    updates: UpdateUserNoteEventInput,
    userId?: string
  ): ExecutionTimelineEvent {
    const existing = this.customEventsStore.get(id);
    if (!existing) {
      throw new Error(`Timeline event with id ${id} not found.`);
    }

    this.verifyPlanOwnership(existing.planId, userId);
    this.verifyEventOwnership(id, userId);

    let newTitle = existing.title;
    if (updates.title !== undefined) {
      const t = updates.title.trim();
      if (t.length === 0) throw new Error('Event title cannot be empty.');
      if (t.length > 160) throw new Error('Event title exceeds maximum limit of 160 characters.');
      newTitle = t;
    }

    let newDescription = existing.description;
    if (updates.description !== undefined) {
      const d = updates.description.trim();
      if (d.length === 0) throw new Error('Event description cannot be empty.');
      if (d.length > 2000) throw new Error('Event description exceeds maximum limit of 2000 characters.');
      newDescription = d;
    }

    let newDate = existing.eventDate;
    if (updates.eventDate !== undefined) {
      const ed = updates.eventDate.trim();
      if (ed.length > 0) {
        if (!isValidDateString(ed)) {
          throw new Error('Invalid event date format. Must be YYYY-MM-DD.');
        }
        newDate = ed;
      } else {
        newDate = undefined;
      }
    }

    const updated: ExecutionTimelineEvent = {
      ...existing,
      title: newTitle,
      description: newDescription,
      eventDate: newDate
    };

    this.customEventsStore.set(id, updated);
    return updated;
  }

  /**
   * Deletes a custom user timeline event.
   */
  public deleteCustomEvent(id: string, userId?: string): boolean {
    const existing = this.customEventsStore.get(id);
    if (!existing) {
      return false;
    }

    this.verifyPlanOwnership(existing.planId, userId);
    this.verifyEventOwnership(id, userId);

    this.customEventsStore.delete(id);
    this.eventOwners.delete(id);
    return true;
  }

  private verifyPlanOwnership(planId: string, userId?: string) {
    const planOwner = actionCenterService.getPlanOwner(planId);
    if (planOwner && userId && planOwner !== userId) {
      throw new Error('Forbidden: You do not have permission to access or modify this execution timeline.');
    }
  }

  private verifyEventOwnership(eventId: string, userId?: string) {
    const owner = this.eventOwners.get(eventId);
    if (owner && userId && owner !== userId) {
      throw new Error('Forbidden: You do not have permission to access or modify this timeline event.');
    }
  }
}

export const executionTimelineService = new ExecutionTimelineService();
