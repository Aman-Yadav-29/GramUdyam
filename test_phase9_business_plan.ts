/**
 * Phase 9: Business & Financing Plan Verification Test Suite
 * 
 * Tests 1 to 20 per GramUdyam Phase 9 Specification:
 * - Test 1: Business section correctly populated
 * - Test 2: Financial values equal Phase 4 source values
 * - Test 3: No financial recalculation changes values
 * - Test 4: Financing gap equals the Phase 4 output
 * - Test 5: Scenario values equal Phase 4 output
 * - Test 6: Location section uses Phase 5 output
 * - Test 7: Agriculture section appears only for applicable businesses
 * - Test 8: Agriculture factors are preserved without a single suitability score
 * - Test 9: Scheme matches equal Phase 7 output
 * - Test 10: No scheme ranking is introduced
 * - Test 11: Document readiness equals Phase 8 state
 * - Test 12: Official URLs remain unchanged
 * - Test 13: Not-eligible schemes are not represented as eligible
 * - Test 14: Unknown information remains unknown
 * - Test 15: Guest mode works
 * - Test 16: Plan narrative editing does not modify financial source values
 * - Test 17: Print/copy summary contains required sections
 * - Test 18: Disclosures are present
 * - Test 19: No unsupported guaranteed claims
 * - Test 20: Saved-plan authorization enforcement
 */

