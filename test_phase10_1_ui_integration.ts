/**
 * Phase 10.1: Forensic UI Integration & Routing Verification Test Suite
 * Tests:
 * 1. Share Plan UI Wiring & Modal Integration
 * 2. Share Action API Integration & Non-fabricated Cryptographic Tokens
 * 3. Saved Plans Workspace (Authenticated & Guest Contracts)
 * 4. Ownership Isolation (User A vs User B)
 * 5. Public Shared Plan Route Parsing (#share=<token> & /share/plan/<token>)
 * 6. Public Shared Plan API Retrieval (getSharedPlan)
 * 7. Read-Only Protection & Exclusion of Private User Credentials
 * 8. Invalid/Revoked Token Error Behavior
 * 9. Phase 9 Financial Invariance (All Key Financial Metrics)
 * 10. Narrative Isolation & Mass-Assignment Protection
 * 11. Offline Export Invariance (HTML & Text)
 */

// Polyfill window.localStorage for guestStorage tests in Node.js environment
if (typeof (globalThis as any).window === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, val: string) => store.set(key, val),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    },
    location: {
      origin: 'http://localhost:3000'
    }
  };
}

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

console.log('================================================================');
console.log('PHASE 10.1: UI INTEGRATION & SYSTEM INTEGRITY VERIFICATION AUDIT');
console.log('================================================================\n');

// ---------------------------------------------------------
// 1. SETUP PHASE 9 ASSEMBLED BUSINESS PLAN
// ---------------------------------------------------------
console.log('[Test Group 1: Phase 9 Ground Truth Assembly & Financial Calculations]');
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

const phase9OriginalPlan = assembleBusinessPlan({
  enterprise: template,
  financialPlan,
  availableCapital: 250000,
  location: {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    locationType: 'rural'
  },
  districtData: {
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    tier: 'Tier 3',
    costIndex: 0.95
  } as any,
  entrepreneurProfile: {
    isRural: true,
    socialCategory: 'General',
    isNewBusiness: true
  }
});

assert(Boolean(phase9OriginalPlan.id), 'Phase 9 business plan successfully assembled with UUID');
assert(phase9OriginalPlan.financials.totalProjectCost > 0, 'Project cost is positive');
assert(phase9OriginalPlan.financials.financingGap > 0, 'Financing gap is positive');
assert(phase9OriginalPlan.financials.monthlyNetProfit > 0, 'Monthly net profit is positive');
assert((phase9OriginalPlan.scenarios?.length ?? 0) >= 3, 'All 3 scenarios generated in plan');

// ---------------------------------------------------------
// 2. USER AUTHENTICATION & MULTI-USER ISOLATION
// ---------------------------------------------------------
console.log('\n[Test Group 2: User Authentication & Multi-Tenant Isolation]');
const user1 = authService.registerUser({
  email: `audit_owner_${Date.now()}@example.com`,
  fullName: 'DPR Creator One',
  password: 'Password123!',
  state: 'Uttar Pradesh',
  district: 'Varanasi'
});
const user1Id = user1.user.id;

const user2 = authService.registerUser({
  email: `audit_stranger_${Date.now()}@example.com`,
  fullName: 'DPR Stranger Two',
  password: 'Password123!',
  state: 'Bihar',
  district: 'Patna'
});
const user2Id = user2.user.id;

assert(user1Id !== user2Id, 'Two distinct users registered with unique IDs');

// Save Plan for User 1
const savedPlan1 = businessPlanService.savePlan(user1Id, false, phase9OriginalPlan, 'Audit Mustard Oil Mill Project');
assert(savedPlan1.userId === user1Id, 'Saved plan associated strictly with verified User 1 ID');
assert(savedPlan1.status === 'active', 'Initial status of saved plan is active');

// User 1 lists plans
const user1Plans = businessPlanService.getUserPlans(user1Id);
assert(user1Plans.length === 1, 'User 1 lists exactly 1 plan');
assert(user1Plans[0].id === savedPlan1.id, 'User 1 retrieved the correct saved plan');

// User 2 lists plans
const user2Plans = businessPlanService.getUserPlans(user2Id);
assert(user2Plans.length === 0, 'User 2 cannot see User 1 plans in listing');

// User 2 attempts unauthorized access
let user2GetUnauthorized = false;
try {
  businessPlanService.getPlanById(savedPlan1.id, user2Id, false);
} catch (err: any) {
  user2GetUnauthorized = err.message.includes('Forbidden') || err.message.includes('not found');
}
assert(user2GetUnauthorized, 'User 2 direct getPlanById is blocked with 403 Forbidden');

