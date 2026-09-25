/**
 * Phase 12: Action Center & Business Plan Monitoring Test Suite
 * 
 * Verifies:
 * 1. Deterministic generation of domain-grounded actions traceable to Phases 3-9.
 * 2. Strict category, source, status, and non-numerical priority compliance.
 * 3. Local on-ground verification tracking (power, water, road, raw material mandi).
 * 4. Progressive milestone aggregation and completion math.
 * 5. Summary metrics and verification readiness metrics.
 * 6. Server-side service operations, mutations, and user ownership isolation.
 * 7. Guest mode persistence and offline capability.
 * 8. Strict Financial Invariance: Phase 12 leaves Phases 3-11 calculations 100% intact.
 */

import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { actionCenterService } from './server/services/actionCenterService.ts';
import {
  generatePlanActions,
  calculateMilestones,
  calculateActionCenterSummary,
  filterActions,
  generateActionListText,
  CATEGORY_LABELS
} from './src/utils/actionGenerator.ts';
import {
  getGuestPlanActions,
  saveGuestPlanActions,
  updateGuestPlanAction,
  addGuestPlanAction,
  deleteGuestPlanAction
} from './src/utils/guestStorage.ts';
import {
  BusinessPlanAction,
  ActionCategory,
  ActionSource,
  ActionStatus,
  ActionPriority
} from './src/types/actionCenter.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('========================================================================');
console.log('PHASE 12: ACTION CENTER & BUSINESS PLAN MONITORING TEST SUITE');
console.log('========================================================================\n');

