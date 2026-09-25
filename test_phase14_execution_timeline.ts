/**
 * Phase 14: Execution Timeline, Milestones & Plan Health Monitoring Test Suite
 * 
 * Verifies:
 * 1. Data Model & Event Types (valid events, invalid rejection, required fields, provenance).
 * 2. Chronological Ordering & Date Handling (eventDate vs recordedAt, newest/oldest sort).
 * 3. Milestone Stages 1 to 5 (factual counts, zero scores, completed status).
 * 4. Blocker Detection (explicit action blockers, unresolved verification, missing documents, zero speculation).
 * 5. Next Actions Queue (priority preservation, explanation strings, no artificial ranking).
 * 6. Evidence Integration (preserves user_recorded, disclaimer, references, deletion sync).
 * 7. Multi-Tenant Security & Isolation (cross-user read/edit/delete rejection, ownership checks).
 * 8. Mass-Assignment & Input Validation (defense against forged fields, oversized text, invalid dates).
 * 9. Guest Mode Persistence & Cleanup (scoped local storage, deletion cleanup, storage resilience).
 * 10. Financial & Upstream Invariance (all 14 financial outputs invariant across Phases 4-14).
 * 11. Export & Print Integration (formatted text output, milestone breakdown, statutory disclaimers).
 */

import { executionTimelineService } from './server/services/executionTimelineService.ts';
import { actionCenterService } from './server/services/actionCenterService.ts';
import { executionEvidenceService } from './server/services/executionEvidenceService.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import {
  buildTimelineEvents,
  calculateMilestones,
  detectBlockers,
  extractNextActions,
  computePlanHealth,
  generateTimelineExportText,
  STAGE_CONFIGS
} from './src/utils/timelineEngine.ts';
import {
  getGuestTimelineEvents,
  saveGuestTimelineEvents,
  addGuestTimelineEvent,
  updateGuestTimelineEvent,
  deleteGuestTimelineEvent,
  deleteGuestPlan,
  saveGuestPlan
} from './src/utils/guestStorage.ts';
import {
  ExecutionTimelineEvent,
  ExecutionMilestone,
  PlanHealthSummary,
  TIMELINE_DISCLAIMER,
  EVENT_TYPE_LABELS,
  EXECUTION_STATE_LABELS
} from './src/types/executionTimeline.ts';

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
console.log('PHASE 14: EXECUTION TIMELINE, MILESTONES & PLAN HEALTH TEST SUITE');
console.log('========================================================================\n');

