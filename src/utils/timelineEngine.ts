/**
 * Phase 14: Execution Timeline, Milestones & Plan Health Engine
 * 
 * Sourced strictly and additively from:
 * - Phase 8: Document Readiness Declarations
 * - Phase 11: Bank Credit Appraisal Dossier
 * - Phase 12: Action Center Monitored Tasks
 * - Phase 13: Execution Evidence Records
 * - Phase 14: User Manual Execution Notes
 * 
 * Strict invariants:
 * - No numerical health scores or completion ratings.
 * - Explicit provenance for every generated event and blocker.
 * - Real chronological dates vs recorded timestamps preserved.
 * - Multi-tenant safe, zero financial mutation.
 */

import { BusinessPlanAction, ActionStatus, ActionPriority } from '../types/actionCenter.ts';
import { ExecutionEvidence } from '../types/executionEvidence.ts';
import {
  ExecutionTimelineEvent,
  ExecutionMilestone,
  ExecutionBlocker,
  NextActionItem,
  PlanHealthSummary,
  ExecutionState,
  TIMELINE_DISCLAIMER,
  EVENT_TYPE_LABELS,
  EXECUTION_STATE_LABELS
} from '../types/executionTimeline.ts';

export interface GenerateTimelineParams {
  planId: string;
  actions: BusinessPlanAction[];
  evidenceList?: ExecutionEvidence[];
  userNotes?: ExecutionTimelineEvent[];
  documentDeclarations?: Record<string, { declaredStatus: string; documentTitle?: string }>;
  bankAppraisalDossier?: any;
}

/**
 * Stage definitions mapping cleanly to Action Center categories.
 */
export const STAGE_CONFIGS: Array<{
  stageNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  categories: string[];
}> = [
  {
    stageNumber: 1,
    title: 'Site Feasibility & Local Verification',
    description: 'Ground assessment of industrial power, water source, road access, and local mandi feasibility.',
    categories: ['site_verification', 'local_verification']
  },
  {
    stageNumber: 2,
    title: 'Statutory Registration & KYC Documentation',
    description: 'Udyam MSME registration, FSSAI / PCB regulatory licenses, PAN/Aadhaar KYC compilation.',
    categories: ['business_setup', 'documents']
  },
  {
    stageNumber: 3,
    title: 'Bank Credit Appraisal & Scheme Sanction',
    description: 'DPR submission, Lead Bank desk review, margin contribution verification, and PMEGP/CGFMU guarantee filing.',
    categories: ['finance', 'scheme']
  },
  {
    stageNumber: 4,
    title: 'Machinery Procurement & Site Installation',
    description: 'Supplier quotation finalization, commercial power connection, machinery dispatch, and civil foundation.',
    categories: ['procurement']
  },
  {
    stageNumber: 5,
    title: 'Trial Run & Commercial Market Launch',
    description: 'Raw material procurement, machinery trial batch production, packaging quality check, and market rollout.',
    categories: ['operations']
  }
];

/**
 * Builds chronological timeline events traceably from actions and evidence.
 */
