/**
 * Phase 10: Plan Workspace, Persistence, Sharing, Revocation & Financial Invariance Test Suite
 */

import { businessPlanService } from './server/services/businessPlanService.ts';
import { authService } from './server/services/authService.ts';
import { assembleBusinessPlan } from './src/utils/businessPlanGenerator.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { generatePlanHtml, generatePlanText } from './src/utils/exportPlan.ts';
import {
  saveGuestPlan,
  getGuestSavedPlans,
  getGuestPlanById,
  updateGuestPlanNarrative,
  updateGuestPlanStatus,
  updateGuestPlanTitle,
  deleteGuestPlan
} from './src/utils/guestStorage.ts';

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

console.log('======================================================');
console.log('PHASE 10: PLAN WORKSPACE, PERSISTENCE & SHARING AUDIT');
console.log('======================================================\n');

// 1. Setup Test Users
console.log('[Test Group 1: Authenticated User Setup & Ownership Isolation]');
const userAlphaSession = authService.registerUser({
  email: `alpha_${Date.now()}@example.com`,
  fullName: 'Entrepreneur Alpha',
  password: 'SecurePassword123!',
  state: 'Uttar Pradesh',
  district: 'Varanasi'
});
const userAlphaId = userAlphaSession.user.id;

const userBetaSession = authService.registerUser({
  email: `beta_${Date.now()}@example.com`,
  fullName: 'Entrepreneur Beta',
  password: 'SecurePassword123!',
  state: 'Bihar',
  district: 'Patna'
});
const userBetaId = userBetaSession.user.id;

assert(Boolean(userAlphaId && userBetaId && userAlphaId !== userBetaId), 'Two distinct authenticated users created');

// 2. Build Plan for User Alpha
const template = ENTERPRISE_TEMPLATES.find((t) => t.id === 'ent_oil_expeller')!;
const financialResult = financialEngineService.generateFinancialProjections({
  enterpriseId: template.id,
  capitalAvailable: 250000,
  promoterCategory: 'general',
  locationType: 'rural',
  state: 'Uttar Pradesh',
  district: 'Varanasi',
  scenario: 'base'
});
const financialPlan = financialResult.plan;

const originalPlan = assembleBusinessPlan({
  enterprise: template,
  financialPlan,
  availableCapital: 250000,
  location: {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    locationType: 'rural'
  }
});

// 3. Save Plan for User Alpha
console.log('\n[Test Group 2: User A Plan Persistence & Retrieval]');
const savedRecordA = businessPlanService.savePlan(userAlphaId, false, originalPlan, 'Alpha Mustard Oil Mill Project');
assert(savedRecordA.id === originalPlan.id, 'Plan saved with correct plan ID');
assert(savedRecordA.userId === userAlphaId, 'Plan saved with User Alpha ownership');
assert(savedRecordA.isGuest === false, 'Plan is not marked as guest');
assert(savedRecordA.status === 'active', 'Plan status defaults to active');
assert(savedRecordA.title === 'Alpha Mustard Oil Mill Project', 'Plan title saved correctly');

// Retrieval by User Alpha
const retrievedA = businessPlanService.getPlanById(originalPlan.id, userAlphaId, false);
assert(retrievedA.id === originalPlan.id, 'User Alpha can retrieve own plan');
assert(retrievedA.title === 'Alpha Mustard Oil Mill Project', 'Retrieved plan has correct title');

// User Alpha plan listing
const userAPlans = businessPlanService.getUserPlans(userAlphaId);
assert(userAPlans.length >= 1, 'User Alpha plan listing contains at least 1 plan');
assert(userAPlans.some((p) => p.id === originalPlan.id), 'User Alpha listing includes saved plan');

// 4. User B Authorization Audit (IDOR Prevention)
console.log('\n[Test Group 3: User B Authorization & Access Control (IDOR Audit)]');
try {
  businessPlanService.getPlanById(originalPlan.id, userBetaId, false);
  assert(false, 'User Beta should be forbidden from reading User Alpha plan');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta read attempt correctly rejected with Forbidden');
}

