/**
 * Phase 13: Execution Evidence & Progress Record Test Suite
 * 
 * Verifies:
 * 1. Data Model (valid evidence, invalid types, missing fields, future/malformed date rejection).
 * 2. CRUD operations (create, read by action/plan/id, update, delete).
 * 3. Multi-tenant ownership isolation (User A vs User B access, edit, delete rejection).
 * 4. Guest mode persistence and offline isolation.
 * 5. Action relationship integrity.
 * 6. Status semantics (adding evidence does NOT mark action completed; completed action does NOT mark evidence verified).
 * 7. Provenance preservation (evidence cannot modify action provenance or source phase).
 * 8. Security & validation (mass assignment defense, ID validation, oversized text rejection, XSS defense).
 * 9. Export & print integration (evidence records and statutory verification disclaimers included).
 * 10. Financial & Upstream Invariance (Phases 3-12 formulas and benchmarks remain 100% unaltered).
 */

import { executionEvidenceService } from './server/services/executionEvidenceService.ts';
import { actionCenterService } from './server/services/actionCenterService.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import {
  generatePlanActions,
  calculateMilestones,
  calculateActionCenterSummary,
  generateActionListText
} from './src/utils/actionGenerator.ts';
import {
  getGuestPlanEvidence,
  saveGuestPlanEvidence,
  getGuestActionEvidence,
  addGuestActionEvidence,
  updateGuestActionEvidence,
  deleteGuestActionEvidence
} from './src/utils/guestStorage.ts';
import {
  ExecutionEvidence,
  EvidenceType,
  EVIDENCE_TYPE_LABELS,
  EVIDENCE_USER_DISCLAIMER
} from './src/types/executionEvidence.ts';

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
console.log('PHASE 13: EXECUTION EVIDENCE & PROGRESS RECORD TEST SUITE');
console.log('========================================================================\n');

