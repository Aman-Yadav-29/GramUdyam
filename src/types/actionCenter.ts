/**
 * Phase 12: Action Center & Business Plan Monitoring Types
 * 
 * Strict architectural rules:
 * - Sourced additively from Phases 3-11 without altering prior calculation logic.
 * - Action tracking model supporting verification, status monitoring, and milestones.
 * - Sourced strictly from validated domain benchmarks (infrastructure, agriculture, finance, schemes, documents).
 */

export type ActionCategory =
  | 'business_setup'
  | 'site_verification'
  | 'finance'
  | 'scheme'
  | 'documents'
  | 'procurement'
  | 'operations'
  | 'local_verification';

export type ActionSource =
  | 'phase_3'
  | 'phase_4'
  | 'phase_5'
  | 'phase_6'
  | 'phase_7'
  | 'phase_8'
  | 'phase_9'
  | 'user_added';

export type ActionStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'needs_verification';

export type ActionPriority =
  | 'normal'
  | 'important';

export type ActionGuidanceType =
  | 'generic_planning'
  | 'local_verification'
  | 'user_added'
  | 'documented_scheme'
  | 'documented_government'
  | 'regulatory_licensing'
  | 'financial_preparation';

export interface ActionVerificationDetails {
  verifiedBy?: string;
  verifiedAt?: string;
  method?: string; // e.g., 'Physical Site Visit', 'Document Review', 'Electricity Board (DISCOM) Enquiry', 'Bank Manager Discussion'
  findingNotes?: string;
}

export interface BusinessPlanAction {
  id: string;
  planId: string;

  title: string;
  description?: string;

  category: ActionCategory;
  source: ActionSource;
  sourceLabel?: string; // e.g. "Location Intelligence: Grid Infrastructure Benchmark"
  sourceField?: string; // Exact upstream data field / source origin
  guidanceType?: ActionGuidanceType;

  status: ActionStatus;
  priority: ActionPriority;

  dueDate?: string;
  evidence?: string;
  notes?: string;

  verificationDetails?: ActionVerificationDetails;

  createdAt: string;
  updatedAt: string;
}

export interface ActionMilestone {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  category: ActionCategory;
  actionIds: string[];
  totalActions: number;
  completedActions: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface ActionCategoryMetric {
  category: ActionCategory;
  label: string;
  total: number;
  completed: number;
  inProgress: number;
  needsVerification: number;
  blocked: number;
  progressPercentage: number;
}

export interface ActionCenterSummary {
  planId: string;
  totalActions: number;
  completedActions: number;
  inProgressActions: number;
  needsVerificationActions: number;
  blockedActions: number;
  notStartedActions: number;
  importantCount: number;
  completionPercentage: number;
  verificationReadiness: {
    totalRequiringVerification: number;
    verified: number;
    pending: number;
    readinessPercentage: number;
  };
  milestones: ActionMilestone[];
  categoryMetrics: Record<ActionCategory, ActionCategoryMetric>;
  lastUpdated: string;
}

export interface ActionFilterOptions {
  category?: ActionCategory | 'all';
  status?: ActionStatus | 'all';
  priority?: ActionPriority | 'all';
  searchQuery?: string;
}

export interface GenerateActionsParams {
  planId: string;
  enterprise: {
    id: string;
    name?: string;
    title?: string;
    businessName?: string;
    category?: string;
    keyMachinery?: string[];
    powerRequired?: string;
    spaceRequiredSqFt?: number;
    waterRequirement?: string;
  };
  financialPlan?: any;
  location?: {
    state?: string;
    district?: string;
    locationType?: string;
  } | null;
  districtData?: {
    districtName?: string;
    stateName?: string;
    industrialPowerReliability?: string;
    roadConnectivityQuality?: string;
    primaryTradeCenter?: string;
    districtIndustryCenterAddress?: string;
    commercialRentPerSqFt?: number;
  } | null;
  agriAnalysis?: any;
  matchedSchemes?: any[] | null;
  promoterName?: string;
}