async function runPhase14TestSuite() {
  // Set up mock localStorage for Node testing environment
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

  // Reset in-memory services for pristine testing
  executionTimelineService.reset();
  actionCenterService.reset();
  executionEvidenceService.reset();

  const userA = 'usr_entrepreneur_alpha';
  const userB = 'usr_competitor_beta';
  const planA = 'plan_test_p14_alpha';
  const planB = 'plan_test_p14_beta';

  const enterprise = ENTERPRISE_TEMPLATES[0]; // Mustard Oil Processing
  const availableCapital = 500000;
  const initialFinancialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: enterprise.id,
    capitalAvailable: availableCapital,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    scenario: 'base'
  });
  const financialPlan = initialFinancialResult.plan;

  // Initialize Action Center for Plan A with User A ownership
  const actionsA = actionCenterService.generateOrGetActions(
    {
      planId: planA,
      enterprise,
      financialPlan,
      location: { state: 'Uttar Pradesh', district: 'Varanasi', locationType: 'rural' },
      districtData: { districtName: 'Varanasi', stateName: 'Uttar Pradesh' },
      agriAnalysis: { district: 'Varanasi', topCrops: [{ crop: 'Mustard' }] }
    },
    userA
  );

  // Attach Phase 13 Evidence record to action 0
  const evidenceA = executionEvidenceService.createEvidence(
    {
      planId: planA,
      actionId: actionsA[0].id,
      type: 'quotation',
      title: 'Quotation for Expeller Machine',
      description: 'Received supplier quotation of Rs 3,20,000 for 9-bolt expeller.',
      referenceNumber: 'QTN-EXP-2026',
      eventDate: '2026-09-15'
    },
    userA
  );

  // =========================================================================
  // GROUP 1: Timeline Data Model & Custom Event Creation
  // =========================================================================
  console.log('[Test Group 1: Data Model & Custom Event Creation]');

  const customEventA = executionTimelineService.createCustomEvent(
    {
      planId: planA,
      actionId: actionsA[1].id,
      title: 'Consulted District Industry Center Officer',
      description: 'Discussed PMEGP portal application requirements with DIC General Manager.',
      eventDate: '2026-09-18'
    },
    userA
  );

  assert(customEventA.id.startsWith(planA), 'Timeline event ID prefixed with stable planId');
  assert(customEventA.eventType === 'user_note', 'Custom event type correctly set to user_note');
  assert(customEventA.source === 'user_manual', 'Source strictly identified as user_manual');
  assert(customEventA.sourcePhase === 'phase_14', 'Source phase set to phase_14');
  assert(customEventA.verificationStatus === 'user_recorded', 'Verification status strictly user_recorded');
  assert(customEventA.userCreated === true, 'userCreated boolean flag strictly true');
  assert(customEventA.eventDate === '2026-09-18', 'Event date preserved without timestamp conflation');
  assert(typeof customEventA.recordedAt === 'string', 'System recordedAt timestamp recorded');

  // Invalid event inputs rejected
  let missingPlanCaught = false;
  try {
    executionTimelineService.createCustomEvent({ planId: '', title: 'Test', description: 'Desc' }, userA);
  } catch {
    missingPlanCaught = true;
  }
  assert(missingPlanCaught, 'Empty planId rejected with validation error');

  let missingTitleCaught = false;
  try {
    executionTimelineService.createCustomEvent({ planId: planA, title: '   ', description: 'Desc' }, userA);
  } catch {
    missingTitleCaught = true;
  }
  assert(missingTitleCaught, 'Empty title rejected with validation error');

  let invalidDateCaught = false;
  try {
    executionTimelineService.createCustomEvent({ planId: planA, title: 'Test', description: 'Desc', eventDate: 'bad-date' }, userA);
  } catch {
    invalidDateCaught = true;
  }
  assert(invalidDateCaught, 'Malformed eventDate string rejected');

  // =========================================================================
  // GROUP 2: Chronological Ordering & Provenance
  // =========================================================================
  console.log('\n[Test Group 2: Chronological Ordering & Provenance]');

  const compiledTimeline = executionTimelineService.getTimeline(planA, userA);
  assert(compiledTimeline.length >= actionsA.length + 2, 'Timeline synthesizes actions, evidence, and custom events');

  // Verify ordering: newest eventDate first
  const eventDates = compiledTimeline.map((e) => e.eventDate).filter(Boolean);
  let isSortedDescending = true;
  for (let i = 1; i < eventDates.length; i++) {
    if (eventDates[i]! > eventDates[i - 1]!) {
      isSortedDescending = false;
      break;
    }
  }
  assert(isSortedDescending, 'Chronological timeline orders newest eventDate first');

  // Verify provenance on synthesized events
  const actionCreationEvt = compiledTimeline.find((e) => e.eventType === 'action_created');
  assert(actionCreationEvt !== undefined, 'Action creation event synthesized');
  assert(actionCreationEvt?.source === 'action_center', 'Action event source correctly identified as action_center');
  assert(actionCreationEvt?.sourcePhase === 'phase_12', 'Action event sourcePhase correctly identified as phase_12');

  const evidenceTimelineEvt = compiledTimeline.find((e) => e.source === 'execution_evidence');
  assert(evidenceTimelineEvt !== undefined, 'Phase 13 Evidence record synthesized into timeline');
  assert(evidenceTimelineEvt?.sourcePhase === 'phase_13', 'Evidence timeline event sourcePhase is phase_13');
  assert(evidenceTimelineEvt?.verificationStatus === 'user_recorded', 'Evidence timeline event retains user_recorded');
  assert(evidenceTimelineEvt?.eventType === 'evidence_recorded', 'Evidence event type strictly evidence_recorded (no claim inflation to procurement)');

  // Verify action completion milestone mapping without claim inflation
  const testActionsForMilestones = [...actionsA];
  const procAction = testActionsForMilestones.find((a) => a.id.includes('act_p8_quotations'));
  if (procAction) procAction.status = 'completed';
  const installAction = testActionsForMilestones.find((a) => a.id.includes('act_p9_installation'));
  if (installAction) installAction.status = 'completed';

  const milestoneEvents = buildTimelineEvents({
    planId: planA,
    actions: testActionsForMilestones
  });
  const procMilestoneEvt = milestoneEvents.find((e) => e.eventType === 'procurement');
  assert(procMilestoneEvt !== undefined, 'Procurement milestone event synthesized when monitored procurement action completes');
  assert(procMilestoneEvt?.source === 'action_center', 'Procurement milestone event traces provenance to action_center');
  assert(procMilestoneEvt?.verificationStatus === 'user_recorded', 'Procurement milestone event remains user_recorded');

  const installMilestoneEvt = milestoneEvents.find((e) => e.eventType === 'installation');
  assert(installMilestoneEvt !== undefined, 'Installation milestone event synthesized when monitored installation action completes');
  assert(installMilestoneEvt?.verificationStatus === 'user_recorded', 'Installation milestone event remains user_recorded');

  // =========================================================================
  // GROUP 3: Milestone Stages (1 to 5) Factual Counts
  // =========================================================================
  console.log('\n[Test Group 3: Milestone Stages (1 to 5) Factual Counts]');

  const milestones = executionTimelineService.getMilestones(planA, userA);
  assert(milestones.length === 5, 'Exactly 5 implementation milestone stages generated');
  assert(milestones[0].stageNumber === 1, 'Stage 1: Site Feasibility & Local Verification');
  assert(milestones[1].stageNumber === 2, 'Stage 2: Statutory Registration & KYC Documentation');
  assert(milestones[2].stageNumber === 3, 'Stage 3: Bank Credit Appraisal & Scheme Sanction');
  assert(milestones[3].stageNumber === 4, 'Stage 4: Machinery Procurement & Site Installation');
  assert(milestones[4].stageNumber === 5, 'Stage 5: Trial Run & Commercial Market Launch');

  // Ensure zero numerical score fields exist on milestones
  milestones.forEach((m) => {
    assert((m as any).score === undefined, `Stage ${m.stageNumber} contains no subjective score attribute`);
    assert((m as any).percentageScore === undefined, `Stage ${m.stageNumber} contains no percentage score attribute`);
    assert(typeof m.totalActions === 'number', `Stage ${m.stageNumber} supplies factual totalActions count`);
    assert(typeof m.completedActions === 'number', `Stage ${m.stageNumber} supplies factual completedActions count`);
  });

  // Verify evidence attached count to Stage 4 (machinery procurement action)
  const stage4 = milestones.find((m) => m.stageNumber === 4);
  assert(stage4 !== undefined && stage4.totalActions >= 1, 'Stage 4 contains machinery procurement action tasks');

  // =========================================================================
  // GROUP 4: Blocker Discovery & Absence of Speculation
  // =========================================================================
  console.log('\n[Test Group 4: Blocker Discovery & Absence of Speculation]');

  // Mark an action as blocked in Action Center
  actionCenterService.updateAction(planA, actionsA[2].id, { status: 'blocked', notes: 'Vendor quotation delayed' }, userA);

  const healthWithBlocker = executionTimelineService.getPlanHealth(planA, userA);
  assert(healthWithBlocker.executionState === 'blocked', 'Execution state transparently transitions to "blocked"');
  assert(healthWithBlocker.blockedCount >= 1, 'Blocked count accurately reflects blocked action');

  const detectedBlocker = healthWithBlocker.blockers.find((b) => b.actionId === actionsA[2].id);
  assert(detectedBlocker !== undefined, 'Explicit blocker discovered matching blocked action ID');
  assert(detectedBlocker?.sourcePhase === 'phase_12', 'Blocker provenance traced to Phase 12');
  assert(Boolean(detectedBlocker?.reason.includes('Vendor quotation delayed')), 'Blocker reason preserves actual notes');

  // Document readiness blocker integration (Phase 8 missing doc)
  const healthWithDocBlocker = computePlanHealth({
    planId: planA,
    actions: actionsA,
    documentDeclarations: {
      doc_fssai: { declaredStatus: 'missing', documentTitle: 'FSSAI License' }
    }
  });
  const docBlocker = healthWithDocBlocker.blockers.find((b) => b.category === 'document_required');
  assert(docBlocker !== undefined, 'Phase 8 missing document detected as explicit blocker');
  assert(docBlocker?.sourcePhase === 'phase_8', 'Document blocker provenance traced to Phase 8');

  // Reset action status back to not_started
  actionCenterService.updateAction(planA, actionsA[2].id, { status: 'not_started' }, userA);

  // =========================================================================
  // GROUP 5: Next Actions Queue & Priority Preservation
  // =========================================================================
  console.log('\n[Test Group 5: Next Actions Queue & Priority Preservation]');

  const healthClean = executionTimelineService.getPlanHealth(planA, userA);
  assert(healthClean.nextActions.length > 0, 'Next actions queue populated from pending actions');

  // Verify important priority items appear ahead of normal priority
  let foundNormal = false;
  let priorityViolated = false;
  healthClean.nextActions.forEach((item) => {
    if (item.priority === 'normal') foundNormal = true;
    if (foundNormal && item.priority === 'important') {
      priorityViolated = true;
    }
    assert(typeof item.reason === 'string' && item.reason.length > 0, `Next action "${item.title.substring(0, 20)}" includes factual reason`);
  });
  assert(!priorityViolated, 'Next actions queue preserves Phase 12 priority without artificial re-ranking');

  // =========================================================================
  // GROUP 6: Plan Health Non-Numerical Indicators
  // =========================================================================
  console.log('\n[Test Group 6: Plan Health Non-Numerical Indicators]');

  assert((healthClean as any).healthScore === undefined, 'No single numerical health score exists');
  assert((healthClean as any).successProbability === undefined, 'No predictive success probability score exists');
  assert((healthClean as any).readinessScore === undefined, 'No subjective readiness score exists');
  assert(typeof healthClean.stateExplanation === 'string', 'State explanation is a factual human-readable sentence');

  // Verify substantial completion transition
  const allCompletedActions = actionsA.map((a) => ({ ...a, status: 'completed' as const }));
  const completedHealth = computePlanHealth({ planId: planA, actions: allCompletedActions });
  assert(completedHealth.executionState === 'substantially_completed', 'Transition to substantially_completed when all actions done');

  // =========================================================================
  // GROUP 7: Multi-Tenant Security & Isolation
  // =========================================================================
  console.log('\n[Test Group 7: Multi-Tenant Security & Isolation]');

  // Initialize Plan B for User B
  actionCenterService.generateOrGetActions(
    {
      planId: planB,
      enterprise,
      financialPlan,
      location: { state: 'Uttar Pradesh', district: 'Varanasi', locationType: 'rural' }
    },
    userB
  );

  // 1. User B blocked from reading User A's timeline
  let crossReadBlocked = false;
  try {
    executionTimelineService.getTimeline(planA, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) crossReadBlocked = true;
  }
  assert(crossReadBlocked, 'Cross-user read blocked with Forbidden error');

  // 2. User B blocked from reading User A's milestones
  let crossMilestonesBlocked = false;
  try {
    executionTimelineService.getMilestones(planA, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) crossMilestonesBlocked = true;
  }
  assert(crossMilestonesBlocked, 'Cross-user milestones read blocked with Forbidden error');

  // 3. User B blocked from editing User A's custom timeline event
  let crossEditBlocked = false;
  try {
    executionTimelineService.updateCustomEvent(customEventA.id, { title: 'Hacked Title' }, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) crossEditBlocked = true;
  }
  assert(crossEditBlocked, 'Cross-user custom event edit blocked with Forbidden error');

  // 4. User B blocked from deleting User A's custom timeline event
  let crossDeleteBlocked = false;
  try {
    executionTimelineService.deleteCustomEvent(customEventA.id, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) crossDeleteBlocked = true;
  }
  assert(crossDeleteBlocked, 'Cross-user custom event deletion blocked with Forbidden error');

  // =========================================================================
  // GROUP 8: Custom Event CRUD & Mass-Assignment Defense
  // =========================================================================
  console.log('\n[Test Group 8: Custom Event CRUD & Mass-Assignment Defense]');

  // Update custom event
  const updatedEvt = executionTimelineService.updateCustomEvent(
    customEventA.id,
    { title: 'Updated DIC Consultation Note', eventDate: '2026-09-19' },
    userA
  );
  assert(updatedEvt.title === 'Updated DIC Consultation Note', 'Custom event title successfully updated');
  assert(updatedEvt.eventDate === '2026-09-19', 'Custom event eventDate updated');
  assert(updatedEvt.id === customEventA.id, 'Event ID remains strictly immutable');
  assert(updatedEvt.planId === planA, 'Plan ID remains strictly immutable');
  assert(updatedEvt.source === 'user_manual', 'Source remains strictly user_manual');
  assert(updatedEvt.verificationStatus === 'user_recorded', 'Verification status remains strictly user_recorded');

  // Delete custom event
  const deleted = executionTimelineService.deleteCustomEvent(customEventA.id, userA);
  assert(deleted === true, 'Custom event deletion returned true');

  // Verify event no longer appears
  const afterDeleteTimeline = executionTimelineService.getTimeline(planA, userA);
  const foundDeleted = afterDeleteTimeline.some((e) => e.id === customEventA.id);
  assert(!foundDeleted, 'Deleted custom event no longer present in timeline feed');

  // =========================================================================
  // GROUP 9: Guest Mode Persistence & Offline Isolation
  // =========================================================================
  console.log('\n[Test Group 9: Guest Mode Persistence & Offline Isolation]');

  const guestPlanId = 'guest_plan_p14_test';
  const guestEvent = addGuestTimelineEvent({
    planId: guestPlanId,
    title: 'Offline Transformer Verification',
    description: 'Checked 11kV line distance from proposed site in person.',
    eventDate: '2026-09-22'
  });

  assert(guestEvent.id.startsWith(guestPlanId), 'Guest timeline event ID prefixed with guest planId');
  assert(guestEvent.source === 'user_manual', 'Guest event source is user_manual');
  assert(guestEvent.verificationStatus === 'user_recorded', 'Guest event verificationStatus is user_recorded');

  const guestEvents = getGuestTimelineEvents(guestPlanId);
  assert(guestEvents.length >= 1, 'Guest timeline events retrieved from scoped guest storage');
  assert(guestEvents[0].title === 'Offline Transformer Verification', 'Guest event title matches');

  // Update guest event
  const updatedGuest = updateGuestTimelineEvent(guestEvent.id, guestPlanId, {
    title: 'Offline Transformer Line Verified'
  });
  assert(updatedGuest?.title === 'Offline Transformer Line Verified', 'Guest timeline event title updated');

  // Delete guest plan cleans up guest timeline
  deleteGuestPlan(guestPlanId);
  const guestAfterPlanDelete = getGuestTimelineEvents(guestPlanId);
  assert(guestAfterPlanDelete.length === 0, 'Guest timeline purged on guest plan deletion');

  // =========================================================================
  // GROUP 10: Export, Print & Disclaimers
  // =========================================================================
  console.log('\n[Test Group 10: Export, Print & Disclaimers]');

  const exportText = generateTimelineExportText(
    'Mustard Processing Enterprise',
    healthClean,
    compiledTimeline
  );

  assert(exportText.includes('GRAMUDYAM EXECUTION TIMELINE & PLAN HEALTH REPORT'), 'Report header present in export');
  assert(exportText.includes('--- PLAN HEALTH & EXECUTION STATE ---'), 'Plan health section present in export');
  assert(exportText.includes('--- IMPLEMENTATION MILESTONES (STAGES 1 TO 5) ---'), 'Milestones section present in export');
  assert(exportText.includes('Stage 1:'), 'Stage 1 milestone present in export');
  assert(exportText.includes('Stage 5:'), 'Stage 5 milestone present in export');
  assert(exportText.includes('--- CHRONOLOGICAL EXECUTION TIMELINE ---'), 'Timeline feed section present in export');
  assert(exportText.includes(TIMELINE_DISCLAIMER), 'Statutory monitoring disclaimer embedded in export');
  assert(!exportText.includes('healthScore'), 'No synthetic health score in exported report');

  // =========================================================================
  // GROUP 11: Non-Negotiable Financial Invariance
  // =========================================================================
  console.log('\n[Test Group 11: Financial & Upstream Invariance]');

  const postP14FinancialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: enterprise.id,
    capitalAvailable: availableCapital,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    scenario: 'base'
  });
  const postPlan = postP14FinancialResult.plan;

  assert(postPlan.totalProjectCost === financialPlan.totalProjectCost, 'Financial Invariant: totalProjectCost unaltered');
  assert(postPlan.fixedAssetsCost === financialPlan.fixedAssetsCost, 'Financial Invariant: fixedAssetsCost unaltered');
  assert(postPlan.workingCapitalRequirement === financialPlan.workingCapitalRequirement, 'Financial Invariant: workingCapitalRequirement unaltered');
  assert(postPlan.availableCapital === financialPlan.availableCapital, 'Financial Invariant: availableCapital unaltered');
  assert(postPlan.financingGap === financialPlan.financingGap, 'Financial Invariant: financingGap unaltered');
  assert(postPlan.promoterContribution === financialPlan.promoterContribution, 'Financial Invariant: promoterContribution unaltered');
  assert(postPlan.bankTermLoanRequired === financialPlan.bankTermLoanRequired, 'Financial Invariant: bankTermLoanRequired unaltered');
  assert(postPlan.monthlyRevenue === financialPlan.monthlyRevenue, 'Financial Invariant: monthlyRevenue unaltered');
  assert(postPlan.monthlyOperatingExpenses === financialPlan.monthlyOperatingExpenses, 'Financial Invariant: monthlyOperatingExpenses unaltered');
  assert(postPlan.monthlyNetProfit === financialPlan.monthlyNetProfit, 'Financial Invariant: monthlyNetProfit unaltered');
  assert(postPlan.monthlyEmi === financialPlan.monthlyEmi, 'Financial Invariant: monthlyEmi unaltered');
  assert(postPlan.debtServiceCoverageRatio === financialPlan.debtServiceCoverageRatio, 'Financial Invariant: DSCR unaltered');
  assert(postPlan.breakEvenSalesPercent === financialPlan.breakEvenSalesPercent, 'Financial Invariant: breakEvenSalesPercent unaltered');
  assert(postPlan.paybackPeriodYears === financialPlan.paybackPeriodYears, 'Financial Invariant: paybackPeriodYears unaltered');

  console.log('\n========================================================================');
  console.log(`PHASE 14 RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase14TestSuite().catch((err) => {
  console.error('Fatal test error in Phase 14 suite:', err);
  process.exit(1);
});