export function buildTimelineEvents(params: GenerateTimelineParams): ExecutionTimelineEvent[] {
  const { planId, actions, evidenceList = [], userNotes = [], documentDeclarations } = params;
  const events: ExecutionTimelineEvent[] = [];

  // 1. Synthesize events from Action Center items
  actions.forEach((act) => {
    // A. Action Creation Event
    events.push({
      id: `${act.id}_evt_created`,
      planId,
      actionId: act.id,
      eventType: 'action_created',
      title: `Task Initialized: ${act.title}`,
      description: act.description || `Monitored implementation activity in ${act.category}.`,
      eventDate: act.dueDate ? undefined : undefined,
      recordedAt: act.createdAt || new Date().toISOString(),
      plannedDate: act.dueDate,
      source: 'action_center',
      sourcePhase: 'phase_12',
      sourceRecordId: act.id,
      verificationStatus: 'user_recorded',
      userCreated: act.source === 'user_added',
      metadata: {
        category: act.category,
        priority: act.priority,
        status: act.status,
        guidanceType: act.guidanceType
      }
    });

    // B. Action Status Transitions (started, completed, blocked, verification)
    if (act.status === 'in_progress') {
      events.push({
        id: `${act.id}_evt_started`,
        planId,
        actionId: act.id,
        eventType: 'action_started',
        title: `Work Commenced: ${act.title}`,
        description: act.notes || 'Activity marked as currently underway.',
        eventDate: undefined,
        recordedAt: act.updatedAt || act.createdAt || new Date().toISOString(),
        source: 'action_center',
        sourcePhase: 'phase_12',
        sourceRecordId: act.id,
        verificationStatus: 'user_recorded',
        userCreated: false
      });
    } else if (act.status === 'completed') {
      let completedEvtType: ExecutionTimelineEvent['eventType'] = 'action_completed';
      if (act.id.includes('act_p9_po_disbursement') || act.id.includes('act_p8_quotations')) {
        completedEvtType = 'procurement';
      } else if (act.id.includes('act_p9_installation')) {
        completedEvtType = 'installation';
      } else if (act.id.includes('act_p9_trial_run')) {
        completedEvtType = 'trial_run';
      } else if (act.id.includes('act_p9_market_launch')) {
        completedEvtType = 'commercial_launch';
      } else if (act.id.includes('act_p4_appraisal')) {
        completedEvtType = 'bank_appraisal';
      } else if (act.id.includes('act_p7_portal_filing')) {
        completedEvtType = 'scheme_application';
      }

      events.push({
        id: `${act.id}_evt_completed`,
        planId,
        actionId: act.id,
        eventType: completedEvtType,
        title: `Completed: ${act.title}`,
        description: act.notes || act.verificationDetails?.findingNotes || 'Activity marked as successfully completed.',
        eventDate: act.verificationDetails?.verifiedAt ? act.verificationDetails.verifiedAt.split('T')[0] : undefined,
        recordedAt: act.updatedAt || act.createdAt || new Date().toISOString(),
        source: 'action_center',
        sourcePhase: 'phase_12',
        sourceRecordId: act.id,
        verificationStatus: 'user_recorded',
        userCreated: false,
        metadata: {
          verificationMethod: act.verificationDetails?.method,
          findingNotes: act.verificationDetails?.findingNotes
        }
      });
    } else if (act.status === 'blocked') {
      events.push({
        id: `${act.id}_evt_blocked`,
        planId,
        actionId: act.id,
        eventType: 'action_blocked',
        title: `Action Blocked: ${act.title}`,
        description: act.notes || 'Activity encountered an execution hurdle and is flagged as blocked.',
        eventDate: undefined,
        recordedAt: act.updatedAt || act.createdAt || new Date().toISOString(),
        source: 'action_center',
        sourcePhase: 'phase_12',
        sourceRecordId: act.id,
        verificationStatus: 'user_recorded',
        userCreated: false
      });
    } else if (act.status === 'needs_verification') {
      events.push({
        id: `${act.id}_evt_needs_verif`,
        planId,
        actionId: act.id,
        eventType: 'verification_required',
        title: `On-Ground Check Required: ${act.title}`,
        description: act.description || 'Requires local agency, DISCOM, or mandi field inspection.',
        eventDate: undefined,
        recordedAt: act.updatedAt || act.createdAt || new Date().toISOString(),
        source: 'action_center',
        sourcePhase: 'phase_12',
        sourceRecordId: act.id,
        verificationStatus: 'needs_official_verification',
        userCreated: false
      });
    }
  });

  // 2. Synthesize events from Phase 13 Execution Evidence records
  // Strict non-inflation: An evidence record (quotation, application reference, document submission)
  // is strictly typed as 'evidence_recorded'. It does NOT claim procurement completed or scheme approved.
  evidenceList.forEach((evi) => {
    const evtType: ExecutionTimelineEvent['eventType'] = 'evidence_recorded';

    events.push({
      id: `${evi.id}_evt`,
      planId,
      actionId: evi.actionId,
      evidenceId: evi.id,
      eventType: evtType,
      title: `${evi.title}`,
      description: `${evi.description}${evi.referenceNumber ? ` (Ref: ${evi.referenceNumber})` : ''}`,
      eventDate: evi.eventDate, // Actual user-recorded event date
      recordedAt: evi.createdAt || new Date().toISOString(),
      source: 'execution_evidence',
      sourcePhase: 'phase_13',
      sourceRecordId: evi.id,
      verificationStatus: evi.verificationStatus || 'user_recorded',
      userCreated: true,
      metadata: {
        evidenceType: evi.type,
        referenceNumber: evi.referenceNumber,
        disclaimer: evi.disclaimer
      }
    });
  });

  // 3. Synthesize events from Phase 8 Document Readiness (if any declared)
  if (documentDeclarations) {
    Object.entries(documentDeclarations).forEach(([docKey, decl]) => {
      if (decl.declaredStatus === 'ready' || decl.declaredStatus === 'verified') {
        events.push({
          id: `${docKey}_evt_doc`,
          planId,
          eventType: 'document_prepared',
          title: `Document Compiled: ${decl.documentTitle || docKey}`,
          description: `User declared document availability in Phase 8 checklist.`,
          recordedAt: new Date().toISOString(),
          source: 'document_readiness',
          sourcePhase: 'phase_8',
          sourceRecordId: docKey,
          verificationStatus: 'user_recorded',
          userCreated: false
        });
      }
    });
  }

  // 4. Incorporate Phase 14 User Manual Execution Notes
  userNotes.forEach((un) => {
    events.push({
      ...un,
      source: 'user_manual',
      sourcePhase: 'phase_14',
      verificationStatus: 'user_recorded',
      userCreated: true
    });
  });

  // 5. Chronological Sort:
  // Prefer eventDate if present; fallback to recordedAt.
  return events.sort((a, b) => {
    const timeA = a.eventDate ? `${a.eventDate}T00:00:00.000Z` : a.recordedAt;
    const timeB = b.eventDate ? `${b.eventDate}T00:00:00.000Z` : b.recordedAt;
    return timeB.localeCompare(timeA); // Newest first by default
  });
}