async function runPhase13TestSuite() {
  // Reset in-memory evidence service for clean state
  executionEvidenceService.reset();

  const userA = 'usr_entrepreneur_alpha';
  const userB = 'usr_competitor_beta';
  const planA = 'plan_test_p13_alpha';
  const planB = 'plan_test_p13_beta';

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

  const targetActionA = actionsA[0]; // act_p5_power

  // =========================================================================
  // GROUP 1: Data Model Validation
  // =========================================================================
  console.log('[Test Group 1: Data Model Validation]');

  // 1. Valid evidence record
  const validRecord = executionEvidenceService.createEvidence(
    {
      planId: planA,
      actionId: targetActionA.id,
      type: 'site_verification',
      title: 'Commercial 3-Phase Power Feasibility Inspection',
      description: 'Junior engineer at Varanasi DISCOM verified 15 kW commercial feeder capacity at local transformer.',
      referenceNumber: 'DISCOM-VAR-2026-904',
      eventDate: '2026-09-20'
    },
    userA
  );

  assert(validRecord.id.startsWith(planA), 'Valid evidence record generated with stable planId prefix');
  assert(validRecord.type === 'site_verification', 'Evidence type correctly set to site_verification');
  assert(validRecord.source === 'user_recorded', 'Evidence source strictly set to "user_recorded"');
  assert(validRecord.verificationStatus === 'user_recorded', 'Verification status strictly set to "user_recorded"');
  assert(validRecord.disclaimer === EVIDENCE_USER_DISCLAIMER, 'Statutory non-verification disclaimer present on record');
  assert(validRecord.referenceNumber === 'DISCOM-VAR-2026-904', 'Reference number recorded');
  assert(validRecord.eventDate === '2026-09-20', 'Event date correctly recorded');

  // 2. Invalid evidence type rejected
  let invalidTypeCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'unauthorized_government_certificate' as any,
        title: 'Fake Certificate',
        description: 'Should fail validation'
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('Invalid evidence type')) {
      invalidTypeCaught = true;
    }
  }
  assert(invalidTypeCaught, 'Invalid evidence type rejected with descriptive error');

  // 3. Missing title rejected
  let missingTitleCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'note',
        title: '   ',
        description: 'Valid description note'
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('mandatory')) {
      missingTitleCaught = true;
    }
  }
  assert(missingTitleCaught, 'Missing or whitespace title rejected');

  // 4. Missing description rejected
  let missingDescCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'note',
        title: 'Valid Title',
        description: ''
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('mandatory')) {
      missingDescCaught = true;
    }
  }
  assert(missingDescCaught, 'Missing description rejected');

  // 5. Invalid / future event date rejected
  let futureDateCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'meeting_record',
        title: 'Future meeting',
        description: 'Meeting tomorrow',
        eventDate: '2099-12-31'
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('future date') || err.message.includes('Invalid event date')) {
      futureDateCaught = true;
    }
  }
  assert(futureDateCaught, 'Future event date rejected by service');

  let malformedDateCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'meeting_record',
        title: 'Malformed meeting date',
        description: 'Date format wrong',
        eventDate: '31/02/2026'
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('Invalid event date format')) {
      malformedDateCaught = true;
    }
  }
  assert(malformedDateCaught, 'Malformed event date format rejected');

  // =========================================================================
  // GROUP 2: CRUD Operations
  // =========================================================================
  console.log('\n[Test Group 2: CRUD Operations]');

  // 6. Create additional evidence
  const secondEvidence = executionEvidenceService.createEvidence(
    {
      planId: planA,
      actionId: targetActionA.id,
      type: 'quotation',
      title: 'Electrical Substation Feeder Line Estimate',
      description: 'Formal quote received for dedicated commercial transformer connection and cable trenching.',
      referenceNumber: 'QTN-ELEC-4421',
      eventDate: '2026-09-22'
    },
    userA
  );
  assert(Boolean(secondEvidence && secondEvidence.id), 'Create evidence operation succeeded');

  // 7. Read evidence by action
  const actionRecords = executionEvidenceService.getEvidenceByAction(targetActionA.id, planA, userA);
  assert(actionRecords.length === 2, `Retrieved exact 2 records for target action (found ${actionRecords.length})`);
  assert(actionRecords[0].eventDate === '2026-09-22', 'Records ordered newest eventDate first');

  // Read evidence by plan
  const planRecords = executionEvidenceService.getEvidenceByPlan(planA, userA);
  assert(planRecords.length === 2, 'Read by planId retrieved all plan records');

  // Read single evidence by ID
  const fetchedSingle = executionEvidenceService.getEvidenceById(validRecord.id, userA);
  assert(Boolean(fetchedSingle && fetchedSingle.id === validRecord.id), 'Read by ID retrieved exact record');

  // 8. Update evidence
  const updatedRecord = executionEvidenceService.updateEvidence(
    validRecord.id,
    {
      title: 'Commercial 3-Phase Power Feasibility Inspection (Updated)',
      description: 'Junior engineer confirmed transformer upgrade scheduled by end of month.',
      referenceNumber: 'DISCOM-VAR-2026-904-REV'
    },
    userA
  );
  assert(updatedRecord.title.includes('(Updated)'), 'Evidence title successfully updated');
  assert(updatedRecord.referenceNumber === 'DISCOM-VAR-2026-904-REV', 'Evidence reference number updated');
  assert(updatedRecord.id === validRecord.id, 'Evidence ID remains immutable across updates');
  assert(updatedRecord.actionId === validRecord.actionId, 'Evidence actionId remains immutable across updates');

  // 9. Delete evidence
  const deletedResult = executionEvidenceService.deleteEvidence(secondEvidence.id, userA);
  assert(deletedResult === true, 'Delete evidence operation returned true');
  const postDeleteRecords = executionEvidenceService.getEvidenceByAction(targetActionA.id, planA, userA);
  assert(postDeleteRecords.length === 1, 'Post-delete action records count reduced to 1');
  assert(!postDeleteRecords.some((r) => r.id === secondEvidence.id), 'Deleted evidence no longer present');

  // =========================================================================
  // GROUP 3: Multi-Tenant Ownership & Isolation
  // =========================================================================
  console.log('\n[Test Group 3: Multi-Tenant Ownership & Isolation]');

  // 10. User A can access own evidence
  const userARead = executionEvidenceService.getEvidenceById(validRecord.id, userA);
  assert(userARead !== undefined, 'User A successfully accesses own evidence');

  // 11. User B cannot access User A evidence
  let userBReadBlocked = false;
  try {
    executionEvidenceService.getEvidenceById(validRecord.id, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      userBReadBlocked = true;
    }
  }
  assert(userBReadBlocked, 'User B blocked with Forbidden error when attempting to read User A evidence');

  // 12. User B cannot edit User A evidence
  let userBEditBlocked = false;
  try {
    executionEvidenceService.updateEvidence(validRecord.id, { title: 'Malicious modification' }, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      userBEditBlocked = true;
    }
  }
  assert(userBEditBlocked, 'User B blocked with Forbidden error when attempting to edit User A evidence');

  // 13. User B cannot delete User A evidence
  let userBDeleteBlocked = false;
  try {
    executionEvidenceService.deleteEvidence(validRecord.id, userB);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      userBDeleteBlocked = true;
    }
  }
  assert(userBDeleteBlocked, 'User B blocked with Forbidden error when attempting to delete User A evidence');

  // =========================================================================
  // GROUP 4: Guest Mode Persistence & Local Storage
  // =========================================================================
  console.log('\n[Test Group 4: Guest Mode Persistence & Local Storage]');

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

  const guestPlanId = 'guest_plan_p13_001';
  const guestActionId = 'guest_plan_p13_001_act_p8_quotations';

  // 14. Guest can create evidence
  const guestRecord1 = addGuestActionEvidence({
    planId: guestPlanId,
    actionId: guestActionId,
    type: 'quotation',
    title: 'Mustard Oil Expeller Proforma Invoice',
    description: 'Received proforma quotation from Apex Agro Engineering for 6-bolt oil expeller unit.',
    referenceNumber: 'APEX-2026-091',
    eventDate: '2026-09-24'
  });
  assert(Boolean(guestRecord1.id), 'Guest evidence successfully created in local storage');
  assert(guestRecord1.source === 'user_recorded', 'Guest evidence tagged as user_recorded');

  // 15. Guest can retrieve evidence
  const guestRecords = getGuestActionEvidence(guestActionId, guestPlanId);
  assert(guestRecords.length === 1, 'Guest evidence retrieved from local storage');
  assert(guestRecords[0].title === 'Mustard Oil Expeller Proforma Invoice', 'Guest evidence title matches');

  // 16. Guest data remains local
  const guestUpdated = updateGuestActionEvidence(guestRecord1.id, guestPlanId, {
    title: 'Mustard Oil Expeller Proforma Invoice (Updated 10% Discount)'
  });
  assert(Boolean(guestUpdated?.title.includes('10% Discount')), 'Guest evidence updated in local storage');

  const guestDeleted = deleteGuestActionEvidence(guestRecord1.id, guestPlanId);
  assert(guestDeleted === true, 'Guest evidence deleted from local storage');
  const postDeleteGuest = getGuestActionEvidence(guestActionId, guestPlanId);
  assert(postDeleteGuest.length === 0, 'Guest evidence confirmed removed from local storage');

  // =========================================================================
  // GROUP 5: Action Relationship & Tenant Boundaries
  // =========================================================================
  console.log('\n[Test Group 5: Action Relationship & Boundaries]');

  // 17. Evidence requires valid actionId & planId
  let missingActionIdCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: '',
        type: 'note',
        title: 'Note without action',
        description: 'Should fail'
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('actionId is required')) {
      missingActionIdCaught = true;
    }
  }
  assert(missingActionIdCaught, 'Evidence creation rejected when actionId is empty');

  // 18. Evidence cannot attach to another user's plan
  let attachForeignPlanCaught = false;
  try {
    // Attempting to create evidence in User A's plan as User B
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'note',
        title: 'Intruder Note',
        description: 'User B trying to attach evidence to User A plan'
      },
      userB
    );
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      attachForeignPlanCaught = true;
    }
  }
  assert(attachForeignPlanCaught, 'User B blocked from creating evidence inside User A plan');

  // =========================================================================
  // GROUP 6: Status Semantics (Separation of Execution vs Action Status)
  // =========================================================================
  console.log('\n[Test Group 6: Status Semantics & Non-Verification]');

  // 19. Evidence does NOT automatically mark action completed
  const currentActionState = actionCenterService.getActions(planA, userA).find((a) => a.id === targetActionA.id);
  assert(currentActionState?.status !== 'completed', 'Adding evidence does NOT automatically mark action completed');
  assert(currentActionState?.status === 'needs_verification', 'Action status remains strictly controlled by user');

  // 20. Completed action does NOT imply evidence verification
  const markedCompletedAction = actionCenterService.updateAction(planA, targetActionA.id, { status: 'completed' }, userA);
  assert(markedCompletedAction.status === 'completed', 'Action status updated to completed');

  const evidenceAfterComplete = executionEvidenceService.getEvidenceById(validRecord.id, userA);
  assert(evidenceAfterComplete?.verificationStatus === 'user_recorded', 'Evidence verificationStatus remains strictly "user_recorded"');
  assert(evidenceAfterComplete?.source === 'user_recorded', 'Evidence source remains strictly "user_recorded"');

  // =========================================================================
  // GROUP 7: Provenance Preservation
  // =========================================================================
  console.log('\n[Test Group 7: Provenance Preservation]');

  // 21. Evidence cannot modify action provenance
  assert(markedCompletedAction.source === 'phase_5', 'Action source remains immutable (phase_5)');
  assert(markedCompletedAction.guidanceType === 'local_verification', 'Action guidanceType remains immutable (local_verification)');

  // 22. Evidence cannot modify source phase
  const allCurrentActions = actionCenterService.getActions(planA, userA);
  const powerAct = allCurrentActions.find((a) => a.id === targetActionA.id);
  assert(Boolean(powerAct?.sourceLabel?.includes('Phase 5')), 'Source label remains intact with upstream phase benchmark');

  // =========================================================================
  // GROUP 8: Security, Sanitization & Mass Assignment Defense
  // =========================================================================
  console.log('\n[Test Group 8: Security & Mass Assignment Defense]');

  // 23. Mass assignment rejected (attacker cannot overwrite id, createdAt, or inject arbitrary roles)
  const massAssignUpdate = executionEvidenceService.updateEvidence(
    validRecord.id,
    {
      title: 'Clean Updated Title',
      // Attacker attempts mass assignment
      id: 'hacked_id',
      createdAt: '1970-01-01T00:00:00.000Z',
      verificationStatus: 'officially_verified_government'
    } as any,
    userA
  );
  assert(massAssignUpdate.id === validRecord.id, 'Mass assignment defense: ID unchanged');
  assert(massAssignUpdate.verificationStatus === 'user_recorded', 'Mass assignment defense: verificationStatus uncompromised');
  assert(massAssignUpdate.createdAt === validRecord.createdAt, 'Mass assignment defense: createdAt uncompromised');

  // 24. Malformed IDs handled safely
  const notFoundRecord = executionEvidenceService.getEvidenceById('non_existent_id', userA);
  assert(notFoundRecord === undefined, 'Non-existent ID safely returns undefined without error leak');

  // 25. XSS payload safely handled as text
  const xssPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
  const xssRecord = executionEvidenceService.createEvidence(
    {
      planId: planA,
      actionId: targetActionA.id,
      type: 'note',
      title: xssPayload,
      description: xssPayload
    },
    userA
  );
  assert(xssRecord.title === xssPayload, 'XSS string stored safely as inert plain-text without execution');

  // 26. Oversized text rejected
  let oversizedTitleCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'note',
        title: 'A'.repeat(161),
        description: 'Normal description'
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('exceeds maximum limit of 160')) {
      oversizedTitleCaught = true;
    }
  }
  assert(oversizedTitleCaught, 'Oversized title (>160 chars) rejected');

  let oversizedDescCaught = false;
  try {
    executionEvidenceService.createEvidence(
      {
        planId: planA,
        actionId: targetActionA.id,
        type: 'note',
        title: 'Normal Title',
        description: 'B'.repeat(2001)
      },
      userA
    );
  } catch (err: any) {
    if (err.message.includes('exceeds maximum limit of 2000')) {
      oversizedDescCaught = true;
    }
  }
  assert(oversizedDescCaught, 'Oversized description (>2000 chars) rejected');

  // =========================================================================
  // GROUP 9: Export & Print Integration
  // =========================================================================
  console.log('\n[Test Group 9: Export & Print Integration]');

  const summary = calculateActionCenterSummary(planA, actionsA);
  const evidenceListForExport = executionEvidenceService.getEvidenceByPlan(planA, userA);

  const exportedText = generateActionListText(
    'Mustard Processing Unit',
    summary,
    actionsA,
    evidenceListForExport
  );

  // 27. Evidence appears in export output
  assert(exportedText.includes('Progress Records'), 'Export text includes Progress Records section');
  assert(exportedText.includes('Clean Updated Title'), 'Export text includes specific evidence title');

  // 28. Evidence type label appears in copy/export
  assert(exportedText.includes('Site Verification'), 'Export text includes human-readable evidence type label');

  // 29. Statutory non-verification disclaimer appears in export
  assert(exportedText.includes('User-recorded evidence (not independently verified)'), 'Export text includes inline non-verification disclaimer');
  assert(exportedText.includes('STATUTORY ADVISORY & EXECUTION MONITORING NOTICE'), 'Export text includes official statutory advisory banner');

  // =========================================================================
  // GROUP 10: Non-Negotiable Financial & Upstream Invariance
  // =========================================================================
  console.log('\n[Test Group 10: Financial & Upstream Invariance]');

  const postPhase13FinancialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: enterprise.id,
    capitalAvailable: availableCapital,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    scenario: 'base'
  });
  const postPlan = postPhase13FinancialResult.plan;

  assert(postPlan.totalProjectCost === financialPlan.totalProjectCost, 'Financial Invariant: totalProjectCost unaltered');
  assert(postPlan.availableCapital === financialPlan.availableCapital, 'Financial Invariant: availableCapital unaltered');
  assert(postPlan.financingGap === financialPlan.financingGap, 'Financial Invariant: financingGap unaltered');
  assert(postPlan.monthlyEmi === financialPlan.monthlyEmi, 'Financial Invariant: monthlyEmi unaltered');
  assert(postPlan.debtServiceCoverageRatio === financialPlan.debtServiceCoverageRatio, 'Financial Invariant: DSCR unaltered');
  assert(postPlan.paybackPeriodYears === financialPlan.paybackPeriodYears, 'Financial Invariant: paybackPeriodYears unaltered');
  assert(postPlan.monthlyRevenue === financialPlan.monthlyRevenue, 'Financial Invariant: monthlyRevenue unaltered');
  assert(postPlan.profitAfterTax === financialPlan.profitAfterTax, 'Financial Invariant: profitAfterTax unaltered');

  console.log('\n========================================================================');
  console.log(`PHASE 13 RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase13TestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
