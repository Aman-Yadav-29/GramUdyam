/**
 * Phase 12: Action Generator & Monitoring Logic
 * 
 * Traceably transforms generated Business & Financing Plan data
 * into an actionable, monitored task list.
 * 
 * Sourced strictly from:
 * - Phase 3: Business Model & Discovery
 * - Phase 4: Financial Planning & Amortization Engine
 * - Phase 5: Location & Infrastructure Benchmarks
 * - Phase 6: Agriculture & Raw Material Benchmarks
 * - Phase 7: Government Scheme Matching
 * - Phase 8: Document Readiness Checklist
 * - Phase 9: Consolidated Business Plan Roadmap
 */

import {
  BusinessPlanAction,
  ActionCategory,
  ActionSource,
  ActionStatus,
  ActionPriority,
  ActionGuidanceType,
  ActionMilestone,
  ActionCenterSummary,
  ActionCategoryMetric,
  ActionFilterOptions,
  GenerateActionsParams
} from '../types/actionCenter.ts';
import {
  ExecutionEvidence,
  EVIDENCE_TYPE_LABELS
} from '../types/executionEvidence.ts';

export type { GenerateActionsParams, ActionGuidanceType };

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  business_setup: 'Business Setup & Legal',
  site_verification: 'Site & Infrastructure Verification',
  finance: 'Banking & Financing',
  scheme: 'Government Scheme Application',
  documents: 'Document Compilation',
  procurement: 'Machinery & Equipment Procurement',
  operations: 'Plant Setup & Operational Launch',
  local_verification: 'Local On-Ground Verification'
};

export const GUIDANCE_TYPE_LABELS: Record<ActionGuidanceType, string> = {
  local_verification: 'Local On-Ground Verification',
  documented_government: 'Documented Govt Requirement',
  documented_scheme: 'Documented Scheme Requirement',
  regulatory_licensing: 'Regulatory / Licensing Guidance',
  financial_preparation: 'Financial Preparation Guidance',
  generic_planning: 'Planning Guidance',
  user_added: 'User Custom Task'
};

/**
 * Generates deterministic action items based on validated outputs of Phases 3 to 9.
 */