/**
 * Calculates factual milestone statistics for the 5 implementation stages.
 * Zero score calculation: only returns exact integer counts.
 */
export function calculateMilestones(
  actions: BusinessPlanAction[],
  evidenceList: ExecutionEvidence[] = []
): ExecutionMilestone[] {
  return STAGE_CONFIGS.map((stage) => {
    const stageActions = actions.filter((a) => stage.categories.includes(a.category));
    const stageActionIds = new Set(stageActions.map((a) => a.id));
    const stageEvidence = evidenceList.filter((e) => stageActionIds.has(e.actionId));

    const total = stageActions.length;
    const completed = stageActions.filter((a) => a.status === 'completed').length;
    const inProgress = stageActions.filter((a) => a.status === 'in_progress').length;
    const blocked = stageActions.filter((a) => a.status === 'blocked').length;
    const needsVerification = stageActions.filter((a) => a.status === 'needs_verification').length;
    const notStarted = stageActions.filter((a) => a.status === 'not_started').length;

    return {
      id: `stage_${stage.stageNumber}`,
      stageNumber: stage.stageNumber,
      title: stage.title,
      description: stage.description,
      totalActions: total,
      completedActions: completed,
      inProgressActions: inProgress,
      blockedActions: blocked,
      needsVerificationActions: needsVerification,
      notStartedActions: notStarted,
      evidenceRecordsCount: stageEvidence.length,
      isComplete: total > 0 && completed === total
    };
  });
}

/**
 * Discovers explicit, non-inferred blockers from existing action & document states.
 */
export function detectBlockers(
  actions: BusinessPlanAction[],
  documentDeclarations?: Record<string, { declaredStatus: string; documentTitle?: string }>
): ExecutionBlocker[] {
  const blockers: ExecutionBlocker[] = [];

  // 1. Explicitly Blocked Actions
  actions
    .filter((a) => a.status === 'blocked')
    .forEach((a) => {
      blockers.push({
        id: `blk_act_${a.id}`,
        title: a.title,
        reason: a.notes || 'Action is flagged as blocked in Action Center. Follow-up required.',
        category: 'action_blocked',
        sourcePhase: 'phase_12',
        actionId: a.id,
        priority: a.priority
      });
    });

  // 2. Unresolved Needs Verification Actions
  actions
    .filter((a) => a.status === 'needs_verification')
    .forEach((a) => {
      blockers.push({
        id: `blk_verif_${a.id}`,
        title: `Verification Pending: ${a.title}`,
        reason: a.description || 'On-ground field or utility inspection has not yet been documented.',
        category: 'verification_unresolved',
        sourcePhase: 'phase_12',
        actionId: a.id,
        priority: a.priority
      });
    });

  // 3. Missing Mandatory Documents from Phase 8
  if (documentDeclarations) {
    Object.entries(documentDeclarations).forEach(([docKey, decl]) => {
      if (decl.declaredStatus === 'missing' || decl.declaredStatus === 'required_not_started') {
        blockers.push({
          id: `blk_doc_${docKey}`,
          title: `Required Document Missing: ${decl.documentTitle || docKey}`,
          reason: 'Statutory or bank appraisal document is flagged as missing.',
          category: 'document_required',
          sourcePhase: 'phase_8',
          priority: 'important'
        });
      }
    });
  }

  return blockers;
}