async function runPhase12TestSuite() {
  // Setup sample enterprise & financial plan
  const enterprise = ENTERPRISE_TEMPLATES[0]; // e.g. Mustard Oil Expeller
  const availableCapital = 500000;
  const financialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: enterprise.id,
    capitalAvailable: availableCapital,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    scenario: 'base'
  });
  const financialPlan = financialResult.plan;

  const location = {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    locationType: 'rural'
  };

  const districtData = {
    districtName: 'Varanasi',
    stateName: 'Uttar Pradesh',
    industrialPowerReliability: 'High',
    roadConnectivityQuality: 'Good',
    primaryTradeCenter: 'Varanasi Central Mandi',
    districtIndustryCenterAddress: 'DIC Varanasi Industrial Estate'
  };

  const agriAnalysis = {
    district: 'Varanasi',
    topCrops: [
      { crop: 'Mustard / Rapeseed', productionVolume: '45,000 MT' },
      { crop: 'Wheat', productionVolume: '180,000 MT' }
    ],
    soilType: 'Alluvial Loam',
    groundwaterStatus: 'Safe',
    nearestMandiDistanceKm: 14,
    marketMandiName: 'Varanasi Krishi Mandi'
  };

  const matchedSchemes = [
    {
      id: 'scheme_pmegp',
      schemeName: 'PMEGP (Prime Minister Employment Generation Programme)',
      nodalAgency: 'KVIC / DIC Varanasi',
      maxSubsidyPercentage: 35
    }
  ];

  const planId = 'test_plan_v12_001';

  // =========================================================================
  // GROUP 1: Traceable Action Generation & Source Integrity
  // =========================================================================
  console.log('[Test Group 1: Traceable Action Generation from Phases 3-9]');
  const actions = generatePlanActions({
    planId,
    enterprise,
    financialPlan,
    location,
    districtData,
    agriAnalysis,
    matchedSchemes
  });

  assert(actions.length >= 15, `Generated comprehensive action plan (${actions.length} tasks generated)`);

  // Check presence of actions from each required phase
  const sourcesPresent = new Set(actions.map((a) => a.source));
  assert(sourcesPresent.has('phase_3'), 'Phase 3 (Business Setup & Udyam) actions present');
  assert(sourcesPresent.has('phase_4'), 'Phase 4 (Banking & Margin Money) actions present');
  assert(sourcesPresent.has('phase_5'), 'Phase 5 (Location & 3-Phase Power) actions present');
  assert(sourcesPresent.has('phase_6'), 'Phase 6 (Agriculture Raw Material & Mandi) actions present');
  assert(sourcesPresent.has('phase_7'), 'Phase 7 (Government Scheme Filing) actions present');
  assert(sourcesPresent.has('phase_8'), 'Phase 8 (Document Compilation & Quotations) actions present');
  assert(sourcesPresent.has('phase_9'), 'Phase 9 (Roadmap, Procurement & Operations) actions present');

  // Verify dynamic data injection
  const powerAction = actions.find((a) => a.id.includes('act_p5_power'));
  assert(Boolean(powerAction && powerAction.description?.includes('Varanasi')), 'Power action includes target district dynamically');

  const mandiAction = actions.find((a) => a.id.includes('act_p6_raw_material'));
  assert(Boolean(mandiAction && mandiAction.description?.includes('Mustard')), 'Mandi action dynamically references top regional crop');

  const marginAction = actions.find((a) => a.id.includes('act_p4_margin'));
  assert(Boolean(marginAction && marginAction.description?.includes(availableCapital.toLocaleString('en-IN'))), 'Margin money action specifies exact equity capital amount');

  // =========================================================================
  // GROUP 2: Model & Architectural Rule Conformance
  // =========================================================================
  console.log('\n[Test Group 2: Model & Architectural Rule Conformance]');

  const validCategories: Set<ActionCategory> = new Set([
    'business_setup',
    'site_verification',
    'finance',
    'scheme',
    'documents',
    'procurement',
    'operations',
    'local_verification'
  ]);

  const validStatuses: Set<ActionStatus> = new Set([
    'not_started',
    'in_progress',
    'completed',
    'blocked',
    'needs_verification'
  ]);

  const validPriorities: Set<ActionPriority> = new Set(['normal', 'important']);

  const validGuidanceTypes: Set<string> = new Set([
    'generic_planning',
    'local_verification',
    'user_added',
    'documented_scheme',
    'documented_government',
    'regulatory_licensing',
    'financial_preparation'
  ]);

  let allCategoriesValid = true;
  let allStatusesValid = true;
  let allPrioritiesValid = true;
  let allGuidanceTypesValid = true;
  let allSourceFieldsPresent = true;
  let allSourceLabelsDescriptive = true;
  let noNumericalScores = true;

  actions.forEach((a) => {
    if (!validCategories.has(a.category)) allCategoriesValid = false;
    if (!validStatuses.has(a.status)) allStatusesValid = false;
    if (!validPriorities.has(a.priority)) allPrioritiesValid = false;
    if (!a.guidanceType || !validGuidanceTypes.has(a.guidanceType)) allGuidanceTypesValid = false;
    if (!a.sourceField || a.sourceField.trim().length === 0) allSourceFieldsPresent = false;
    if (!a.sourceLabel || a.sourceLabel.trim().length <= 8) allSourceLabelsDescriptive = false;
    if (typeof (a as any).score !== 'undefined' || typeof (a as any).numericalPriority !== 'undefined') {
      noNumericalScores = false;
    }
  });

  assert(allCategoriesValid, 'All actions conform strictly to the 8 defined ActionCategory types');
  assert(allStatusesValid, 'All actions conform strictly to the 5 defined ActionStatus types');
  assert(allPrioritiesValid, 'All actions use non-numerical ActionPriority ("normal" | "important")');
  assert(allGuidanceTypesValid, 'All actions have validated ActionGuidanceType (provenance classification)');
  assert(allSourceFieldsPresent, 'All actions specify exact upstream source field or benchmark origin');
  assert(allSourceLabelsDescriptive, 'All actions have descriptive source labels beyond plain phase codes');
  assert(noNumericalScores, 'Strict Rule: Zero artificial numerical priority scores introduced');

  // Verify on-ground verification tasks are marked needs_verification by default
  const verificationTasks = actions.filter((a) => a.category === 'site_verification' || a.category === 'local_verification');
  const needsVerifCount = verificationTasks.filter((a) => a.status === 'needs_verification').length;
  assert(needsVerifCount === verificationTasks.length, 'All site/local verification tasks default to "needs_verification"');

  // =========================================================================
  // GROUP 3: Milestone Aggregation & Progress Math
  // =========================================================================
  console.log('\n[Test Group 3: Milestone Aggregation & Progress Math]');
  const milestones = calculateMilestones(actions);

  assert(milestones.length === 5, 'Exact 5 progressive implementation stages created');
  assert(milestones[0].stageNumber === 1 && milestones[0].title.includes('Site Feasibility'), 'Stage 1 is Site Feasibility & Verification');
  assert(milestones[1].stageNumber === 2 && milestones[1].title.includes('Statutory Registration'), 'Stage 2 is Statutory Registration & KYC');
  assert(milestones[2].stageNumber === 3 && milestones[2].title.includes('Bank Credit Appraisal'), 'Stage 3 is Bank Credit Appraisal & Financing');
  assert(milestones[3].stageNumber === 4 && milestones[3].title.includes('Machinery Procurement'), 'Stage 4 is Machinery Procurement & Installation');
  assert(milestones[4].stageNumber === 5 && milestones[4].title.includes('Trial Run'), 'Stage 5 is Trial Run & Commercial Launch');

  // Check progress math on untouched tasks
  milestones.forEach((m) => {
    assert(m.progressPercentage >= 0 && m.progressPercentage <= 100, `Milestone ${m.stageNumber} progress is valid percentage: ${m.progressPercentage}%`);
    assert(m.completedActions <= m.totalActions, `Milestone ${m.stageNumber} completed count does not exceed total`);
  });

  // =========================================================================
  // GROUP 4: Summary Metrics & Verification Readiness
  // =========================================================================
  console.log('\n[Test Group 4: Summary Metrics & Verification Readiness]');
  const summary = calculateActionCenterSummary(planId, actions);

  assert(summary.totalActions === actions.length, `Total actions (${summary.totalActions}) matches`);
  assert(
    summary.totalActions ===
      summary.completedActions +
        summary.inProgressActions +
        summary.needsVerificationActions +
        summary.blockedActions +
        summary.notStartedActions,
    'Sum of all action statuses equals totalActions exactly'
  );
  assert(summary.completionPercentage === 0, 'Initial completion percentage is 0%');
  assert(summary.verificationReadiness.totalRequiringVerification > 0, `Local verification items identified: ${summary.verificationReadiness.totalRequiringVerification}`);
  assert(summary.verificationReadiness.verified === 0, 'Initial verified count is 0');
  assert(summary.verificationReadiness.pending === summary.verificationReadiness.totalRequiringVerification, 'All verification items initially pending');

  // =========================================================================
  // GROUP 5: Filtering & Search Capabilities
  // =========================================================================
  console.log('\n[Test Group 5: Filtering & Search Capabilities]');

  const importantFiltered = filterActions(actions, { priority: 'important' });
  assert(importantFiltered.every((a) => a.priority === 'important'), 'Filter by priority: "important" works accurately');

  const verifFiltered = filterActions(actions, { category: 'local_verification' });
  assert(verifFiltered.every((a) => a.category === 'local_verification'), 'Filter by category: "local_verification" works accurately');

  const searchFiltered = filterActions(actions, { searchQuery: 'DISCOM' });
  assert(searchFiltered.length >= 1 && searchFiltered.every((a) => a.description?.includes('DISCOM') || a.title?.includes('DISCOM')), 'Search query filtering correctly targets keywords');

  // =========================================================================
  // GROUP 6: Server-side Action Center Service & Mutations
  // =========================================================================
  console.log('\n[Test Group 6: Server-side Action Center Service & Authorization]');

  const testUserId = 'usr_entrepreneur_123';
  const initialServerActions = actionCenterService.generateOrGetActions(
    {
      planId,
      enterprise,
      financialPlan,
      location,
      districtData,
      agriAnalysis,
      matchedSchemes
    },
    testUserId
  );

  assert(initialServerActions.length === actions.length, 'Server initialized identical actions count');

  // Update an action (e.g. record verification)
  const actionToUpdate = initialServerActions[0];
  const updatedAction = actionCenterService.updateAction(
    planId,
    actionToUpdate.id,
    {
      status: 'completed',
      evidence: 'Junior engineer confirmed 15 kW 3-phase line available at pole 42.',
      verificationDetails: {
        method: 'DISCOM Substation Visit',
        findingNotes: 'Feasible within 14 days upon formal fee payment',
        verifiedAt: new Date().toISOString()
      }
    },
    testUserId
  );

  assert(updatedAction.status === 'completed', 'Action status updated to completed on server');
  assert(Boolean(updatedAction.verificationDetails?.method), 'Verification details successfully persisted');

  // Re-fetch summary to test metric reactivity
  const updatedSummary = actionCenterService.getSummary(planId, testUserId);
  assert(updatedSummary.completedActions === 1, 'Summary reflects 1 completed task');
  assert(updatedSummary.completionPercentage > 0, `Completion percentage reacted: ${updatedSummary.completionPercentage}%`);

  // Add custom user action
  const customAction = actionCenterService.addAction(
    planId,
    {
      title: 'Discuss cold storage tie-up with local FPO',
      description: 'Meet FPO secretary on Monday morning to discuss surplus storage.',
      category: 'operations',
      priority: 'important',
      dueDate: '2026-10-15'
    },
    testUserId
  );

  assert(customAction.source === 'user_added', 'User-added task has source: "user_added"');
  assert(customAction.title === 'Discuss cold storage tie-up with local FPO', 'Custom task title preserved');

  const afterAddActions = actionCenterService.getActions(planId, testUserId);
  assert(afterAddActions.some((a) => a.id === customAction.id), 'Custom task retrieved in plan action list');

  // Delete custom action
  const deleteResult = actionCenterService.deleteAction(planId, customAction.id, testUserId);
  assert(deleteResult === true, 'Custom task successfully deleted');
  const afterDeleteActions = actionCenterService.getActions(planId, testUserId);
  assert(!afterDeleteActions.some((a) => a.id === customAction.id), 'Deleted task no longer present');

  // Ownership isolation test
  const unauthorizedUserId = 'usr_hacker_999';
  let isolationEnforced = false;
  try {
    actionCenterService.getActions(planId, unauthorizedUserId);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      isolationEnforced = true;
    }
  }
  assert(isolationEnforced, 'Multi-tenant isolation: unauthorized user cannot access plan actions');

  // Export report
  const exportedText = actionCenterService.exportText(planId, 'Mustard Processing Unit', testUserId);
  assert(exportedText.includes('GRAMUDYAM ACTION CENTER'), 'Exported text contains official GramUdyam header');
  assert(exportedText.includes('EXECUTIVE MONITORING SUMMARY'), 'Exported text contains executive monitoring section');
  assert(exportedText.includes('IMPLEMENTATION MILESTONES'), 'Exported text contains milestone section');

  // =========================================================================
  // GROUP 7: Client-side Storage Invariants
  // =========================================================================
  console.log('\n[Test Group 7: Client-side Guest Storage Functions]');

  // In Node environment, mock localStorage if needed
  if (typeof (global as any).window === 'undefined') {
    const memoryStore: Record<string, string> = {};
    (global as any).window = {
      localStorage: {
        getItem: (k: string) => memoryStore[k] || null,
        setItem: (k: string, v: string) => { memoryStore[k] = v; },
        removeItem: (k: string) => { delete memoryStore[k]; }
      }
    };
  }

  const guestPlanId = 'guest_plan_v12_002';
  saveGuestPlanActions(guestPlanId, actions);
  const fetchedGuestActions = getGuestPlanActions(guestPlanId);
  assert(fetchedGuestActions.length === actions.length, 'Guest storage correctly saves and retrieves action list');

  const guestUpdated = updateGuestPlanAction(guestPlanId, actions[0].id, { status: 'in_progress' });
  assert(guestUpdated?.status === 'in_progress', 'Guest action status updated');

  const guestAdded = addGuestPlanAction(guestPlanId, {
    title: 'Guest Custom Action',
    category: 'finance',
    priority: 'normal'
  });
  assert(guestAdded.source === 'user_added', 'Guest custom action created');

  const guestDeleted = deleteGuestPlanAction(guestPlanId, guestAdded.id);
  assert(guestDeleted === true, 'Guest action deleted');

  // =========================================================================
  // GROUP 8: Non-Negotiable Financial Invariance Check
  // =========================================================================
  console.log('\n[Test Group 8: Financial Engine Invariance Audit]');
  const recalculatedFinancialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: enterprise.id,
    capitalAvailable: availableCapital,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    scenario: 'base'
  });
  const recalculatedFinancialPlan = recalculatedFinancialResult.plan;

  assert(recalculatedFinancialPlan.totalProjectCost === financialPlan.totalProjectCost, 'Financial Invariant: totalProjectCost unaltered');
  assert(recalculatedFinancialPlan.availableCapital === financialPlan.availableCapital, 'Financial Invariant: availableCapital unaltered');
  assert(recalculatedFinancialPlan.financingGap === financialPlan.financingGap, 'Financial Invariant: financingGap unaltered');
  assert(recalculatedFinancialPlan.monthlyEmi === financialPlan.monthlyEmi, 'Financial Invariant: monthlyEmi unaltered');
  assert(recalculatedFinancialPlan.debtServiceCoverageRatio === financialPlan.debtServiceCoverageRatio, 'Financial Invariant: DSCR unaltered');
  assert(recalculatedFinancialPlan.breakEvenSalesPercent === financialPlan.breakEvenSalesPercent, 'Financial Invariant: Break-even unaltered');
  assert(recalculatedFinancialPlan.paybackPeriodYears === financialPlan.paybackPeriodYears, 'Financial Invariant: Payback unaltered');
  assert(recalculatedFinancialPlan.monthlyRevenue === financialPlan.monthlyRevenue, 'Financial Invariant: monthlyRevenue unaltered');
  assert(recalculatedFinancialPlan.profitAfterTax === financialPlan.profitAfterTax, 'Financial Invariant: profitAfterTax unaltered');

  console.log('\n========================================================================');
  console.log(`PHASE 12 RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase12TestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