export function generatePlanActions(params: GenerateActionsParams): BusinessPlanAction[] {
  const {
    planId,
    enterprise,
    financialPlan,
    location,
    districtData,
    agriAnalysis,
    matchedSchemes
  } = params;

  const now = new Date().toISOString();
  const district = location?.district || districtData?.districtName || 'Local District';
  const state = location?.state || districtData?.stateName || 'State';
  const enterpriseName = enterprise.name || enterprise.title || enterprise.businessName || 'Micro Enterprise';
  const topScheme = matchedSchemes && matchedSchemes.length > 0 ? matchedSchemes[0] : null;

  const totalCost = financialPlan?.totalProjectCost || 0;
  const promoterMargin = financialPlan?.availableCapital || 0;
  const loanReq = financialPlan?.financingGap || financialPlan?.termLoan?.principal || 0;
  const emi = financialPlan?.termLoan?.monthlyEmi || 0;
  const primaryMachine = enterprise.keyMachinery?.[0] || 'Core Industrial Processing Unit';
  const secondMachine = enterprise.keyMachinery?.[1] || 'Auxiliary Ancillary Machinery';
  const powerSpec = enterprise.powerRequired || '10-15 kW 3-Phase Industrial Power';

  const isFoodEnterprise = Boolean(
    enterprise.category?.toLowerCase().includes('food') ||
    enterprise.category?.toLowerCase().includes('agro') ||
    enterprise.category?.toLowerCase().includes('agri') ||
    enterprise.name?.toLowerCase().includes('oil') ||
    enterprise.name?.toLowerCase().includes('flour') ||
    enterprise.name?.toLowerCase().includes('pulse') ||
    enterprise.name?.toLowerCase().includes('dal') ||
    enterprise.name?.toLowerCase().includes('spice') ||
    enterprise.title?.toLowerCase().includes('oil') ||
    enterprise.title?.toLowerCase().includes('food')
  );

  const actions: BusinessPlanAction[] = [];

  // ==========================================
  // 1. PHASE 5: Location & Infrastructure Verification
  // ==========================================
  actions.push({
    id: `${planId}_act_p5_power`,
    planId,
    title: 'Verify Commercial 3-Phase Power Feasibility',
    description: `Inspect proposed site in ${district} for ${powerSpec}. Contact local DISCOM junior engineer to verify transformer capacity and connection lead time.`,
    category: 'site_verification',
    source: 'phase_5',
    sourceLabel: 'Phase 5 — Location & Infrastructure Benchmark (Power Grid)',
    sourceField: 'districtData.industrialPowerReliability / enterprise.powerRequired',
    guidanceType: 'local_verification',
    status: 'needs_verification',
    priority: 'important',
    createdAt: now,
    updatedAt: now,
    verificationDetails: {
      method: 'DISCOM / Electricity Board Local Office Visit'
    }
  });

  actions.push({
    id: `${planId}_act_p5_road`,
    planId,
    title: 'Confirm All-Weather Cargo Road Accessibility',
    description: `Verify that access road to proposed enterprise site in ${district} provides minimum 15-20 feet clearance for raw material trucks and equipment delivery vehicles.`,
    category: 'site_verification',
    source: 'phase_5',
    sourceLabel: 'Phase 5 — Location & Infrastructure Benchmark (Road Logistics)',
    sourceField: 'districtData.roadConnectivityQuality',
    guidanceType: 'local_verification',
    status: 'needs_verification',
    priority: 'normal',
    createdAt: now,
    updatedAt: now,
    verificationDetails: {
      method: 'Physical Site Inspection'
    }
  });

  actions.push({
    id: `${planId}_act_p5_zoning`,
    planId,
    title: 'Obtain Local Gram Panchayat / Municipal Site NOC',
    description: `Verify commercial non-agricultural (NA) zoning and obtain No-Objection Certificate (NOC) from ${district} Gram Panchayat or municipal authority for micro-industrial operations.`,
    category: 'local_verification',
    source: 'phase_5',
    sourceLabel: 'Phase 5 — Location & Infrastructure Benchmark (Commercial Zoning)',
    sourceField: 'location.district / localAuthority',
    guidanceType: 'local_verification',
    status: 'needs_verification',
    priority: 'important',
    createdAt: now,
    updatedAt: now,
    verificationDetails: {
      method: 'Panchayat / Local Authority Office Submission'
    }
  });

  // ==========================================
  // 2. PHASE 6: Agriculture & Raw Material Benchmark
  // ==========================================
  const rawMaterialName = agriAnalysis?.topCrops?.[0]?.crop || 'Primary Agricultural Produce';
  const mandiName = agriAnalysis?.marketMandiName || `${district} Mandi`;
  const mandiDist = agriAnalysis?.nearestMandiDistanceKm || 12;

  actions.push({
    id: `${planId}_act_p6_raw_material`,
    planId,
    title: `Verify Raw Material Supply at ${mandiName}`,
    description: `Assess availability and seasonal price variance of ${rawMaterialName} across nearby mandis (approx. ${mandiDist} km) in ${district} to secure consistent batch processing volume.`,
    category: 'local_verification',
    source: 'phase_6',
    sourceLabel: 'Phase 6 — Agriculture & Raw Material Benchmark (APMC Mandi)',
    sourceField: 'agriAnalysis.topCrops / mandiName',
    guidanceType: 'local_verification',
    status: 'needs_verification',
    priority: 'important',
    createdAt: now,
    updatedAt: now,
    verificationDetails: {
      method: 'Mandi Trader & APMC Yard Field Enquiry'
    }
  });

  actions.push({
    id: `${planId}_act_p6_water`,
    planId,
    title: 'Inspect Groundwater & Water Supply Adequacy',
    description: `Conduct water testing and confirm borewell yield or commercial water supply connection at the unit premises (${enterprise.waterRequirement || 'Standard utility water'}).`,
    category: 'site_verification',
    source: 'phase_6',
    sourceLabel: 'Phase 6 — Agriculture & Raw Material Benchmark (Water Resource)',
    sourceField: 'enterprise.waterRequirement / agriAnalysis.groundwaterStatus',
    guidanceType: 'local_verification',
    status: 'needs_verification',
    priority: 'normal',
    createdAt: now,
    updatedAt: now,
    verificationDetails: {
      method: 'On-site Borewell & Water Quality Test'
    }
  });

  // ==========================================
  // 3. PHASE 3: Business Setup & Statutory Registrations
  // ==========================================
  actions.push({
    id: `${planId}_act_p3_udyam`,
    planId,
    title: 'Zero-Fee Udyam MSME Registration',
    description: 'Register the enterprise on udyamregistration.gov.in using Aadhaar and PAN. Receive immediate Udyam Registration Certificate without payment of any fee.',
    category: 'business_setup',
    source: 'phase_3',
    sourceLabel: 'Phase 3 — Budget & Business Discovery (MSME Framework)',
    sourceField: 'MSME Development Act / Udyam Portal',
    guidanceType: 'documented_government',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p3_entity`,
    planId,
    title: 'Finalize Enterprise Legal Structure',
    description: `Establish legal constitution (Sole Proprietorship / Partnership / OPC) for ${enterpriseName} and obtain PAN card in entity name if non-proprietorship.`,
    category: 'business_setup',
    source: 'phase_3',
    sourceLabel: 'Phase 3 — Budget & Business Discovery (Legal Entity)',
    sourceField: 'enterprise.businessName / legalStructure',
    guidanceType: 'generic_planning',
    status: 'not_started',
    priority: 'normal',
    createdAt: now,
    updatedAt: now
  });

  // ==========================================
  // 4. PHASE 8: Document Compilation & Readiness
  // ==========================================
  actions.push({
    id: `${planId}_act_p8_kyc`,
    planId,
    title: 'Compile Promoter KYC & Address Dossier',
    description: 'Collate certified copies of Aadhaar Card, PAN Card, passport-sized photographs, and residential address proof for all promoters.',
    category: 'documents',
    source: 'phase_8',
    sourceLabel: 'Phase 8 — Document Readiness Checklist (Promoter KYC)',
    sourceField: 'Phase 8 Document Checklist: Promoter Dossier',
    guidanceType: 'documented_government',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p8_quotations`,
    planId,
    title: 'Procure 2-3 Supplier Quotations for Key Machinery',
    description: `Obtain formal stamped proforma invoices and GST-compliant quotations from verified manufacturers for ${primaryMachine} and ${secondMachine}.`,
    category: 'procurement',
    source: 'phase_8',
    sourceLabel: 'Phase 8 — Document Readiness Checklist (Machinery Quotations)',
    sourceField: 'enterprise.keyMachinery / supplierInvoices',
    guidanceType: 'documented_scheme',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p8_land_title`,
    planId,
    title: 'Execute Registered Land Lease or Possession Proof',
    description: `Finalize registered lease agreement (minimum 3-5 years) or registered title deed/Khasra-Khatauni for approx. ${enterprise.spaceRequiredSqFt || 1000} sq.ft operational premises.`,
    category: 'documents',
    source: 'phase_8',
    sourceLabel: 'Phase 8 — Document Readiness Checklist (Premises Title)',
    sourceField: 'enterprise.spaceRequiredSqFt / leaseAgreement',
    guidanceType: 'documented_government',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p8_regulatory`,
    planId,
    title: isFoodEnterprise
      ? 'Apply for Statutory Trade License / FSSAI / PCB NOC'
      : 'Apply for Statutory Municipal Trade License & PCB NOC',
    description: isFoodEnterprise
      ? `Submit application for local municipal trade license, FSSAI Food Business Registration/License, and check State Pollution Control Board Consent-to-Establish (CTE) / White-category classification.`
      : `Submit application for local municipal trade license and check State Pollution Control Board Consent-to-Establish (CTE) categorization. Note: FSSAI is not applicable for non-food manufacturing.`,
    category: 'documents',
    source: 'phase_8',
    sourceLabel: 'Phase 8 — Document Readiness Checklist (Licensing & Permits)',
    sourceField: 'enterprise.category (FSSAI / Municipal Trade / SPCB CTE)',
    guidanceType: 'regulatory_licensing',
    status: 'not_started',
    priority: 'normal',
    createdAt: now,
    updatedAt: now
  });

  // ==========================================
  // 5. PHASE 4: Banking & Financial Execution
  // ==========================================
  actions.push({
    id: `${planId}_act_p4_margin`,
    planId,
    title: 'Open Dedicated Bank Current Account & Deposit Margin',
    description: `Open enterprise current account at lead bank in ${district} and deposit promoter equity margin money of ₹${promoterMargin.toLocaleString('en-IN')}.`,
    category: 'finance',
    source: 'phase_4',
    sourceLabel: 'Phase 4 — Financial Modeling & Amortization Engine (Margin Equity)',
    sourceField: 'financialPlan.availableCapital (Promoter Equity Margin)',
    guidanceType: 'financial_preparation',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p4_appraisal`,
    planId,
    title: 'Schedule Bank Credit Appraisal with Branch Manager',
    description: `Submit the generated 25-section DPR and financial feasibility report to Branch Manager for appraisal of ₹${loanReq.toLocaleString('en-IN')} term loan (Monthly EMI: ₹${emi.toLocaleString('en-IN')}).`,
    category: 'finance',
    source: 'phase_4',
    sourceLabel: 'Phase 4 — Financial Modeling & Amortization Engine (Bank Loan Appraisal)',
    sourceField: 'financialPlan.financingGap / monthlyEmi / termLoan',
    guidanceType: 'financial_preparation',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  // ==========================================
  // 6. PHASE 7: Government Scheme Filing
  // ==========================================
  const schemeTitle = topScheme?.schemeName || 'PMEGP (Prime Minister Employment Generation Programme)';
  const nodalAgency = topScheme?.nodalAgency || districtData?.districtIndustryCenterAddress || 'District Industries Centre (DIC)';

  actions.push({
    id: `${planId}_act_p7_portal_filing`,
    planId,
    title: `File Online Application for ${schemeTitle}`,
    description: `Log on to the scheme portal, upload business plan, proforma quotations, and KYC. Select ${district} DIC/KVIC as implementing agency.`,
    category: 'scheme',
    source: 'phase_7',
    sourceLabel: 'Phase 7 — Government Scheme Matching Engine (Portal Filing)',
    sourceField: 'matchedSchemes[0].schemeName / portalUpload',
    guidanceType: 'documented_scheme',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p7_dic_interview`,
    planId,
    title: `Attend Task Force Interview at ${nodalAgency}`,
    description: `Present Detailed Project Report before District Level Task Force Committee (DLTFC) for physical verification and recommendation to bank branch.`,
    category: 'scheme',
    source: 'phase_7',
    sourceLabel: 'Phase 7 — Government Scheme Matching Engine (DLTFC Review)',
    sourceField: 'matchedSchemes[0].nodalAgency / DLTFC Interview',
    guidanceType: 'documented_scheme',
    status: 'not_started',
    priority: 'normal',
    createdAt: now,
    updatedAt: now
  });

  // ==========================================
  // 7. PHASE 9: Procurement & Site Infrastructure
  // ==========================================
  actions.push({
    id: `${planId}_act_p9_po_disbursement`,
    planId,
    title: `Issue Purchase Order for ${primaryMachine}`,
    description: `Upon bank loan sanction, release advance payment from escrow/bank loan account to approved machinery vendor against performance guarantee.`,
    category: 'procurement',
    source: 'phase_9',
    sourceLabel: 'Phase 9 — Business & Financing Plan Roadmap (Procurement)',
    sourceField: 'financialPlan.capex / enterprise.keyMachinery[0]',
    guidanceType: 'generic_planning',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p9_installation`,
    planId,
    title: 'Complete Machinery Erection & Electrical Fit-Out',
    description: `Supervise machine foundation, electrical wiring for ${powerSpec}, and utility piping in workshop floor area.`,
    category: 'operations',
    source: 'phase_9',
    sourceLabel: 'Phase 9 — Business & Financing Plan Roadmap (Installation)',
    sourceField: 'enterprise.spaceRequiredSqFt / powerRequired',
    guidanceType: 'generic_planning',
    status: 'not_started',
    priority: 'normal',
    createdAt: now,
    updatedAt: now
  });

  // ==========================================
  // 8. PHASE 9: Operations & Commercial Trial
  // ==========================================
  actions.push({
    id: `${planId}_act_p9_trial_run`,
    planId,
    title: 'Execute Trial Batch Production Run',
    description: `Process initial trial batch of raw material to test equipment throughput, wastage ratio, and product quality before commercial dispatch.`,
    category: 'operations',
    source: 'phase_9',
    sourceLabel: 'Phase 9 — Business & Financing Plan Roadmap (Trial Run)',
    sourceField: 'enterprise.productionCapacity / qualityChecks',
    guidanceType: 'generic_planning',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  actions.push({
    id: `${planId}_act_p9_market_launch`,
    planId,
    title: 'Commence Commercial Invoicing & Retail Distribution',
    description: `Onboard initial wholesale buyers, local grocery retailers, or direct consumers in ${district}. Commence commercial billing and debt servicing.`,
    category: 'operations',
    source: 'phase_9',
    sourceLabel: 'Phase 9 — Business & Financing Plan Roadmap (Commercial Launch)',
    sourceField: 'financialPlan.monthlyRevenue / localDistribution',
    guidanceType: 'generic_planning',
    status: 'not_started',
    priority: 'important',
    createdAt: now,
    updatedAt: now
  });

  return actions;
}

/**
 * Calculates progressive execution milestones aggregating linked tasks.
 */
export function calculateMilestones(actions: BusinessPlanAction[]): ActionMilestone[] {
  const milestoneDefinitions: Array<{
    id: string;
    stageNumber: number;
    title: string;
    description: string;
    category: ActionCategory;
    filterFn: (act: BusinessPlanAction) => boolean;
  }> = [
    {
      id: 'm1_verification',
      stageNumber: 1,
      title: 'Stage 1: Site Feasibility & Local Verification',
      description: 'On-ground verification of power grid, water source, road access, and raw material availability.',
      category: 'site_verification',
      filterFn: (act) => act.category === 'site_verification' || act.category === 'local_verification'
    },
    {
      id: 'm2_documentation',
      stageNumber: 2,
      title: 'Stage 2: Statutory Registration & KYC Documentation',
      description: 'Zero-fee Udyam MSME certificate, promoter KYC, land lease title, and machinery proforma invoices.',
      category: 'documents',
      filterFn: (act) => act.category === 'documents' || act.category === 'business_setup'
    },
    {
      id: 'm3_financing',
      stageNumber: 3,
      title: 'Stage 3: Bank Credit Appraisal & Scheme Sanction',
      description: 'Margin money deposit, portal scheme filing, and bank loan sanction letter issuance.',
      category: 'finance',
      filterFn: (act) => act.category === 'finance' || act.category === 'scheme'
    },
    {
      id: 'm4_procurement',
      stageNumber: 4,
      title: 'Stage 4: Machinery Procurement & Site Installation',
      description: 'Vendor advance payment, machinery delivery, factory floor electrification, and equipment erection.',
      category: 'procurement',
      filterFn: (act) => act.category === 'procurement'
    },
    {
      id: 'm5_operations',
      stageNumber: 5,
      title: 'Stage 5: Trial Run & Commercial Market Launch',
      description: 'Test batch production run, quality certification, distributor onboarding, and commercial sales.',
      category: 'operations',
      filterFn: (act) => act.category === 'operations'
    }
  ];

  return milestoneDefinitions.map((def) => {
    const matched = actions.filter(def.filterFn);
    const actionIds = matched.map((a) => a.id);
    const totalActions = matched.length;
    const completedActions = matched.filter((a) => a.status === 'completed').length;
    const progressPercentage = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
    const isCompleted = totalActions > 0 && completedActions === totalActions;

    return {
      id: def.id,
      stageNumber: def.stageNumber,
      title: def.title,
      description: def.description,
      category: def.category,
      actionIds,
      totalActions,
      completedActions,
      progressPercentage,
      isCompleted
    };
  });
}

/**
 * Calculates high-level summary metrics, category breakdowns, and verification readiness.
 */
export function calculateActionCenterSummary(
  planId: string,
  actions: BusinessPlanAction[]
): ActionCenterSummary {
  const totalActions = actions.length;
  const completedActions = actions.filter((a) => a.status === 'completed').length;
  const inProgressActions = actions.filter((a) => a.status === 'in_progress').length;
  const needsVerificationActions = actions.filter((a) => a.status === 'needs_verification').length;
  const blockedActions = actions.filter((a) => a.status === 'blocked').length;
  const notStartedActions = actions.filter((a) => a.status === 'not_started').length;
  const importantCount = actions.filter((a) => a.priority === 'important').length;

  const completionPercentage = totalActions > 0
    ? Math.round((completedActions / totalActions) * 100)
    : 0;

  // Verification readiness: actions under site_verification or local_verification
  const verificationActions = actions.filter(
    (a) => a.category === 'site_verification' || a.category === 'local_verification'
  );
  const totalRequiringVerification = verificationActions.length;
  const verified = verificationActions.filter(
    (a) => a.status === 'completed' || (a.status !== 'needs_verification' && a.status !== 'blocked')
  ).length;
  const pending = totalRequiringVerification - verified;
  const readinessPercentage = totalRequiringVerification > 0
    ? Math.round((verified / totalRequiringVerification) * 100)
    : 100;

  // Category Metrics
  const allCategories: ActionCategory[] = [
    'business_setup',
    'site_verification',
    'finance',
    'scheme',
    'documents',
    'procurement',
    'operations',
    'local_verification'
  ];

  const categoryMetrics = allCategories.reduce((acc, cat) => {
    const catActs = actions.filter((a) => a.category === cat);
    const catTotal = catActs.length;
    const catCompleted = catActs.filter((a) => a.status === 'completed').length;
    const catInProgress = catActs.filter((a) => a.status === 'in_progress').length;
    const catNeedsVerification = catActs.filter((a) => a.status === 'needs_verification').length;
    const catBlocked = catActs.filter((a) => a.status === 'blocked').length;
    const catProgress = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

    acc[cat] = {
      category: cat,
      label: CATEGORY_LABELS[cat],
      total: catTotal,
      completed: catCompleted,
      inProgress: catInProgress,
      needsVerification: catNeedsVerification,
      blocked: catBlocked,
      progressPercentage: catProgress
    };
    return acc;
  }, {} as Record<ActionCategory, ActionCategoryMetric>);

  const milestones = calculateMilestones(actions);

  return {
    planId,
    totalActions,
    completedActions,
    inProgressActions,
    needsVerificationActions,
    blockedActions,
    notStartedActions,
    importantCount,
    completionPercentage,
    verificationReadiness: {
      totalRequiringVerification,
      verified,
      pending,
      readinessPercentage
    },
    milestones,
    categoryMetrics,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Filters actions according to given criteria.
 */
export function filterActions(
  actions: BusinessPlanAction[],
  filters: ActionFilterOptions
): BusinessPlanAction[] {
  return actions.filter((action) => {
    if (filters.category && filters.category !== 'all' && action.category !== filters.category) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && action.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== 'all' && action.priority !== filters.priority) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle = action.title.toLowerCase().includes(q);
      const matchDesc = action.description?.toLowerCase().includes(q);
      const matchNotes = action.notes?.toLowerCase().includes(q);
      const matchSource = action.sourceLabel?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNotes && !matchSource) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Exports monitoring action list as formatted plain text for print/download.
 */
export function generateActionListText(
  planTitle: string,
  summary: ActionCenterSummary,
  actions: BusinessPlanAction[],
  evidenceList?: ExecutionEvidence[]
): string {
  const lines: string[] = [];

  lines.push('========================================================================');
  lines.push(`GRAMUDYAM ACTION CENTER & BUSINESS PLAN MONITORING REPORT`);
  lines.push(`Plan: ${planTitle}`);
  lines.push(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`);
  lines.push('========================================================================\n');

  lines.push('--- EXECUTIVE MONITORING SUMMARY ---');
  lines.push(`Total Monitored Tasks:   ${summary.totalActions}`);
  lines.push(`Completed:               ${summary.completedActions} (${summary.completionPercentage}%)`);
  lines.push(`In Progress:             ${summary.inProgressActions}`);
  lines.push(`Needs Verification:      ${summary.needsVerificationActions}`);
  lines.push(`Blocked / Action Needed: ${summary.blockedActions}`);
  lines.push(`Not Started:             ${summary.notStartedActions}`);
  lines.push(`High-Priority Items:     ${summary.importantCount}`);
  lines.push(`Verification Readiness:  ${summary.verificationReadiness.verified}/${summary.verificationReadiness.totalRequiringVerification} (${summary.verificationReadiness.readinessPercentage}%)\n`);

  lines.push('--- IMPLEMENTATION MILESTONES ---');
  summary.milestones.forEach((m) => {
    const check = m.isCompleted ? '[X]' : `[${m.progressPercentage}%]`;
    lines.push(`${check} ${m.title}`);
    lines.push(`    ${m.completedActions}/${m.totalActions} tasks completed. ${m.description}`);
  });
  lines.push('');

  lines.push('--- DETAILED ACTION CHECKLIST & EXECUTION EVIDENCE ---');
  actions.forEach((act, idx) => {
    const statusBox = act.status === 'completed'
      ? '[COMPLETED]'
      : act.status === 'in_progress'
      ? '[IN PROGRESS]'
      : act.status === 'blocked'
      ? '[BLOCKED]'
      : act.status === 'needs_verification'
      ? '[VERIFY ON-GROUND]'
      : '[NOT STARTED]';

    const prioStar = act.priority === 'important' ? '★ IMPORTANT' : 'NORMAL';

    lines.push(`${idx + 1}. ${statusBox} ${act.title} (${prioStar})`);
    lines.push(`   Category: ${CATEGORY_LABELS[act.category]} | Guidance Type: ${GUIDANCE_TYPE_LABELS[act.guidanceType || 'generic_planning']}`);
    lines.push(`   Source Benchmark: ${act.sourceLabel || act.source}${act.sourceField ? ` [Origin: ${act.sourceField}]` : ''}`);
    if (act.description) {
      lines.push(`   Details: ${act.description}`);
    }
    if (act.dueDate) {
      lines.push(`   Due Date: ${act.dueDate}`);
    }
    if (act.verificationDetails?.method) {
      lines.push(`   Verification Method: ${act.verificationDetails.method}`);
      if (act.verificationDetails.findingNotes) {
        lines.push(`   Findings: ${act.verificationDetails.findingNotes}`);
      }
    }
    if (act.notes) {
      lines.push(`   Notes: ${act.notes}`);
    }

    // Attach user-recorded execution evidence for this action
    if (evidenceList && evidenceList.length > 0) {
      const actEvidence = evidenceList.filter((e) => e.actionId === act.id);
      if (actEvidence.length > 0) {
        lines.push(`   Progress Records (${actEvidence.length} user-recorded):`);
        actEvidence.forEach((evi) => {
          const datePart = evi.eventDate ? `[${evi.eventDate}] ` : '';
          const refPart = evi.referenceNumber ? ` (Ref: ${evi.referenceNumber})` : '';
          lines.push(`     • ${datePart}${evi.title} — ${EVIDENCE_TYPE_LABELS[evi.type] || evi.type}${refPart}`);
          lines.push(`       Note: ${evi.description}`);
          lines.push(`       Status: User-recorded evidence (not independently verified)`);
        });
      }
    }

    lines.push('');
  });

  lines.push('========================================================================');
  lines.push('STATUTORY ADVISORY & EXECUTION MONITORING NOTICE');
  lines.push('------------------------------------------------------------------------');
  lines.push('1. Action Center tasks are derived for practical execution tracking and');
  lines.push('   local validation. They do not constitute formal legal or statutory advice.');
  lines.push('2. Statutory registrations, environmental classifications (CTE/CTO), and');
  lines.push('   food safety licenses (FSSAI) are subject to official authority verification.');
  lines.push('3. Inclusion of bank appraisal steps or scheme applications does not guarantee');
  lines.push('   credit sanction or subsidy disbursement by lending institutions or nodal agencies.');
  lines.push('4. Progress records and reference numbers are user-entered factual records');
  lines.push('   and do not constitute government, bank, statutory, or third-party verification.');
  lines.push('========================================================================');
  lines.push('GramUdyam Action Center • Sourced traceably from Phases 3-11');
  lines.push('========================================================================');

  return lines.join('\n');
}