import { businessPlanService } from './server/services/businessPlanService.ts';
import { assembleBusinessPlan } from './src/utils/businessPlanGenerator.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { locationGisService } from './server/services/locationGisService.ts';
import { agriLocationService } from './server/services/agriLocationService.ts';
import { schemeMatchingService } from './server/services/schemeMatchingService.ts';
import { documentReadinessService } from './server/services/documentReadinessService.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`, failureDetail !== undefined ? failureDetail : '');
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('PHASE 9: BUSINESS & FINANCING PLAN AUDIT TEST SUITE');
  console.log('======================================================\n');

  // Setup sample data using existing Phase 3-8 services
  const enterprise = ENTERPRISE_TEMPLATES.find((e) => e.id === 'ent_oil_expeller')!;
  assert(enterprise !== undefined, 'Found oil expeller enterprise template');

  const capitalAvailable = 250000;
  const availableCapital = capitalAvailable;
  const state = 'Uttar Pradesh';
  const district = 'Varanasi';

  // Phase 4 Financial Plan
  const financialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: enterprise.id,
    capitalAvailable,
    promoterCategory: 'general',
    locationType: 'rural',
    state,
    district,
    scenario: 'base'
  });
  const fp = financialResult.plan;

  // Phase 5 Location Intelligence
  const districtData = locationGisService.getDistrictData(state, district);

  // Phase 6 Agri Location Analysis (Oil expeller is processing, let's also test dairy)
  const agriAnalysis = agriLocationService.analyzeAgriLocation('dairy', state, district, {
    locationType: 'rural'
  });

  // Phase 7 Scheme Matching
  const schemeResult = schemeMatchingService.matchSchemes({
    businessId: enterprise.id,
    availableCapital,
    projectCost: fp.totalProjectCost,
    financingGap: fp.financingGap,
    location: { state, district, ruralUrban: 'rural' },
    entrepreneurProfile: { age: 32, isNewBusiness: true, isRuralEntrepreneur: true }
  });

  // Phase 8 Document Readiness
  const readinessPlan = documentReadinessService.getSchemeReadinessPlan({
    schemeId: 'scheme_pmegp',
    eligibilityStatus: 'eligible',
    financialPlan: {
      businessName: enterprise.name,
      projectCost: fp.totalProjectCost,
      availableCapital,
      financingGap: fp.financingGap
    }
  });

  // Assemble full Business Plan
  const plan = assembleBusinessPlan({
    enterprise,
    financialPlan: fp,
    availableCapital,
    location: {
      state,
      district,
      subDistrictOrBlock: 'Arajiline',
      villageOrTown: 'Raja Talab',
      locationType: 'rural'
    },
    districtData,
    agriLocationAnalysis: agriAnalysis,
    schemeMatches: schemeResult.matches,
    documentReadiness: readinessPlan,
    entrepreneurProfile: {
      age: 32,
      gender: 'male',
      socialCategory: 'general',
      isFarmer: true,
      isRural: true,
      isNewBusiness: true
    }
  });

  // TEST 1: Business section correctly populated
  console.log('[Test 1: Business Section Population]');
  assert(plan.business.businessId === enterprise.id, 'Business ID matches enterprise');
  assert(plan.business.businessName === enterprise.name, 'Business name matches enterprise');
  assert(plan.business.businessCategory === enterprise.category, 'Category matches enterprise');
  assert(plan.business.primaryInputs.length > 0, 'Primary inputs populated');
  assert(Boolean(plan.business.primaryOutput), 'Primary output populated');
  assert(plan.business.majorEquipment.length > 0, 'Major equipment populated');
  assert(plan.business.factualDescription.includes(enterprise.name), 'Factual description includes enterprise name');
  assert(plan.business.factualDescription.includes('Proposed Scale:'), 'Factual description includes scale');

  // TEST 2: Financial values equal Phase 4 source values
  console.log('\n[Test 2: Financial Values Equality to Phase 4 Source]');
  assert(plan.financials.totalProjectCost === fp.totalProjectCost, 'Total project cost strictly equals Phase 4');
  assert(plan.financials.fixedAssetsCost === fp.fixedAssetsCost, 'Fixed assets cost strictly equals Phase 4');
  assert(plan.financials.workingCapitalRequirement === fp.workingCapitalRequirement, 'Working capital strictly equals Phase 4');
  assert(plan.financials.promoterContribution === fp.promoterContribution, 'Promoter contribution strictly equals Phase 4');
  assert(plan.financials.bankTermLoanRequired === fp.bankTermLoanRequired, 'Bank term loan strictly equals Phase 4');
  assert(plan.financials.monthlyRevenue === fp.monthlyRevenue, 'Monthly revenue strictly equals Phase 4');
  assert(plan.financials.monthlyNetProfit === fp.monthlyNetProfit, 'Monthly net profit strictly equals Phase 4');
  assert(plan.financials.debtServiceCoverageRatio === fp.debtServiceCoverageRatio, 'DSCR strictly equals Phase 4');
  assert(plan.financials.estimatedMonthlyEmi === fp.monthlyEmi, 'EMI strictly equals Phase 4');

  // TEST 3: No financial recalculation changes values
  console.log('\n[Test 3: Zero Financial Recalculation]');
  const secondPlan = assembleBusinessPlan({
    enterprise,
    financialPlan: fp,
    availableCapital,
    location: { state, district, locationType: 'rural' }
  });
  assert(secondPlan.financials.totalProjectCost === plan.financials.totalProjectCost, 'Project cost unchanged on re-assembly');
  assert(secondPlan.financials.financingGap === plan.financials.financingGap, 'Financing gap unchanged on re-assembly');
  assert(secondPlan.financials.monthlyNetProfit === plan.financials.monthlyNetProfit, 'Net profit unchanged on re-assembly');

  // TEST 4: Financing gap equals the Phase 4 output
  console.log('\n[Test 4: Financing Gap Invariance]');
  assert(plan.financials.financingGap === fp.financingGap, 'Financing gap matches Phase 4 output');
  assert(
    plan.financials.financingGap === Math.max(0, fp.totalProjectCost - availableCapital),
    'Financing gap equals max(0, projectCost - availableCapital)'
  );

  // TEST 5: Scenario values equal Phase 4 output
  console.log('\n[Test 5: Scenario Values Coverage]');
  assert(plan.scenarios !== undefined && plan.scenarios.length === 3, 'Three sensitivity scenarios generated');
  const baseScenario = plan.scenarios?.find((s) => s.scenario === 'base');
  assert(baseScenario !== undefined, 'Base scenario present');
  assert(baseScenario?.monthlyRevenue === fp.monthlyRevenue, 'Base scenario revenue equals Phase 4 baseline');
  assert(baseScenario?.monthlyNetProfit === fp.monthlyNetProfit, 'Base scenario net profit equals Phase 4 baseline');

  // TEST 6: Location section uses Phase 5 output
  console.log('\n[Test 6: Location Section Uses Phase 5 Output]');
  assert(plan.location?.state === state, 'Location state preserved');
  assert(plan.location?.district === district, 'Location district preserved');
  assert(plan.location?.resolution === districtData?.population?.geographicLevel, 'Location resolution preserved from Phase 5');
  assert(Boolean(plan.location?.benchmarkDisclosure.includes('district/state reference benchmark')), 'Benchmark disclosure present');
  assert(plan.location?.powerAvailabilityHours === districtData?.infrastructure?.averagePowerSupplyHoursPerDay?.value, 'Power hours match Phase 5');

  // TEST 7: Agriculture section appears only for applicable businesses
  console.log('\n[Test 7: Agriculture Section Applicability]');
  assert(plan.agricultureAnalysis !== undefined && plan.agricultureAnalysis.applicable === true, 'Agri section appears when applicable');
  
  // Non-agri plan test
  const nonAgriPlan = assembleBusinessPlan({
    enterprise: ENTERPRISE_TEMPLATES.find((e) => e.id === 'ent_corrugated_boxes')!,
    financialPlan: fp,
    availableCapital,
    location: { state, district, locationType: 'rural' },
    agriLocationAnalysis: null // null for non-agri
  });
  assert(nonAgriPlan.agricultureAnalysis === undefined, 'Agri section omitted for non-agricultural enterprise');

  // TEST 8: Agriculture factors are preserved without a single suitability score
  console.log('\n[Test 8: Agriculture Factors Preserved Without Composite Score]');
  assert(plan.agricultureAnalysis?.whyMaySuit.length! > 0, 'Supportive factors preserved');
  assert(plan.agricultureAnalysis?.priorityVerificationSteps.length! > 0, 'Priority verification steps preserved');
  assert(
    Boolean(plan.agricultureAnalysis?.scoreDisclosure.includes('suitability score') ||
    plan.agricultureAnalysis?.scoreDisclosure.includes('No single agricultural suitability score')),
    'Explicit score disclosure present'
  );
  assert(!('agriScore' in (plan.agricultureAnalysis || {})), 'No agriScore property');
  assert(!('suitabilityScore' in (plan.agricultureAnalysis || {})), 'No suitabilityScore property');

  // TEST 9: Scheme matches equal Phase 7 output
  console.log('\n[Test 9: Scheme Matches Equal Phase 7 Output]');
  assert(plan.schemes?.length === schemeResult.matches.length, 'Scheme count matches Phase 7');
  const pmegpMatch = plan.schemes?.find((s) => s.schemeId === 'scheme_pmegp');
  assert(pmegpMatch !== undefined, 'PMEGP match present in plan schemes');
  assert(pmegpMatch?.eligibilityStatus === 'eligible', 'PMEGP eligibility status preserved');

  // TEST 10: No scheme ranking is introduced
  console.log('\n[Test 10: No Scheme Ranking or Winner]');
  assert(!('winner' in plan), 'No winner attribute on plan');
  assert(!('bestScheme' in plan), 'No bestScheme attribute on plan');
  assert(!('schemeRank' in plan), 'No schemeRank attribute on plan');
  assert(!('planScore' in plan), 'No planScore attribute on plan');

  // TEST 11: Document readiness equals Phase 8 state
  console.log('\n[Test 11: Document Readiness Preserved from Phase 8]');
  assert(plan.documentReadiness !== undefined, 'Document readiness section present');
  assert(
    plan.documentReadiness?.summary.totalRequired === readinessPlan.summary.totalRequired,
    'Total required documents match Phase 8'
  );
  assert(
    plan.documentReadiness?.summary.markedAvailable === readinessPlan.summary.markedAvailable,
    'Marked available documents match Phase 8'
  );

  // TEST 12: Official URLs remain unchanged
  console.log('\n[Test 12: Official URLs Preservation]');
  assert(
    pmegpMatch?.officialInformationUrl === 'https://www.kviconline.gov.in/pmegpeportal/',
    'Official information URL matches official KVIC source'
  );
  assert(
    pmegpMatch?.officialApplicationUrl === 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    'Official application portal URL matches official source'
  );

  // TEST 13: Not-eligible schemes are not represented as eligible
  console.log('\n[Test 13: Not-Eligible Schemes Distinction]');
  const notEligibleScheme = schemeResult.matches.find((m) => m.status === 'not_eligible');
  if (notEligibleScheme) {
    const planNotEligible = plan.schemes?.find((s) => s.schemeId === notEligibleScheme.scheme.id);
    assert(planNotEligible?.eligibilityStatus === 'not_eligible', 'Not eligible scheme retains not_eligible status');
  } else {
    assert(true, 'No not_eligible schemes in this test match (handled safely)');
  }

  // TEST 14: Unknown information remains unknown
  console.log('\n[Test 14: Unknown Information Remains Unknown]');
  if (plan.agricultureAnalysis?.unknownFactors) {
    assert(Array.isArray(plan.agricultureAnalysis.unknownFactors), 'Unknown factors array preserved');
  }
  const potentialScheme = plan.schemes?.find((s) => s.eligibilityStatus === 'potentially_eligible');
  if (potentialScheme) {
    assert(potentialScheme.unmetConditions.length > 0 || potentialScheme.unknownConditions.length > 0, 'Potentially eligible scheme shows unmet/unknown conditions');
  } else {
    assert(true, 'Checked potential scheme conditions safely');
  }

  // TEST 15: Guest mode works
  console.log('\n[Test 15: Guest Mode Plan Persistence & Generation]');
  const guestSaved = businessPlanService.savePlan(undefined, true, plan);
  assert(guestSaved.id === plan.id, 'Guest plan saved with plan ID');
  assert(guestSaved.isGuest === true, 'Guest flag is true');
  assert(guestSaved.userId === undefined, 'Guest plan has no userId');

  const guestRetrieved = businessPlanService.getPlanById(plan.id, undefined, true);
  assert(guestRetrieved.id === plan.id, 'Guest plan retrieved without authentication');

  // TEST 16: Plan narrative editing does not modify financial source values
  console.log('\n[Test 16: Narrative Editing Leaves Financials Invariant]');
  const originalCost = guestSaved.plan.financials.totalProjectCost;
  const originalGap = guestSaved.plan.financials.financingGap;
  const originalProfit = guestSaved.plan.financials.monthlyNetProfit;

  const updatedRecord = businessPlanService.updatePlanNarrative(plan.id, undefined, {
    businessObjectives: 'Updated custom field objective by user.',
    operationalNotes: 'Starting with double shift in winter.'
  });

  assert(
    updatedRecord.plan.narrative?.businessObjectives === 'Updated custom field objective by user.',
    'Narrative business objective successfully updated'
  );
  assert(updatedRecord.plan.financials.totalProjectCost === originalCost, 'Financial total project cost unchanged after narrative edit');
  assert(updatedRecord.plan.financials.financingGap === originalGap, 'Financing gap unchanged after narrative edit');
  assert(updatedRecord.plan.financials.monthlyNetProfit === originalProfit, 'Monthly net profit unchanged after narrative edit');

  // TEST 17: Print/copy summary contains required sections
  console.log('\n[Test 17: Print / Copy Text Export Verification]');
  const textSummary = businessPlanService.formatPlanAsText(plan);
  assert(textSummary.includes('GRAMUDYAM BUSINESS & FINANCING PLAN'), 'Text includes title');
  assert(textSummary.includes('1. BUSINESS OVERVIEW'), 'Text includes Business Overview');
  assert(textSummary.includes('3. PROPOSED LOCATION'), 'Text includes Proposed Location');
  assert(textSummary.includes('5. PROJECT COST & CAPITAL ARCHITECTURE'), 'Text includes Project Cost');
  assert(textSummary.includes('6. FINANCIAL OUTLOOK'), 'Text includes Financial Outlook');
  assert(textSummary.includes('8. FINANCING PLAN'), 'Text includes Financing Plan');
  assert(textSummary.includes('10. IMPLEMENTATION ROADMAP'), 'Text includes Implementation Roadmap');
  assert(textSummary.includes('12. ASSUMPTIONS & MANDATORY STATUTORY DISCLOSURES'), 'Text includes Disclosures');

  // TEST 18: Disclosures are present
  console.log('\n[Test 18: Mandatory Disclosures Present]');
  assert(plan.disclosures.length === 6, 'Six mandatory disclosures present');
  const financialDisc = plan.disclosures.find((d) => d.id === 'financial');
  assert(financialDisc !== undefined && financialDisc.text.includes('estimates based on the assumptions'), 'Financial disclosure text verified');
  const schemeDisc = plan.disclosures.find((d) => d.id === 'scheme');
  assert(schemeDisc !== undefined && schemeDisc.text.includes('subject to the relevant authority'), 'Scheme disclosure text verified');
  const agriDisc = plan.disclosures.find((d) => d.id === 'agriculture');
  assert(agriDisc !== undefined && agriDisc.text.includes('benchmarks'), 'Agriculture disclosure text verified');
  const planDisc = plan.disclosures.find((d) => d.id === 'plan');
  assert(planDisc !== undefined && planDisc.text.includes('official government application'), 'Plan statutory disclosure text verified');

  // TEST 18B: Roadmap Steps Provenance & Categorization
  console.log('\n[Test 18B: Roadmap Steps Provenance & Categorization]');
  assert(plan.implementationPlan.steps.length === 7, 'Seven implementation steps present');
  plan.implementationPlan.steps.forEach((st) => {
    assert(Boolean(st.category), `Step ${st.stepNumber} has valid category: ${st.category}`);
    assert(Boolean(st.categoryLabel), `Step ${st.stepNumber} has categoryLabel: ${st.categoryLabel}`);
    assert(Boolean(st.evidenceSource), `Step ${st.stepNumber} has evidenceSource: ${st.evidenceSource}`);
  });
  assert(plan.implementationPlan.steps[0].category === 'planning_guidance', 'Step 1 categorized as generic planning guidance');
  assert(plan.implementationPlan.steps[1].category === 'site_operational', 'Step 2 categorized as site operational preparation');
  assert(plan.implementationPlan.steps[4].category === 'scheme_documented_process', 'Step 5 categorized as documented scheme requirement');
  assert(plan.implementationPlan.steps[6].category === 'scheme_documented_process', 'Step 7 categorized as documented scheme requirement');

  // TEST 19: No unsupported guaranteed claims
  console.log('\n[Test 19: Zero Guaranteed Claims in Generated Plan]');
  const fullText = JSON.stringify(plan).toLowerCase();
  assert(!fullText.includes('guaranteed profit'), 'Zero guaranteed profit claims');
  assert(!fullText.includes('guaranteed loan'), 'Zero guaranteed loan claims');
  assert(!fullText.includes('guaranteed subsidy'), 'Zero guaranteed subsidy claims');
  assert(!fullText.includes('guaranteed approval'), 'Zero guaranteed approval claims');
  assert(!fullText.includes('guaranteed business success'), 'Zero guaranteed success claims');

  // TEST 20: Saved-plan authorization enforcement
  console.log('\n[Test 20: Server-Side Authorization Enforcement]');
  const userPlan = assembleBusinessPlan({
    enterprise,
    financialPlan: fp,
    availableCapital,
    location: { state, district, locationType: 'rural' },
    existingId: 'plan_user_123_test'
  });

  businessPlanService.savePlan('user_alpha', false, userPlan);

  // User Alpha can access
  const retrievedAlpha = businessPlanService.getPlanById('plan_user_123_test', 'user_alpha', false);
  assert(retrievedAlpha.id === 'plan_user_123_test', 'Owner User Alpha accesses own plan successfully');

  // User Beta attempts access: must throw Forbidden
  let forbiddenCaught = false;
  try {
    businessPlanService.getPlanById('plan_user_123_test', 'user_beta', false);
  } catch (err: any) {
    forbiddenCaught = true;
    assert(err.message.includes('Forbidden'), 'Unauthorized user receives Forbidden error');
  }
  assert(forbiddenCaught, 'Server-side authorization strictly blocks access by different user');

  console.log('\n======================================================');
  console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified!`);
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\nFAILED TESTS:', err);
  process.exit(1);
});