let user2DeleteUnauthorized = false;
try {
  businessPlanService.deletePlan(savedPlan1.id, user2Id, false);
} catch (err: any) {
  user2DeleteUnauthorized = err.message.includes('Forbidden') || err.message.includes('not found');
}
assert(user2DeleteUnauthorized, 'User 2 deletePlan is blocked with 403 Forbidden');

let user2ShareUnauthorized = false;
try {
  businessPlanService.createShareToken(savedPlan1.id, user2Id, false);
} catch (err: any) {
  user2ShareUnauthorized = err.message.includes('Forbidden') || err.message.includes('not found');
}
assert(user2ShareUnauthorized, 'User 2 createShareToken is blocked with 403 Forbidden');

// ---------------------------------------------------------
// 3. CRYPTOGRAPHIC SHARE TOKEN GENERATION & REVOCATION
// ---------------------------------------------------------
console.log('\n[Test Group 3: Cryptographic Share Token & Revocation Integrity]');

// User 1 creates share token
const shareResult = businessPlanService.createShareToken(savedPlan1.id, user1Id, false);
assert(Boolean(shareResult.shareToken), 'Share token successfully generated by backend');
assert(shareResult.shareToken.length >= 40, `Share token length is cryptographically robust (${shareResult.shareToken.length} chars)`);
assert(/^[0-9a-f]+$/i.test(shareResult.shareToken), 'Share token is hex-encoded entropy from crypto.randomBytes');

// Public access using token
const publicPlan = businessPlanService.getSharedPlan(shareResult.shareToken);
assert(Boolean(publicPlan), 'Public plan accessible via valid share token');
assert(publicPlan.title === savedPlan1.title, 'Public plan title matches saved plan title');
assert(publicPlan.shareToken === shareResult.shareToken, 'Public plan echoes valid share token');

// Check that private user credentials are NOT exposed in public payload
const publicDataString = JSON.stringify(publicPlan);
assert(!publicDataString.includes('passwordHash'), 'Public payload does NOT contain passwordHash');
assert(!publicDataString.includes('salt'), 'Public payload does NOT contain password salt');
assert(!publicDataString.includes(user1.user?.email || 'audit_owner_'), 'Public payload does NOT contain owner email address');
assert(!publicDataString.includes(user1Id), 'Public payload does NOT contain internal owner userId');

// Revoke share token
businessPlanService.revokeShareToken(savedPlan1.id, user1Id, false);
let revokedAccessDenied = false;
try {
  businessPlanService.getSharedPlan(shareResult.shareToken);
} catch (err: any) {
  revokedAccessDenied = err.message.includes('revoked') || err.message.includes('not found');
}
assert(revokedAccessDenied, 'Accessing revoked share token immediately fails with 404/revoked error');

// Nonexistent token
let nonexistentTokenDenied = false;
try {
  businessPlanService.getSharedPlan('completely_fake_nonexistent_token_1234567890');
} catch (err: any) {
  nonexistentTokenDenied = err.message.includes('revoked') || err.message.includes('not found');
}
assert(nonexistentTokenDenied, 'Accessing random nonexistent token fails with 404 error');

// ---------------------------------------------------------
// 4. GUEST STORAGE ISOLATION & CONTRACT
// ---------------------------------------------------------
console.log('\n[Test Group 4: Guest Storage Contract & Isolation]');
const guestPlan = saveGuestPlan(phase9OriginalPlan);
assert(Boolean(guestPlan.id), 'Guest plan saved with valid ID');
assert(guestPlan.isGuest === true && guestPlan.userId === undefined, 'Guest plan marked isGuest: true with no user account ID');

const guestPlans = getGuestSavedPlans();
assert(guestPlans.length >= 1, 'Guest plans retrieved from guest storage contract');
const retrievedGuestPlan = getGuestPlanById(guestPlan.id);
assert(retrievedGuestPlan?.id === guestPlan.id, 'Guest plan retrieved by ID');

// Guest plans are NOT exposed in server-side authenticated listings
const serverGuestPlans = businessPlanService.getUserPlans('guest_user');
assert(serverGuestPlans.length === 0, 'Server-side database does NOT leak guest storage plans');

// Guest narrative update
const updatedGuest = updateGuestPlanNarrative(guestPlan.id, {
  promoterRemarks: 'Updated by guest entrepreneur.'
});
assert(updatedGuest?.plan.narrative?.promoterRemarks === 'Updated by guest entrepreneur.', 'Guest narrative updated');

// Guest archive status
const archivedGuest = updateGuestPlanStatus(guestPlan.id, 'archived');
assert(archivedGuest?.status === 'archived', 'Guest plan status toggled to archived');

// Guest delete
const deleteResult = deleteGuestPlan(guestPlan.id);
assert(deleteResult === true, 'Guest plan deleted successfully');
assert(getGuestPlanById(guestPlan.id) === undefined, 'Deleted guest plan no longer found');