try {
  businessPlanService.updatePlanNarrative(originalPlan.id, userBetaId, { businessObjectives: 'Hijacked' }, false);
  assert(false, 'User Beta should be forbidden from updating User Alpha narrative');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta narrative update rejected with Forbidden');
}

try {
  businessPlanService.updatePlanStatus(originalPlan.id, userBetaId, 'archived', false);
  assert(false, 'User Beta should be forbidden from updating User Alpha plan status');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta status update rejected with Forbidden');
}

try {
  businessPlanService.updatePlanTitle(originalPlan.id, userBetaId, 'Stolen Plan', false);
  assert(false, 'User Beta should be forbidden from updating User Alpha plan title');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta title update rejected with Forbidden');
}

try {
  businessPlanService.createShareToken(originalPlan.id, userBetaId, false);
  assert(false, 'User Beta should be forbidden from creating share token for User Alpha plan');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta share creation rejected with Forbidden');
}

try {
  businessPlanService.revokeShareToken(originalPlan.id, userBetaId, false);
  assert(false, 'User Beta should be forbidden from revoking share token for User Alpha plan');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta share revocation rejected with Forbidden');
}

try {
  businessPlanService.deletePlan(originalPlan.id, userBetaId, false);
  assert(false, 'User Beta should be forbidden from deleting User Alpha plan');
} catch (err: any) {
  assert(err.message.includes('Forbidden'), 'User Beta delete attempt rejected with Forbidden');
}

// User Beta's own plan listing should be empty
const userBPlans = businessPlanService.getUserPlans(userBetaId);
assert(userBPlans.length === 0, 'User Beta plan listing does not contain User Alpha plans');

// 5. Narrative Isolation & Mutation Protection
console.log('\n[Test Group 4: Narrative Isolation & Invariance]');
const narrativePayload = {
  businessObjectives: 'Establish state-of-the-art cold pressed mustard oil extraction facility in Varanasi.',
  targetCustomersAndMarket: 'Local grocery networks and direct-to-consumer artisanal brand.',
  operationalNotes: 'Sourcing certified non-GMO mustard seeds from local APMC mandi.',
  promoterRemarks: 'Promoter brings 4 years of family agro-commodity trading experience.'
};

const updatedRecord = businessPlanService.updatePlanNarrative(originalPlan.id, userAlphaId, narrativePayload, false);
assert(updatedRecord.plan.narrative?.businessObjectives === narrativePayload.businessObjectives, 'businessObjectives updated');
assert(updatedRecord.plan.narrative?.targetCustomersAndMarket === narrativePayload.targetCustomersAndMarket, 'targetCustomersAndMarket updated');
assert(updatedRecord.plan.narrative?.operationalNotes === narrativePayload.operationalNotes, 'operationalNotes updated');
assert(updatedRecord.plan.narrative?.promoterRemarks === narrativePayload.promoterRemarks, 'promoterRemarks updated');
assert(Boolean(updatedRecord.plan.narrative?.lastEditedAt), 'narrative lastEditedAt timestamp populated');

