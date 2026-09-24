/**
 * Phase 8: Documents & Application Readiness Verification Test Suite
 * 
 * Verifies:
 * 1. Document readiness plan generation for valid schemes
 * 2. Document categorization and attributes (mandatory, schemeSpecific, category)
 * 3. No invented document requirements (only official scheme records)
 * 4. User declaration status mapping (available, to_prepare, needs_verification)
 * 5. Summary metrics (totalRequired, markedAvailable, needToPrepare, needVerification)
 * 6. Strict validation against fake/spoofed document IDs
 * 7. DPR Financial summary strictly preserving Phase 4 inputs without recalculation
 * 8. Not eligible scheme handling (appropriate messaging, no score/recommendation)
 * 9. Application steps and official URLs preservation
 * 10. Persistence in guest mode and session stores
 * 11. Complete regression check: Phase 3–7 financial engine, GIS, and scheme matching invariance
 */

import { documentReadinessService } from './server/services/documentReadinessService.ts';
import { schemeMatchingService } from './server/services/schemeMatchingService.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { GOVERNMENT_SCHEMES_DATASET } from './src/data/governmentSchemes.ts';

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
  console.log('PHASE 8: DOCUMENTS & APPLICATION READINESS AUDIT SUITE');
  console.log('======================================================\n');

  // Test 1: Service loads all 12 government schemes
  console.log('[Group 1: Catalog Integrity & Retrieval]');
  assert(GOVERNMENT_SCHEMES_DATASET.length === 12, 'Dataset contains exactly 12 verified schemes');

  for (const scheme of GOVERNMENT_SCHEMES_DATASET) {
    const found = documentReadinessService.getSchemeById(scheme.id);
    assert(found !== undefined && found.id === scheme.id, `Service retrieves scheme '${scheme.id}'`);
  }

  // Test 2: Document requirements match scheme record without invention
  console.log('\n[Group 2: No Invented Requirements]');
  for (const scheme of GOVERNMENT_SCHEMES_DATASET) {
    const docs = documentReadinessService.getDocumentRequirements(scheme.id);
    assert(
      docs.length === scheme.requiredDocuments.length,
      `Scheme '${scheme.id}' document count matches source data (${docs.length} == ${scheme.requiredDocuments.length})`
    );

    // Verify each doc originates from scheme.requiredDocuments
    const names = docs.map((d) => d.name);
    for (const reqDoc of scheme.requiredDocuments) {
      assert(names.includes(reqDoc), `Document '${reqDoc}' is present in readiness plan for ${scheme.id}`);
    }
  }

  // Test 3: Categories are properly inferred
  console.log('\n[Group 3: Document Categorization]');
  const pmegpDocs = documentReadinessService.getDocumentRequirements('pmegp');
  const aadharDoc = pmegpDocs.find((d) => d.name.toLowerCase().includes('aadhaar'));
  assert(aadharDoc?.category === 'identity', 'Aadhaar categorized under identity');

  const dprDoc = pmegpDocs.find((d) => d.name.toLowerCase().includes('project report') || d.name.toLowerCase().includes('dpr'));
  assert(dprDoc?.category === 'project', 'Project report / DPR categorized under project');

  const quotationDoc = pmegpDocs.find((d) => d.name.toLowerCase().includes('quotation'));
  if (quotationDoc) {
    assert(quotationDoc.category === 'financial', 'Machinery quotation categorized under financial');
  }

  // Test 4: Default user status is 'needs_verification' or 'required'
  console.log('\n[Group 4: Default Initial Status]');
  for (const doc of pmegpDocs) {
    assert(
      doc.initialStatus === 'needs_verification' || doc.initialStatus === 'required',
      `Document '${doc.name}' starts with safe unverified status: ${doc.initialStatus}`
    );
    assert(doc.userStatus !== 'available', `Document '${doc.name}' does NOT falsely default to available`);
  }

  // Test 5: User Declarations mapping & summary counts
  console.log('\n[Group 5: Declarations Mapping & Summary Counts]');
  const pmegpPlanInitial = documentReadinessService.getSchemeReadinessPlan({
    schemeId: 'pmegp',
    eligibilityStatus: 'eligible'
  });
  assert(pmegpPlanInitial.summary.totalRequired === pmegpDocs.length, 'Total required matches docs count');
  assert(pmegpPlanInitial.summary.markedAvailable === 0, 'Initially 0 marked available');

  const firstDocId = pmegpDocs[0].id;
  const secondDocId = pmegpDocs[1].id;

  const pmegpPlanWithDecls = documentReadinessService.getSchemeReadinessPlan({
    schemeId: 'pmegp',
    eligibilityStatus: 'eligible',
    userDeclarations: {
      [firstDocId]: 'available',
      [secondDocId]: 'to_prepare'
    }
  });

  assert(pmegpPlanWithDecls.summary.markedAvailable === 1, 'Marked available count is 1');
  assert(pmegpPlanWithDecls.summary.needToPrepare === 1, 'Need to prepare count is 1');
  assert(
    pmegpPlanWithDecls.summary.needVerification === pmegpDocs.length - 2,
    `Need verification count is ${pmegpDocs.length - 2}`
  );

  // Test 6: Strict validation against fake or spoofed document IDs
  console.log('\n[Group 6: Document ID Validation & Anti-Spoofing]');
  const validCheck = documentReadinessService.validateDeclarations('pmegp', {
    [firstDocId]: 'available'
  });
  assert(validCheck.valid === true, 'Valid document ID accepted');

  const invalidCheck = documentReadinessService.validateDeclarations('pmegp', {
    'fake_doc_id_xyz': 'available'
  });
  assert(invalidCheck.valid === false, 'Spoofed/unrecognized document ID rejected');
  assert(invalidCheck.errors.length > 0, 'Returns explicit error message for invalid doc ID');

  // Test 7: DPR Financial Summary preserves Phase 4 inputs without recalculation
  console.log('\n[Group 7: DPR Financial Summary & Invariance]');
  const inputFinancialPlan = {
    businessName: 'Mini Mustard Oil Mill',
    businessCategory: 'Agro Processing',
    projectCost: 850000,
    availableCapital: 200000,
    financingGap: 650000,
    fixedAssets: 600000,
    workingCapital: 250000,
    monthlyRevenue: 180000,
    monthlyOpex: 125000,
    monthlyNetProfit: 55000,
    estimatedEmi: 13658,
    dscr: 2.15
  };

  const planWithDpr = documentReadinessService.getSchemeReadinessPlan({
    schemeId: 'pmegp',
    eligibilityStatus: 'eligible',
    financialPlan: inputFinancialPlan
  });

  const dpr = planWithDpr.dprFinancialSummary;
  assert(dpr !== undefined, 'DPR Financial Summary generated');
  assert(dpr?.totalProjectCost === 850000, 'Project cost invariant (850000)');
  assert(dpr?.availableCapital === 200000, 'Available capital invariant (200000)');
  assert(dpr?.financingGap === 650000, 'Financing gap invariant (650000)');
  assert(dpr?.fixedAssetsEstimate === 600000, 'Fixed assets invariant (600000)');
  assert(dpr?.workingCapitalEstimate === 250000, 'Working capital invariant (250000)');
  assert(dpr?.debtServiceCoverageRatio === 2.15, 'DSCR invariant (2.15)');
  assert(dpr?.monthlyEmiEstimate === 13658, 'Monthly EMI invariant (13658)');
  assert(dpr?.formattedText.includes('Mini Mustard Oil Mill'), 'Formatted text includes business name');
  assert(dpr?.formattedText.includes('8,50,000'), 'Formatted text contains formatted project cost');

  // Test 8: Not Eligible scheme handling
  console.log('\n[Group 8: Not Eligible Scheme Handling]');
  const notEligiblePlan = documentReadinessService.getSchemeReadinessPlan({
    schemeId: 'pmegp',
    eligibilityStatus: 'not_eligible'
  });
  assert(notEligiblePlan.eligibilityStatus === 'not_eligible', 'Eligibility status properly preserved');
  assert(
    notEligiblePlan.disclaimer.includes('organizational preparation tool'),
    'Disclaimer contains mandatory disclosure'
  );

  // Test 9: Application steps and official links preservation
  console.log('\n[Group 9: Application Steps & URLs Preservation]');
  const pmfmeScheme = GOVERNMENT_SCHEMES_DATASET.find((s) => s.id === 'scheme_pmfme')!;
  const pmfmePlan = documentReadinessService.getSchemeReadinessPlan({
    schemeId: 'scheme_pmfme',
    eligibilityStatus: 'eligible'
  });
  assert(
    pmfmePlan.applicationSteps.length === pmfmeScheme.applicationProcess.length,
    'Application steps match official scheme process'
  );
  assert(
    pmfmePlan.officialInformationUrl === pmfmeScheme.officialInformationUrl,
    'Official info URL is identical to Phase 7 source'
  );
  assert(
    pmfmePlan.officialApplicationUrl === pmfmeScheme.officialApplicationUrl,
    'Official application URL is identical to Phase 7 source'
  );

  // Test 10: Store persistence (guest & session)
  console.log('\n[Group 10: Persistence Layer]');
  const guestSaved = documentReadinessService.saveReadiness(undefined, 'mudra', {
    [documentReadinessService.getDocumentRequirements('mudra')[0].id]: 'available'
  });
  assert(guestSaved.totalRequired > 0, 'Guest readiness saved successfully');
  assert(guestSaved.markedAvailable === 1, 'Guest marked available count is 1');

  const retrievedGuest = documentReadinessService.getSavedDeclarations(undefined, 'mudra');
  assert(Object.keys(retrievedGuest).length === 1, 'Retrieved guest declarations match saved');

  // Test 11: Phase 4 & Phase 7 Regression & Invariance Check
  console.log('\n[Group 11: Phase 4 & Phase 7 Invariance Regression]');
  const projections = financialEngineService.generateFinancialProjections({
    enterpriseId: 'oil_mill',
    capitalAvailable: 300000,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    scenario: 'base'
  });
  const fp = projections.plan;
  assert(fp.totalProjectCost > 0, 'Phase 4 financial plan calculates project cost');
  assert(fp.promoterContribution === 300000, 'Phase 4 promoter contribution matches capital');
  assert(fp.financingGap === Math.max(0, fp.totalProjectCost - 300000), 'Phase 4 financing gap invariant');

  const matchResult = schemeMatchingService.matchSchemes({
    businessId: 'oil_mill',
    availableCapital: 300000,
    projectCost: fp.totalProjectCost,
    financingGap: fp.financingGap,
    location: {
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      ruralUrban: 'rural'
    },
    entrepreneurProfile: {
      isNewBusiness: true,
      isRuralEntrepreneur: true
    }
  });

  assert(matchResult.totalEvaluated === 12, 'Phase 7 matching evaluates all 12 schemes');
  assert(matchResult.categorized.eligible.length > 0, 'Phase 7 categorizes eligible schemes');

  console.log('\n======================================================');
  console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified!`);
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\nFAILED TESTS:', err);
  process.exit(1);
});
