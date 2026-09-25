import { BusinessPlan, SavedBusinessPlanRecord, BusinessPlanNarrativeSection } from '../types/businessPlan.ts';

const GUEST_STORAGE_KEY = 'gramudyam_guest_saved_plans_v1';

function isStorageAvailable(): boolean {
  try {
    const test = '__gramudyam_storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getGuestSavedPlans(): SavedBusinessPlanRecord[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestPlan(plan: BusinessPlan, title?: string): SavedBusinessPlanRecord {
  const existingPlans = getGuestSavedPlans();
  const existingIndex = existingPlans.findIndex((p) => p.id === plan.id);
  const now = new Date().toISOString();

  const existing = existingIndex >= 0 ? existingPlans[existingIndex] : undefined;
  const cleanTitle = (typeof title === 'string' && title.trim().length > 0)
    ? title.trim().substring(0, 120)
    : existing?.title || `${plan.business.businessName} — ₹${plan.financials.availableCapital.toLocaleString('en-IN')} Capital`;

  const record: SavedBusinessPlanRecord = {
    id: plan.id,
    isGuest: true,
    title: cleanTitle,
    status: existing?.status || 'active',
    planVersion: plan.version || '1.0.0',
    narrativeEditable: true,
    shareSettings: existing?.shareSettings || { isShared: false },
    businessId: plan.business.businessId,
    businessName: plan.business.businessName,
    projectCost: plan.financials.totalProjectCost,
    availableCapital: plan.financials.availableCapital,
    financingGap: plan.financials.financingGap,
    state: plan.location?.state || '',
    district: plan.location?.district || '',
    plan,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    existingPlans[existingIndex] = record;
  } else {
    existingPlans.unshift(record);
  }

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(existingPlans));
    } catch {
      // quota or storage error
    }
  }

  return record;
}

export function getGuestPlanById(id: string): SavedBusinessPlanRecord | undefined {
  const plans = getGuestSavedPlans();
  return plans.find((p) => p.id === id);
}

export function updateGuestPlanNarrative(
  id: string,
  narrative: BusinessPlanNarrativeSection
): SavedBusinessPlanRecord | undefined {
  const plans = getGuestSavedPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index < 0) return undefined;

  const record = plans[index];
  const updatedNarrative: BusinessPlanNarrativeSection = {
    businessObjectives: typeof narrative.businessObjectives === 'string'
      ? narrative.businessObjectives.trim().substring(0, 1000)
      : record.plan.narrative?.businessObjectives,
    targetCustomersAndMarket: typeof narrative.targetCustomersAndMarket === 'string'
      ? narrative.targetCustomersAndMarket.trim().substring(0, 1000)
      : record.plan.narrative?.targetCustomersAndMarket,
    operationalNotes: typeof narrative.operationalNotes === 'string'
      ? narrative.operationalNotes.trim().substring(0, 1000)
      : record.plan.narrative?.operationalNotes,
    promoterRemarks: typeof narrative.promoterRemarks === 'string'
      ? narrative.promoterRemarks.trim().substring(0, 1000)
      : record.plan.narrative?.promoterRemarks,
    lastEditedAt: new Date().toISOString()
  };

  record.plan.narrative = updatedNarrative;
  record.updatedAt = new Date().toISOString();
  plans[index] = record;

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // ignore
    }
  }

  return record;
}

export function updateGuestPlanStatus(
  id: string,
  status: 'active' | 'archived'
): SavedBusinessPlanRecord | undefined {
  const plans = getGuestSavedPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index < 0) return undefined;

  const record = plans[index];
  record.status = status;
  record.updatedAt = new Date().toISOString();
  plans[index] = record;

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // ignore
    }
  }

  return record;
}

export function updateGuestPlanTitle(
  id: string,
  title: string
): SavedBusinessPlanRecord | undefined {
  const plans = getGuestSavedPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index < 0) return undefined;

  const record = plans[index];
  record.title = title.trim().substring(0, 120);
  record.updatedAt = new Date().toISOString();
  plans[index] = record;

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // ignore
    }
  }

  return record;
}

export function deleteGuestPlan(id: string): boolean {
  const plans = getGuestSavedPlans();
  const filtered = plans.filter((p) => p.id !== id);
  const planExisted = filtered.length !== plans.length;

  if (isStorageAvailable()) {
    try {
      if (planExisted) {
        window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(filtered));
      }
      // Also clean up any associated actions, evidence, and timeline for this deleted plan
      window.localStorage.removeItem(`gramudyam_guest_actions_${id}`);
      window.localStorage.removeItem(`gramudyam_guest_evidence_${id}`);
      window.localStorage.removeItem(`gramudyam_guest_timeline_${id}`);
    } catch {
      // ignore
    }
  }

  return planExisted || true;
}