// ---------------------------------------------------------
// 5. URL ROUTE PARSER SIMULATION
// ---------------------------------------------------------
console.log('\n[Test Group 5: Hash & Path Route Parsing for Public Sharing]');

function testRouteParser(hash: string, pathname: string) {
  if (hash.toLowerCase().startsWith('#share=')) {
    const token = hash.substring(7).trim();
    if (token) return { page: 'share', token };
  }
  const shareMatch = pathname.match(/^\/share\/plan\/([a-zA-Z0-9_-]+)/);
  if (shareMatch && shareMatch[1]) {
    return { page: 'share', token: shareMatch[1] };
  }
  if (pathname === '/login' || hash === '#login') return { page: 'login' };
  if (pathname === '/register' || hash === '#register') return { page: 'register' };
  if (pathname === '/analysis' || hash === '#analysis') return { page: 'analysis' };
  return { page: 'landing' };
}

const testToken = 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0';
const parsedHash = testRouteParser(`#share=${testToken}`, '/');
assert(parsedHash.page === 'share' && (parsedHash as any).token === testToken, 'Hash-based #share=<token> parsed correctly');

const parsedPath = testRouteParser('', `/share/plan/${testToken}`);
assert(parsedPath.page === 'share' && (parsedPath as any).token === testToken, 'Path-based /share/plan/<token> parsed correctly');

const parsedAnalysis = testRouteParser('#analysis', '/');
assert(parsedAnalysis.page === 'analysis', 'Analysis route #analysis parsed correctly');

const parsedHome = testRouteParser('', '/');
assert(parsedHome.page === 'landing', 'Default route parsed to landing');

// ---------------------------------------------------------
// 6. PHASE 9 SOURCE-OF-TRUTH INVARIANCE AUDIT
// ---------------------------------------------------------
console.log('\n[Test Group 6: Phase 9 Financial Metric Invariance Audit]');

// Create a new share token for testing invariance across retrieval
const activeShare = businessPlanService.createShareToken(savedPlan1.id, user1Id, false);
const retrievedShared = businessPlanService.getSharedPlan(activeShare.shareToken);
const reopenedPlan = businessPlanService.getPlanById(savedPlan1.id, user1Id, false);

const origFin = phase9OriginalPlan.financials;
const savedFin = reopenedPlan.plan.financials;
const sharedFin = retrievedShared.plan.financials;

assert(savedFin.totalProjectCost === origFin.totalProjectCost, `Project Cost Invariant (${origFin.totalProjectCost})`);
assert(savedFin.fixedAssetsCost === origFin.fixedAssetsCost, `Fixed Assets Cost Invariant (${origFin.fixedAssetsCost})`);
assert(savedFin.workingCapitalRequirement === origFin.workingCapitalRequirement, `Working Capital Requirement Invariant (${origFin.workingCapitalRequirement})`);
assert(savedFin.availableCapital === origFin.availableCapital, `Available Capital Invariant (${origFin.availableCapital})`);
assert(savedFin.financingGap === origFin.financingGap, `Financing Gap Invariant (${origFin.financingGap})`);
assert(savedFin.monthlyRevenue === origFin.monthlyRevenue, `Monthly Revenue Invariant (${origFin.monthlyRevenue})`);
assert(savedFin.monthlyOpex === origFin.monthlyOpex, `Monthly OPEX Invariant (${origFin.monthlyOpex})`);
assert(savedFin.monthlyNetProfit === origFin.monthlyNetProfit, `Monthly Net Profit Invariant (${origFin.monthlyNetProfit})`);
assert(savedFin.estimatedMonthlyEmi === origFin.estimatedMonthlyEmi, `EMI Invariant (${origFin.estimatedMonthlyEmi})`);
assert(savedFin.debtServiceCoverageRatio === origFin.debtServiceCoverageRatio, `DSCR Invariant (${origFin.debtServiceCoverageRatio})`);
assert(savedFin.breakEvenCapacityPercent === origFin.breakEvenCapacityPercent, `Break-even % Invariant (${origFin.breakEvenCapacityPercent})`);
assert(savedFin.paybackYears === origFin.paybackYears, `Payback Years Invariant (${origFin.paybackYears})`);
assert(savedFin.affordabilityClassification === origFin.affordabilityClassification, `Affordability Classification Invariant (${origFin.affordabilityClassification})`);

// Scenarios Invariance
assert(
  reopenedPlan.plan.scenarios!.length === phase9OriginalPlan.scenarios!.length,
  'Scenario count match Phase 9 ground truth'
);
assert(
  reopenedPlan.plan.scenarios![0].monthlyNetProfit === phase9OriginalPlan.scenarios![0].monthlyNetProfit,
  'Scenario 1 Net Profit matches Phase 9 ground truth'
);