/**
 * Extracts factual next actions without subjective or numerical re-ranking.
 */
export function extractNextActions(actions: BusinessPlanAction[]): NextActionItem[] {
  // Collect all actionable pending tasks
  const pending = actions.filter((a) => a.status !== 'completed');

  // Preserve Phase 12 explicit priority: important items first, then normal
  const sorted = [...pending].sort((a, b) => {
    if (a.priority === 'important' && b.priority !== 'important') return -1;
    if (a.priority !== 'important' && b.priority === 'important') return 1;
    return 0;
  });

  return sorted.slice(0, 8).map((act) => {
    let reason = 'Action task pending in implementation checklist.';
    if (act.status === 'needs_verification') {
      reason = 'Requires physical verification with local authority or supplier.';
    } else if (act.status === 'in_progress') {
      reason = 'Execution currently underway.';
    } else if (act.status === 'blocked') {
      reason = 'Flagged as blocked — requires resolution before proceeding.';
    } else if (act.priority === 'important') {
      reason = 'High-priority task identified in business plan.';
    }

    return {
      id: act.id,
      title: act.title,
      reason,
      category: act.category,
      priority: act.priority,
      status: act.status,
      dueDate: act.dueDate,
      sourcePhase: 'phase_12'
    };
  });
}

/**
 * Computes transparent plan health summary without a single numerical score.
 */
export function computePlanHealth(params: GenerateTimelineParams): PlanHealthSummary {
  const { planId, actions, evidenceList = [], documentDeclarations } = params;

  const totalActions = actions.length;
  const completed = actions.filter((a) => a.status === 'completed').length;
  const inProgress = actions.filter((a) => a.status === 'in_progress').length;
  const blocked = actions.filter((a) => a.status === 'blocked').length;
  const needsVerification = actions.filter((a) => a.status === 'needs_verification').length;
  const notStarted = actions.filter((a) => a.status === 'not_started').length;

  const blockers = detectBlockers(actions, documentDeclarations);
  const nextActions = extractNextActions(actions);
  const milestones = calculateMilestones(actions, evidenceList);

  // Document Readiness Factual Counts
  let requiredDocs = 0;
  let availableDocs = 0;
  let pendingDocs = 0;
  if (documentDeclarations) {
    Object.values(documentDeclarations).forEach((d) => {
      requiredDocs++;
      if (d.declaredStatus === 'ready' || d.declaredStatus === 'verified') {
        availableDocs++;
      } else {
        pendingDocs++;
      }
    });
  }

  // Determine transparent execution state with explanatory reasoning
  let executionState: ExecutionState = 'not_started';
  let stateExplanation = 'No implementation actions have been commenced yet.';

  if (blocked > 0) {
    executionState = 'blocked';
    stateExplanation = `Action required: ${blocked} action ${blocked === 1 ? 'task is' : 'tasks are'} currently flagged as blocked.`;
  } else if (needsVerification > 0 && completed === 0 && inProgress === 0) {
    executionState = 'awaiting_verification';
    stateExplanation = `Awaiting verification: ${needsVerification} on-ground field or utility checks require verification before work proceeds.`;
  } else if (totalActions > 0 && completed === totalActions) {
    executionState = 'substantially_completed';
    stateExplanation = `All ${totalActions} planned execution tasks have been recorded as completed. Ready for commercial rollout.`;
  } else if (totalActions > 0 && completed / totalActions >= 0.75) {
    executionState = 'substantially_completed';
    stateExplanation = `Substantially completed: ${completed} of ${totalActions} actions finished. Final launch preparation active.`;
  } else if (completed > 0 || inProgress > 0) {
    executionState = 'progressing';
    stateExplanation = `Progressing: ${completed} completed, ${inProgress} in progress out of ${totalActions} total actions.`;
  } else if (actions.length > 0) {
    executionState = 'active';
    stateExplanation = `Action center initialized with ${totalActions} monitored implementation tasks.`;
  }

  return {
    planId,
    executionState,
    stateExplanation,
    totalActionsCount: totalActions,
    completedCount: completed,
    inProgressCount: inProgress,
    blockedCount: blocked,
    needsVerificationCount: needsVerification,
    notStartedCount: notStarted,
    evidenceCount: evidenceList.length,
    requiredDocumentsCount: requiredDocs,
    availableDocumentsCount: availableDocs,
    pendingDocumentsCount: pendingDocs,
    blockers,
    nextActions,
    milestones
  };
}

