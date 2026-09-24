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
  if (filtered.length === plans.length) return false;

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  return true;
}