// 6. Source-of-Truth Financial Invariance
console.log('\n[Test Group 5: Source-of-Truth Financial Invariance]');
assert(updatedRecord.plan.financials.totalProjectCost === originalPlan.financials.totalProjectCost, 'totalProjectCost strictly unchanged');
assert(updatedRecord.plan.financials.fixedAssetsCost === originalPlan.financials.fixedAssetsCost, 'fixedAssetsCost strictly unchanged');
assert(updatedRecord.plan.financials.workingCapitalRequirement === originalPlan.financials.workingCapitalRequirement, 'workingCapitalRequirement strictly unchanged');
assert(updatedRecord.plan.financials.availableCapital === originalPlan.financials.availableCapital, 'availableCapital strictly unchanged');
assert(updatedRecord.plan.financials.financingGap === originalPlan.financials.financingGap, 'financingGap strictly unchanged');
assert(updatedRecord.plan.financials.promoterContribution === originalPlan.financials.promoterContribution, 'promoterContribution strictly unchanged');
assert(updatedRecord.plan.financials.bankTermLoanRequired === originalPlan.financials.bankTermLoanRequired, 'bankTermLoanRequired strictly unchanged');
assert(updatedRecord.plan.financials.monthlyRevenue === originalPlan.financials.monthlyRevenue, 'monthlyRevenue strictly unchanged');
assert(updatedRecord.plan.financials.monthlyOpex === originalPlan.financials.monthlyOpex, 'monthlyOpex strictly unchanged');
assert(updatedRecord.plan.financials.monthlyNetProfit === originalPlan.financials.monthlyNetProfit, 'monthlyNetProfit strictly unchanged');
assert(updatedRecord.plan.financials.estimatedMonthlyEmi === originalPlan.financials.estimatedMonthlyEmi, 'estimatedMonthlyEmi strictly unchanged');
assert(updatedRecord.plan.financials.debtServiceCoverageRatio === originalPlan.financials.debtServiceCoverageRatio, 'debtServiceCoverageRatio strictly unchanged');
assert(updatedRecord.plan.financials.breakEvenCapacityPercent === originalPlan.financials.breakEvenCapacityPercent, 'breakEvenCapacityPercent strictly unchanged');
assert(updatedRecord.plan.financials.paybackYears === originalPlan.financials.paybackYears, 'paybackYears strictly unchanged');
assert(updatedRecord.plan.financials.affordabilityClassification === originalPlan.financials.affordabilityClassification, 'affordabilityClassification strictly unchanged');

// 7. Sharing & Revocation Lifecycle
console.log('\n[Test Group 6: Share Token Generation, Privacy & Revocation]');
const shareResult = businessPlanService.createShareToken(originalPlan.id, userAlphaId, false);
assert(Boolean(shareResult.shareToken && shareResult.shareToken.length === 48), 'Share token is 48-char cryptographically secure hex');
assert(shareResult.shareUrl === `/share/plan/${shareResult.shareToken}`, 'Share URL is well-formed');
assert(!shareResult.shareToken.includes(userAlphaId), 'Share token does NOT contain user ID');
assert(!shareResult.shareToken.includes(originalPlan.id), 'Share token is NOT a database ID');

// Public shared plan retrieval
const publicShared = businessPlanService.getSharedPlan(shareResult.shareToken);
assert(publicShared.title === 'Alpha Mustard Oil Mill Project', 'Public shared plan title accessible');
assert(publicShared.plan.id === originalPlan.id, 'Public shared plan payload accessible');
assert((publicShared as any).userId === undefined, 'Public shared record strictly omits userId');
assert((publicShared as any).user === undefined, 'Public shared record strictly omits user credentials');
assert((publicShared as any).password === undefined, 'Public shared record strictly omits password/auth data');

// Revocation of share token
const revokeSuccess = businessPlanService.revokeShareToken(originalPlan.id, userAlphaId, false);
assert(revokeSuccess === true, 'Revoke share token returns true');

// Attempt to access revoked share token
try {
  businessPlanService.getSharedPlan(shareResult.shareToken);
  assert(false, 'Revoked share token should throw error');
} catch (err: any) {
  assert(err.message.includes('revoked') || err.message.includes('not found'), 'Accessing revoked token rejected');
}

// 8. Plan Status Updating (Active vs Archived)
console.log('\n[Test Group 7: Plan Archiving & Filtering]');
const archivedRecord = businessPlanService.updatePlanStatus(originalPlan.id, userAlphaId, 'archived', false);
assert(archivedRecord.status === 'archived', 'Plan status updated to archived');

const activePlans = businessPlanService.getUserPlans(userAlphaId, 'active');
assert(!activePlans.some((p) => p.id === originalPlan.id), 'Archived plan excluded from active filter');

const allArchivedPlans = businessPlanService.getUserPlans(userAlphaId, 'archived');
assert(allArchivedPlans.some((p) => p.id === originalPlan.id), 'Archived plan included in archived filter');

// Unarchive
const unarchivedRecord = businessPlanService.updatePlanStatus(originalPlan.id, userAlphaId, 'active', false);
assert(unarchivedRecord.status === 'active', 'Plan unarchived successfully');