/**
 * Generates formatted plain-text export for printing and download.
 */
export function generateTimelineExportText(
  planTitle: string,
  healthSummary: PlanHealthSummary,
  events: ExecutionTimelineEvent[]
): string {
  const lines: string[] = [];

  lines.push('========================================================================');
  lines.push(`GRAMUDYAM EXECUTION TIMELINE & PLAN HEALTH REPORT`);
  lines.push(`Plan: ${planTitle}`);
  lines.push(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`);
  lines.push('========================================================================\n');

  lines.push('--- PLAN HEALTH & EXECUTION STATE ---');
  lines.push(`Current State:   ${EXECUTION_STATE_LABELS[healthSummary.executionState]}`);
  lines.push(`Status Detail:   ${healthSummary.stateExplanation}`);
  lines.push(`Total Actions:   ${healthSummary.totalActionsCount}`);
  lines.push(`Completed:       ${healthSummary.completedCount}`);
  lines.push(`In Progress:     ${healthSummary.inProgressCount}`);
  lines.push(`Needs Checking:  ${healthSummary.needsVerificationCount}`);
  lines.push(`Blocked:         ${healthSummary.blockedCount}`);
  lines.push(`Not Started:     ${healthSummary.notStartedCount}`);
  lines.push(`Evidence Records:${healthSummary.evidenceCount} user-recorded items\n`);

  lines.push('--- IMPLEMENTATION MILESTONES (STAGES 1 TO 5) ---');
  healthSummary.milestones.forEach((m) => {
    const statusTag = m.isComplete ? '[COMPLETED]' : `[${m.completedActions}/${m.totalActions} DONE]`;
    lines.push(`Stage ${m.stageNumber}: ${statusTag} ${m.title}`);
    lines.push(`  ${m.description}`);
    lines.push(
      `  Factual counts: ${m.completedActions} completed, ${m.inProgressActions} in progress, ${m.blockedActions} blocked, ${m.evidenceRecordsCount} evidence attached.`
    );
  });
  lines.push('');

  if (healthSummary.blockers.length > 0) {
    lines.push('--- ACTIVE BLOCKERS & UNRESOLVED ITEMS ---');
    healthSummary.blockers.forEach((b, idx) => {
      lines.push(`${idx + 1}. [BLOCKER] ${b.title}`);
      lines.push(`   Reason: ${b.reason}`);
      lines.push(`   Source: ${b.sourcePhase} | Priority: ${b.priority.toUpperCase()}`);
    });
    lines.push('');
  }

  if (healthSummary.nextActions.length > 0) {
    lines.push('--- RECOMMENDED NEXT ACTIONS ---');
    healthSummary.nextActions.forEach((a, idx) => {
      const prio = a.priority === 'important' ? '★ IMPORTANT' : 'NORMAL';
      lines.push(`${idx + 1}. ${a.title} (${prio})`);
      lines.push(`   Status: ${a.status.toUpperCase()} | Reason: ${a.reason}`);
      if (a.dueDate) lines.push(`   Due: ${a.dueDate}`);
    });
    lines.push('');
  }

  lines.push('--- CHRONOLOGICAL EXECUTION TIMELINE ---');
  if (events.length === 0) {
    lines.push('No execution events recorded yet.');
  } else {
    events.forEach((evt, idx) => {
      const dateDisplay = evt.eventDate
        ? `[Event Date: ${evt.eventDate}]`
        : `[Recorded: ${new Date(evt.recordedAt).toLocaleDateString('en-IN')}]`;
      const typeLabel = EVENT_TYPE_LABELS[evt.eventType] || evt.eventType;

      lines.push(`${idx + 1}. ${dateDisplay} ${typeLabel}: ${evt.title}`);
      lines.push(`   Details: ${evt.description}`);
      lines.push(`   Source: ${evt.source} (${evt.sourcePhase}) | Verification: ${evt.verificationStatus}`);
      lines.push('');
    });
  }

  lines.push('========================================================================');
  lines.push('STATUTORY ADVISORY & MONITORING DISCLOSURE');
  lines.push('------------------------------------------------------------------------');
  lines.push(TIMELINE_DISCLAIMER);
  lines.push('GramUdyam is an educational decision-support engine. Execution milestones');
  lines.push('and health indicators reflect user-entered tracking data and domain guidelines.');
  lines.push('They do not represent statutory verification, bank credit guarantee, or official');
  lines.push('subsidy approval by state or central agencies.');
  lines.push('========================================================================');

  return lines.join('\n');
}
