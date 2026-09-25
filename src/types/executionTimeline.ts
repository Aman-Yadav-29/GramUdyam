/**
 * Phase 14: Execution Timeline, Milestones & Plan Health Monitoring Types
 * 
 * Strict architectural boundaries:
 * - ADDITIVE ONLY to Phases 9, 10, 11, 12, and 13.
 * - Factual chronological execution timeline and milestone monitoring.
 * - NO single numerical health score or predictive decision logic.
 * - Explicit provenance for every event, blocker, and next action.
 * - Strict non-verification: user-recorded execution items remain unverified.
 * - Does NOT alter financial figures, scheme evaluations, or upstream models.
 */

export type TimelineEventType =
  | 'action_created'
  | 'action_started'
  | 'action_completed'
  | 'action_blocked'
  | 'verification_required'
  | 'evidence_recorded'
  | 'evidence_updated'
  | 'evidence_deleted'
  | 'document_prepared'
  | 'scheme_application'
  | 'bank_appraisal'
  | 'procurement'
  | 'installation'
  | 'trial_run'
  | 'commercial_launch'
  | 'user_note';

export type TimelineEventSource =
  | 'action_center'
  | 'execution_evidence'
  | 'document_readiness'
  | 'bank_appraisal'
  | 'user_manual';

export type TimelineSourcePhase =
  | 'phase_8'
  | 'phase_11'
  | 'phase_12'
  | 'phase_13'
  | 'phase_14';

/**
 * Verification status for timeline events.
 * 
 * CRITICAL PROVENANCE RULE:
 * GramUdyam is an educational and operational decision-support system.
 * There is NO third-party government portal or banking gateway integration
 * providing legal/statutory proof. Therefore, NO event may claim 'official_declaration'.
 * All events are either 'user_recorded' (entrepreneur self-attested) or
 * 'needs_official_verification' (action requires field verification by competent authorities).
 */
export type TimelineVerificationStatus =
  | 'user_recorded'
  | 'needs_official_verification';

export interface ExecutionTimelineEvent {
  id: string;
  planId: string;
  actionId?: string;
  evidenceId?: string;

  eventType: TimelineEventType;
  title: string;
  description: string;

  /**
   * Actual date the event occurred in the physical world (if known).
   * Format: YYYY-MM-DD. Never silently set to system timestamp.
   */
  eventDate?: string;

  /**
   * System timestamp when the event was recorded in GramUdyam.
   */
  recordedAt: string;

  /**
   * Planned target completion date (if supplied in source action).
   */
  plannedDate?: string;

  source: TimelineEventSource;
  sourcePhase: TimelineSourcePhase;
  sourceRecordId?: string;
  verificationStatus: TimelineVerificationStatus;
  userCreated: boolean;

  metadata?: Record<string, string | number | boolean | undefined>;
}

export type ExecutionState =
  | 'not_started'
  | 'active'
  | 'progressing'
  | 'blocked'
  | 'awaiting_verification'
  | 'substantially_completed';

export interface ExecutionMilestone {
  id: string;
  stageNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  totalActions: number;
  completedActions: number;
  inProgressActions: number;
  blockedActions: number;
  needsVerificationActions: number;
  notStartedActions: number;
  evidenceRecordsCount: number;
  isComplete: boolean;
}

export interface ExecutionBlocker {
  id: string;
  title: string;
  reason: string;
  category:
    | 'action_blocked'
    | 'verification_unresolved'
    | 'document_required'
    | 'bank_appraisal_pending'
    | 'site_feasibility_pending';
  sourcePhase: TimelineSourcePhase;
  actionId?: string;
  priority: 'important' | 'normal';
}

export interface NextActionItem {
  id: string;
  title: string;
  reason: string;
  category: string;
  priority: 'important' | 'normal';
  status: string;
  dueDate?: string;
  sourcePhase: TimelineSourcePhase;
}

export interface PlanHealthSummary {
  planId: string;
  executionState: ExecutionState;
  stateExplanation: string;

  // Factual Action Metrics
  totalActionsCount: number;
  completedCount: number;
  inProgressCount: number;
  blockedCount: number;
  needsVerificationCount: number;
  notStartedCount: number;

  // Evidence Counts
  evidenceCount: number;

  // Document Readiness Factual Counts (from Phase 8 if present)
  requiredDocumentsCount: number;
  availableDocumentsCount: number;
  pendingDocumentsCount: number;

  blockers: ExecutionBlocker[];
  nextActions: NextActionItem[];
  milestones: ExecutionMilestone[];
}

export interface CreateUserNoteEventInput {
  planId: string;
  actionId?: string;
  title: string;
  description: string;
  eventDate?: string;
}

export interface UpdateUserNoteEventInput {
  title?: string;
  description?: string;
  eventDate?: string;
}

export const TIMELINE_DISCLAIMER =
  'Execution timeline and plan health indicators are user-recorded and operational monitoring metrics. They do not constitute official statutory compliance, bank credit sanction, or scheme subsidy approval.';

export const EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  action_created: 'Action Initialized',
  action_started: 'Action In Progress',
  action_completed: 'Action Completed',
  action_blocked: 'Action Blocked',
  verification_required: 'On-Ground Verification Needed',
  evidence_recorded: 'Execution Evidence Recorded',
  evidence_updated: 'Execution Evidence Updated',
  evidence_deleted: 'Execution Evidence Removed',
  document_prepared: 'Statutory Document Prepared',
  scheme_application: 'Government Scheme Application',
  bank_appraisal: 'Bank Appraisal Milestone',
  procurement: 'Machinery Procurement',
  installation: 'Plant Installation & Utilities',
  trial_run: 'Trial Production Run',
  commercial_launch: 'Commercial Market Launch',
  user_note: 'User Execution Note'
};

export const EXECUTION_STATE_LABELS: Record<ExecutionState, string> = {
  not_started: 'Not Started — Initial Planning Stage',
  active: 'Active — Initial Tasks Underway',
  progressing: 'Progressing — Steady Implementation',
  blocked: 'Attention Required — Explicit Action Blocked',
  awaiting_verification: 'Awaiting On-Ground Verification',
  substantially_completed: 'Substantially Completed — Nearing Commercial Launch'
};