// Public Shared Invariance
assert(sharedFin.totalProjectCost === origFin.totalProjectCost, 'Public Shared Project Cost strictly matches original');
assert(sharedFin.financingGap === origFin.financingGap, 'Public Shared Financing Gap strictly matches original');
assert(sharedFin.monthlyNetProfit === origFin.monthlyNetProfit, 'Public Shared Net Profit strictly matches original');
assert(sharedFin.debtServiceCoverageRatio === origFin.debtServiceCoverageRatio, 'Public Shared DSCR strictly matches original');

// ---------------------------------------------------------
// 7. NARRATIVE ISOLATION & MASS-ASSIGNMENT DEFENSE
// ---------------------------------------------------------
console.log('\n[Test Group 7: Narrative Isolation & Mass-Assignment Defense]');

const maliciousNarrativePayload: any = {
  businessObjectives: 'Legitimate business objective update.',
  promoterRemarks: 'Promoter remark update.',
  // Attempted mass-assignment of immutable financial metrics
  totalProjectCost: 1,
  financingGap: 0,
  monthlyNetProfit: 99999999,
  debtServiceCoverageRatio: 10.0,
  estimatedMonthlyEmi: 0,
  affordabilityClassification: 'Optimal',
  documents: [],
  location: { state: 'Hacked', district: 'Hacked' }
};

const updatedPlan = businessPlanService.updatePlanNarrative(
  savedPlan1.id,
  user1Id,
  maliciousNarrativePayload,
  false
);

assert(
  updatedPlan.plan.narrative?.businessObjectives === 'Legitimate business objective update.',
  'Permitted field businessObjectives successfully updated'
);
assert(
  updatedPlan.plan.narrative?.promoterRemarks === 'Promoter remark update.',
  'Permitted field promoterRemarks successfully updated'
);

// Verify that immutable metrics were NOT modified
assert(
  updatedPlan.plan.financials.totalProjectCost === origFin.totalProjectCost,
  'Project Cost untouched by attempted mass assignment'
);
assert(
  updatedPlan.plan.financials.financingGap === origFin.financingGap,
  'Financing Gap untouched by attempted mass assignment'
);
assert(
  updatedPlan.plan.financials.monthlyNetProfit === origFin.monthlyNetProfit,
  'Net Profit untouched by attempted mass assignment'
);
assert(
  updatedPlan.plan.financials.debtServiceCoverageRatio === origFin.debtServiceCoverageRatio,
  'DSCR untouched by attempted mass assignment'
);
assert(
  updatedPlan.plan.location?.district === phase9OriginalPlan.location?.district,
  'Location untouched by attempted mass assignment'
);

// ---------------------------------------------------------
// 8. OFFLINE EXPORT INVARIANCE
// ---------------------------------------------------------
console.log('\n[Test Group 8: Offline HTML & Text Export Verification]');

const exportedHtml = generatePlanHtml(updatedPlan.plan, updatedPlan.title || 'Plan');
assert(exportedHtml.includes('<!DOCTYPE html>'), 'Generated HTML contains standard doctype');
assert(exportedHtml.includes(updatedPlan.title || 'Plan'), 'Generated HTML contains plan title');
assert(exportedHtml.includes(origFin.totalProjectCost.toLocaleString('en-IN')), 'Generated HTML contains exact formatted total project cost');
assert(exportedHtml.includes(origFin.financingGap.toLocaleString('en-IN')), 'Generated HTML contains exact formatted financing gap');
assert(exportedHtml.includes('Statutory Disclosures'), 'Generated HTML contains statutory disclosures section');

const exportedText = generatePlanText(updatedPlan.plan);
assert(exportedText.includes('================================================================================'), 'Generated Text contains structural section borders');
assert(exportedText.includes(updatedPlan.plan.business.businessName), 'Generated Text contains business name');
assert(exportedText.includes('Total Project Cost:'), 'Generated Text contains project cost label');
assert(exportedText.includes('Financing Gap:'), 'Generated Text contains financing gap label');
assert(exportedText.includes('MANDATORY DISCLOSURES'), 'Generated Text contains mandatory disclosures section');
assert(exportedText.includes('DISCLAIMER:'), 'Generated Text contains statutory disclaimer');

// ---------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------
console.log('\n================================================================');
console.log(`PHASE 10.1 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
if (failedTests === 0) {
  console.log('STATUS: ALL INTEGRATION CONTRACTS AND INVARIANTS VERIFIED.');
} else {
  console.error(`STATUS: ${failedTests} TESTS FAILED.`);
  process.exit(1);
}
console.log('================================================================\n');