// ==========================================
// Phase 12: Guest Action Center Persistence
// ==========================================
import { BusinessPlanAction } from '../types/actionCenter.ts';

const GUEST_ACTIONS_PREFIX = 'gramudyam_guest_actions_';

export function getGuestPlanActions(planId: string): BusinessPlanAction[] {
  if (!isStorageAvailable() || !planId) return [];
  try {
    const raw = window.localStorage.getItem(`${GUEST_ACTIONS_PREFIX}${planId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestPlanActions(planId: string, actions: BusinessPlanAction[]): void {
  if (!isStorageAvailable() || !planId) return;
  try {
    window.localStorage.setItem(`${GUEST_ACTIONS_PREFIX}${planId}`, JSON.stringify(actions));
  } catch {
    // quota or storage error
  }
}

export function updateGuestPlanAction(
  planId: string,
  actionId: string,
  updates: Partial<BusinessPlanAction>
): BusinessPlanAction | undefined {
  const actions = getGuestPlanActions(planId);
  const index = actions.findIndex((a) => a.id === actionId);
  if (index < 0) return undefined;

  const existing = actions[index];
  const now = new Date().toISOString();
  const updated: BusinessPlanAction = {
    ...existing,
    ...updates,
    id: existing.id,
    planId: existing.planId,
    createdAt: existing.createdAt,
    updatedAt: now
  };

  actions[index] = updated;
  saveGuestPlanActions(planId, actions);
  return updated;
}

export function addGuestPlanAction(
  planId: string,
  actionData: Partial<BusinessPlanAction>
): BusinessPlanAction {
  const actions = getGuestPlanActions(planId);
  const now = new Date().toISOString();
  const newAction: BusinessPlanAction = {
    id: actionData.id || `${planId}_act_usr_${Date.now()}`,
    planId,
    title: (actionData.title || 'New Action Task').trim().substring(0, 160),
    description: actionData.description?.trim().substring(0, 1000),
    category: actionData.category || 'business_setup',
    source: 'user_added',
    sourceLabel: 'User Added Custom Action',
    sourceField: 'User Input / Custom Activity',
    guidanceType: 'user_added',
    status: actionData.status || 'not_started',
    priority: actionData.priority || 'normal',
    dueDate: actionData.dueDate,
    evidence: actionData.evidence,
    notes: actionData.notes,
    verificationDetails: actionData.verificationDetails,
    createdAt: now,
    updatedAt: now
  };

  actions.push(newAction);
  saveGuestPlanActions(planId, actions);
  return newAction;
}

export function deleteGuestPlanAction(planId: string, actionId: string): boolean {
  const actions = getGuestPlanActions(planId);
  const filtered = actions.filter((a) => a.id !== actionId);
  if (filtered.length === actions.length) return false;

  saveGuestPlanActions(planId, filtered);
  return true;
}

// ==========================================
// Phase 13: Guest Execution Evidence Persistence
// ==========================================
import {
  ExecutionEvidence,
  CreateEvidenceInput,
  UpdateEvidenceInput,
  EVIDENCE_USER_DISCLAIMER
} from '../types/executionEvidence.ts';

const GUEST_EVIDENCE_PREFIX = 'gramudyam_guest_evidence_';

export function getGuestPlanEvidence(planId: string): ExecutionEvidence[] {
  if (!isStorageAvailable() || !planId) return [];
  try {
    const raw = window.localStorage.getItem(`${GUEST_EVIDENCE_PREFIX}${planId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => {
      const dateA = a.eventDate || a.createdAt;
      const dateB = b.eventDate || b.createdAt;
      return dateB.localeCompare(dateA);
    });
  } catch {
    return [];
  }
}

export function saveGuestPlanEvidence(planId: string, records: ExecutionEvidence[]): void {
  if (!isStorageAvailable() || !planId) return;
  try {
    window.localStorage.setItem(`${GUEST_EVIDENCE_PREFIX}${planId}`, JSON.stringify(records));
  } catch {
    // quota or storage error
  }
}

export function getGuestActionEvidence(actionId: string, planId: string): ExecutionEvidence[] {
  const planRecords = getGuestPlanEvidence(planId);
  return planRecords.filter((r) => r.actionId === actionId);
}

export function addGuestActionEvidence(input: CreateEvidenceInput): ExecutionEvidence {
  const planRecords = getGuestPlanEvidence(input.planId);
  const now = new Date().toISOString();
  const id = `${input.planId}_evi_${Date.now()}_${planRecords.length + 1}`;

  const newRecord: ExecutionEvidence = {
    id,
    actionId: input.actionId,
    planId: input.planId,
    type: input.type,
    title: input.title.trim().substring(0, 160),
    description: input.description.trim().substring(0, 2000),
    referenceNumber: input.referenceNumber?.trim().substring(0, 80) || undefined,
    eventDate: input.eventDate?.trim() || undefined,
    source: 'user_recorded',
    verificationStatus: 'user_recorded',
    disclaimer: EVIDENCE_USER_DISCLAIMER,
    createdAt: now,
    updatedAt: now
  };

  planRecords.unshift(newRecord);
  saveGuestPlanEvidence(input.planId, planRecords);
  return newRecord;
}

export function updateGuestActionEvidence(
  id: string,
  planId: string,
  updates: UpdateEvidenceInput
): ExecutionEvidence | undefined {
  const planRecords = getGuestPlanEvidence(planId);
  const index = planRecords.findIndex((r) => r.id === id);
  if (index < 0) return undefined;

  const existing = planRecords[index];
  const now = new Date().toISOString();

  const updated: ExecutionEvidence = {
    ...existing,
    type: updates.type || existing.type,
    title: updates.title !== undefined ? updates.title.trim().substring(0, 160) : existing.title,
    description: updates.description !== undefined ? updates.description.trim().substring(0, 2000) : existing.description,
    referenceNumber: updates.referenceNumber !== undefined ? (updates.referenceNumber.trim().substring(0, 80) || undefined) : existing.referenceNumber,
    eventDate: updates.eventDate !== undefined ? (updates.eventDate.trim() || undefined) : existing.eventDate,
    updatedAt: now
  };

  planRecords[index] = updated;
  saveGuestPlanEvidence(planId, planRecords);
  return updated;
}

export function deleteGuestActionEvidence(id: string, planId: string): boolean {
  const planRecords = getGuestPlanEvidence(planId);
  const filtered = planRecords.filter((r) => r.id !== id);
  if (filtered.length === planRecords.length) return false;

  saveGuestPlanEvidence(planId, filtered);
  return true;
}

// ==========================================
// Phase 14: Guest Timeline Persistence
// ==========================================
import {
  ExecutionTimelineEvent,
  CreateUserNoteEventInput,
  UpdateUserNoteEventInput
} from '../types/executionTimeline.ts';

const GUEST_TIMELINE_PREFIX = 'gramudyam_guest_timeline_';

export function getGuestTimelineEvents(planId: string): ExecutionTimelineEvent[] {
  if (!isStorageAvailable() || !planId) return [];
  try {
    const raw = window.localStorage.getItem(`${GUEST_TIMELINE_PREFIX}${planId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveGuestTimelineEvents(planId: string, events: ExecutionTimelineEvent[]): void {
  if (!isStorageAvailable() || !planId) return;
  try {
    window.localStorage.setItem(`${GUEST_TIMELINE_PREFIX}${planId}`, JSON.stringify(events));
  } catch {
    // quota or storage error
  }
}

export function addGuestTimelineEvent(input: CreateUserNoteEventInput): ExecutionTimelineEvent {
  const events = getGuestTimelineEvents(input.planId);
  const now = new Date().toISOString();
  const id = `${input.planId}_tle_${Date.now()}_${events.length + 1}`;

  const newEvent: ExecutionTimelineEvent = {
    id,
    planId: input.planId,
    actionId: input.actionId,
    eventType: 'user_note',
    title: input.title.trim().substring(0, 160),
    description: input.description.trim().substring(0, 2000),
    eventDate: input.eventDate?.trim() || undefined,
    recordedAt: now,
    source: 'user_manual',
    sourcePhase: 'phase_14',
    verificationStatus: 'user_recorded',
    userCreated: true
  };

  events.unshift(newEvent);
  saveGuestTimelineEvents(input.planId, events);
  return newEvent;
}

export function updateGuestTimelineEvent(
  eventId: string,
  planId: string,
  updates: UpdateUserNoteEventInput
): ExecutionTimelineEvent | undefined {
  const events = getGuestTimelineEvents(planId);
  const index = events.findIndex((e) => e.id === eventId);
  if (index < 0) return undefined;

  const existing = events[index];
  const updated: ExecutionTimelineEvent = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim().substring(0, 160) : existing.title,
    description: updates.description !== undefined ? updates.description.trim().substring(0, 2000) : existing.description,
    eventDate: updates.eventDate !== undefined ? (updates.eventDate.trim() || undefined) : existing.eventDate
  };

  events[index] = updated;
  saveGuestTimelineEvents(planId, events);
  return updated;
}

export function deleteGuestTimelineEvent(eventId: string, planId: string): boolean {
  const events = getGuestTimelineEvents(planId);
  const filtered = events.filter((e) => e.id !== eventId);
  if (filtered.length === events.length) return false;

  saveGuestTimelineEvents(planId, filtered);
  return true;
}