// Title updating
const titleRecord = businessPlanService.updatePlanTitle(originalPlan.id, userAlphaId, 'Updated Varanasi Mustard Mill', false);
assert(titleRecord.title === 'Updated Varanasi Mustard Mill', 'Plan title updated successfully');

// 9. Export Verification (HTML & Text)
console.log('\n[Test Group 8: HTML and Text Export Verification]');
const exportedHtml = businessPlanService.exportPlanAsHtml(originalPlan, 'Varanasi Mustard Mill');
assert(exportedHtml.includes('<!DOCTYPE html>'), 'HTML export contains doctype');
assert(exportedHtml.includes('Varanasi Mustard Mill'), 'HTML export contains title');
assert(exportedHtml.includes('Cold-Pressed Mustard'), 'HTML export contains enterprise name');
assert(exportedHtml.includes(originalPlan.financials.totalProjectCost.toLocaleString('en-IN')), 'HTML export contains formatted total project cost');
assert(exportedHtml.includes(originalPlan.financials.financingGap.toLocaleString('en-IN')), 'HTML export contains formatted financing gap');
assert(exportedHtml.includes(originalPlan.financials.fixedAssetsCost.toLocaleString('en-IN')), 'HTML export contains formatted fixed assets');
assert(exportedHtml.includes('Implementation Roadmap'), 'HTML export contains roadmap section');
assert(exportedHtml.includes('Statutory Notes') || exportedHtml.includes('Disclosures'), 'HTML export contains disclosures');

const exportedText = businessPlanService.formatPlanAsText(originalPlan);
assert(exportedText.includes('GRAMUDYAM BUSINESS & FINANCING PLAN'), 'Text export contains header');
assert(exportedText.includes(originalPlan.business.businessName), 'Text export contains enterprise name');
assert(exportedText.includes(originalPlan.financials.totalProjectCost.toLocaleString('en-IN')), 'Text export contains project cost');
assert(exportedText.includes(originalPlan.financials.financingGap.toLocaleString('en-IN')), 'Text export contains financing gap');

// Client-side exportPlan utility parity
const clientHtml = generatePlanHtml(originalPlan);
const clientText = generatePlanText(originalPlan);
assert(clientHtml.includes('Cold-Pressed Mustard'), 'Client HTML export contains business name');
assert(clientText.includes(originalPlan.business.businessName), 'Client Text export contains business name');

// 10. Plan Deletion Verification
console.log('\n[Test Group 9: Plan Deletion Verification]');
const deleteSuccess = businessPlanService.deletePlan(originalPlan.id, userAlphaId, false);
assert(deleteSuccess === true, 'User Alpha successfully deleted own plan');

try {
  businessPlanService.getPlanById(originalPlan.id, userAlphaId, false);
  assert(false, 'Deleted plan should throw not found');
} catch (err: any) {
  assert(err.message.includes('not found'), 'Deleted plan confirmed non-existent');
}

// 11. Guest Mode Persistence Verification
console.log('\n[Test Group 10: Guest Mode Persistence Verification]');
const guestPlan = assembleBusinessPlan({
  enterprise: template,
  financialPlan,
  availableCapital: 250000,
  location: {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    locationType: 'rural'
  }
});

const guestRecord = businessPlanService.savePlan(undefined, true, guestPlan, 'Guest Mustard Oil Plan');
assert(guestRecord.isGuest === true, 'Guest record marked as guest');
assert(guestRecord.userId === undefined, 'Guest record has no userId');

const retrievedGuest = businessPlanService.getPlanById(guestPlan.id, undefined, true);
assert(retrievedGuest.id === guestPlan.id, 'Guest can retrieve guest plan');

const guestShare = businessPlanService.createShareToken(guestPlan.id, undefined, true);
assert(Boolean(guestShare.shareToken), 'Guest plan can generate public share token');

const guestSharedPublic = businessPlanService.getSharedPlan(guestShare.shareToken);
assert(guestSharedPublic.plan.id === guestPlan.id, 'Public can view guest shared plan');

console.log('\n======================================================');
console.log(`PHASE 10 TEST RESULT: ${passedTests} / ${totalTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
}
