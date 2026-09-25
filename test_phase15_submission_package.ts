/**
 * Phase 15: Submission Package Generator Test Suite
 * 
 * Formal verification for:
 * 1. Package Model & Types (valid package types, invalid rejection, required fields).
 * 2. Source-of-Truth Integration (Phases 3-14 outputs preserved).
 * 3. Financial Invariance (all 14 Phase 4 financial metrics invariant, zero recalculation).
 * 4. Government Scheme Integrity (statuses preserved, official URLs, zero ranking/scoring).
 * 5. Document Readiness Integrity (statuses preserved, zero verification claims).
 * 6. Execution Evidence Integrity (user_recorded preserved, zero official inspection claims).
 * 7. Execution Timeline Integrity (provenance preserved, chronological events intact).
 * 8. User-Editable Content & Mass-Assignment Protection (protected fields immutable).
 * 9. Multi-Tenant Security & Isolation (cross-user access/mutation/deletion rejected).
 * 10. Guest Mode Isolation & Plan Deletion Cleanup.
 * 11. XSS & Defensive Content Sanitization.
 * 12. Plain Text & Standalone Print HTML Export Verification.
 * 13. Strict No-Artificial-Scoring / Ranking Audit.
 */

import { submissionPackageService } from './server/services/submissionPackageService.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { GOVERNMENT_SCHEMES_DATASET } from './src/data/governmentSchemes.ts';
import { generateSubmissionPackage } from './src/utils/submissionPackageGenerator.ts';
import {
  generateSubmissionPackageText,
  generateSubmissionPackageHtml,
  escapeHtml
} from './src/utils/exportSubmissionPackage.ts';
import {
  getGuestSubmissionPackages,
  saveGuestSubmissionPackage,
  updateGuestSubmissionPackageUserInputs,
  deleteGuestSubmissionPackage,
  deleteGuestPlan
} from './src/utils/guestStorage.ts';
import type {
  SubmissionPackage,
  GenerateSubmissionPackageParams,
  SubmissionPackageUserInputs
} from './src/types/submissionPackage.ts';
import type { SchemeMatch } from './src/types/scheme.ts';
import type { SchemeReadinessPlan } from './src/types/documentReadiness.ts';
import type { BusinessPlanAction } from './src/types/actionCenter.ts';
import type { ExecutionEvidence } from './src/types/executionEvidence.ts';
import type { ExecutionTimelineEvent, PlanHealthSummary } from './src/types/executionTimeline.ts';

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
console.log('PHASE 15: BANK & GOVERNMENT SUBMISSION PACKAGE TEST SUITE');
console.log('========================================================================\n');

async function runPhase15TestSuite() {
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

  submissionPackageService.reset();

  // Test Fixtures
  const template = ENTERPRISE_TEMPLATES[0]; // Vermicompost
  const capital = 100000;
  const initialFinancialResult = financialEngineService.generateFinancialProjections({
    enterpriseId: template.id,
    capitalAvailable: capital,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Madhya Pradesh',
    district: 'Indore',
    scenario: 'base'
  });
  const financialPlan = initialFinancialResult.plan;

  const mockSchemeMatch: SchemeMatch = {
    scheme: GOVERNMENT_SCHEMES_DATASET[0],
    status: 'eligible',
    statusCategory: 'eligible',
    matchedConditions: ['Rural location verified', 'Age 18+ verified'],
    unmetConditions: [],
    unknownConditions: [],
    whyMatched: ['Within project cost limit of 50 Lakhs', 'Rural unit eligible for 35% subsidy'],
    whyNotMatched: [],
    missingInformation: [],
    financialFit: {
      projectCost: financialPlan.totalProjectCost,
      availableCapital: capital,
      financingGap: financialPlan.financingGap,
      fitsDocumentedRange: true,
      explanation: 'Fits scheme limit'
    },
    requiredDocuments: ['Aadhaar Card', 'Project Report', 'Rural Certificate'],
    verificationSteps: ['DLTF inspection', 'Nodal branch physical verification'],
    officialInformationUrl: 'https://kviconline.gov.in/pmegp',
    officialApplicationUrl: 'https://kviconline.gov.in/pmegp/pmegpweb/index.jsp',
    lastVerifiedDate: '2025-01-15'
  };

  const mockReadinessPlan: SchemeReadinessPlan = {
    schemeId: mockSchemeMatch.scheme.id,
    schemeName: mockSchemeMatch.scheme.name,
    administeringAuthority: mockSchemeMatch.scheme.administeringAuthority,
    level: 'central',
    officialInformationUrl: mockSchemeMatch.officialInformationUrl,
    officialApplicationUrl: mockSchemeMatch.officialApplicationUrl || '',
    eligibilityStatus: 'eligible',
    documents: [
      {
        id: 'doc_1',
        schemeId: mockSchemeMatch.scheme.id,
        name: 'Aadhaar Card',
        category: 'identity',
        initialStatus: 'required',
        userStatus: 'available',
        mandatory: true,
        reason: 'Identity and domicile proof',
        schemeSpecific: false
      },
      {
        id: 'doc_2',
        schemeId: mockSchemeMatch.scheme.id,
        name: 'Detailed Project Report (DPR)',
        category: 'project',
        initialStatus: 'required',
        userStatus: 'available',
        mandatory: true,
        reason: 'Technical appraisal',
        schemeSpecific: false
      },
      {
        id: 'doc_3',
        schemeId: mockSchemeMatch.scheme.id,
        name: 'Rural Area Certificate',
        category: 'eligibility',
        initialStatus: 'required',
        userStatus: 'to_prepare',
        mandatory: true,
        reason: 'Rural subsidy eligibility',
        schemeSpecific: true
      }
    ],
    summary: {
      totalRequired: 3,
      markedAvailable: 2,
      needToPrepare: 1,
      needVerification: 0
    },
    userDeclarations: { doc_1: 'available', doc_2: 'available', doc_3: 'to_prepare' },
    applicationSteps: ['Register on official portal', 'Upload required documents', 'Submit physical copy to DIC'],
    lastUpdated: '2025-01-01T00:00:00Z',
    disclaimer: 'User-declared readiness checklist'
  };

  const mockActions: BusinessPlanAction[] = [
    {
      id: 'act_1',
      planId: 'plan_test_01',
      title: 'Obtain Electricity Connection Sanction',
      description: 'Submit 3-phase commercial application to state DISCOM',
      category: 'operations',
      status: 'in_progress',
      priority: 'important',
      source: 'phase_5',
      sourceLabel: 'Power Benchmark',
      guidanceType: 'regulatory_licensing',
      verificationDetails: {},
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'act_2',
      planId: 'plan_test_01',
      title: 'Finalize Vermicompost Supplier Quotations',
      description: 'Procure 3 quotations for earthworm culture and HDPE beds',
      category: 'procurement',
      status: 'completed',
      priority: 'important',
      source: 'phase_4',
      sourceLabel: 'Fixed Assets',
      guidanceType: 'financial_preparation',
      verificationDetails: {},
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ];

  const mockEvidence: ExecutionEvidence[] = [
    {
      id: 'evi_1',
      planId: 'plan_test_01',
      actionId: 'act_2',
      type: 'quotation',
      title: 'HDPE Vermi-Bed Certified Quotation',
      description: 'Quotation from National Agro Systems for 10 units at ₹2,500 each',
      referenceNumber: 'NAS-2025-881',
      eventDate: '2025-01-10',
      source: 'user_recorded',
      verificationStatus: 'user_recorded',
      disclaimer: 'User-recorded evidence item',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    }
  ];

  const mockTimelineEvents: ExecutionTimelineEvent[] = [
    {
      id: 'tle_1',
      planId: 'plan_test_01',
      actionId: 'act_2',
      eventType: 'action_completed',
      title: 'Finalize Vermicompost Supplier Quotations Completed',
      description: 'Procured 3 quotations for earthworm culture and HDPE beds',
      eventDate: '2025-01-10',
      recordedAt: '2025-01-10T10:00:00Z',
      source: 'action_center',
      sourcePhase: 'phase_12',
      verificationStatus: 'user_recorded',
      userCreated: false
    }
  ];

  const mockPlanHealth: PlanHealthSummary = {
    planId: 'plan_test_01',
    executionState: 'active',
    stateExplanation: 'Plan has active tasks progressing.',
    totalActionsCount: 2,
    completedCount: 1,
    inProgressCount: 1,
    blockedCount: 0,
    needsVerificationCount: 0,
    notStartedCount: 0,
    evidenceCount: 1,
    requiredDocumentsCount: 3,
    availableDocumentsCount: 2,
    pendingDocumentsCount: 1,
    blockers: [],
    nextActions: [],
    milestones: []
  };

  const baseParams: GenerateSubmissionPackageParams = {
    packageType: 'bank_submission',
    planId: 'plan_test_01',
    business: {
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      defaultScale: template.defaultScale,
      unit: template.unit
    },
    promoterProfile: {
      name: 'Ramesh Kumar',
      socialCategory: 'General',
      isRural: true
    },
    location: {
      state: 'Madhya Pradesh',
      district: 'Indore',
      subDistrictOrBlock: 'Sanwer',
      villageOrTown: 'Kshipra',
      locationType: 'rural'
    },
    financialPlan,
    matchedSchemes: [mockSchemeMatch],
    readinessPlan: mockReadinessPlan,
    actions: mockActions,
    evidence: mockEvidence,
    timelineEvents: mockTimelineEvents,
    planHealth: mockPlanHealth,
    userInputs: {
      targetInstitutionName: 'State Bank of India',
      targetBranchName: 'Sanwer Agri Branch',
      coverNote: 'Please find enclosed the credit appraisal submission package.'
    }
  };

  // =========================================================================
  // 1. DATA MODEL & PACKAGE TYPES
  // =========================================================================
  console.log('\n--- 1. Data Model & Package Types ---');

  const bankPkg = generateSubmissionPackage(baseParams);
  assert(bankPkg.metadata.packageType === 'bank_submission', 'Generates bank_submission package type');
  assert(bankPkg.sections.length === 22, 'Bank submission package contains 22 standardized sections');
  assert(bankPkg.sections[0].id === 'sec_cover', 'Bank section 1 is sec_cover');
  assert(bankPkg.sections[21].id === 'sec_declaration', 'Bank section 22 is sec_declaration');

  const govParams: GenerateSubmissionPackageParams = {
    ...baseParams,
    packageType: 'government_scheme_submission',
    selectedSchemeId: mockSchemeMatch.scheme.id
  };
  const govPkg = generateSubmissionPackage(govParams);
  assert(govPkg.metadata.packageType === 'government_scheme_submission', 'Generates government_scheme_submission package type');
  assert(govPkg.sections.length === 12, 'Government submission package contains 12 targeted sections');
  assert(govPkg.sections[0].id === 'sec_gov_cover', 'Government section 1 is sec_gov_cover');
  assert(govPkg.sections[11].id === 'sec_gov_official_links', 'Government section 12 is sec_gov_official_links');

  // Verify status states
  assert(bankPkg.status === 'information_incomplete' || bankPkg.status === 'ready_for_review', 'Valid status assigned');
  assert(!['approval_ready', 'loan_ready', 'sanction_ready', 'guaranteed', 'government_approved', 'bank_approved'].includes(bankPkg.status), 'Forbidden approval status names strictly omitted');

  // =========================================================================
  // 2. FINANCIAL INVARIANCE (ALL 14 PHASE 4 METRICS STRICTLY PRESERVED)
  // =========================================================================
  console.log('\n--- 2. Financial Invariance Verification ---');

  const fs = bankPkg.financialSummary;
  assert(fs.totalProjectCost === financialPlan.totalProjectCost, `totalProjectCost invariant: ${fs.totalProjectCost} === ${financialPlan.totalProjectCost}`);
  assert(fs.fixedAssetsCost === financialPlan.fixedAssetsCost, `fixedAssetsCost invariant: ${fs.fixedAssetsCost} === ${financialPlan.fixedAssetsCost}`);
  assert(fs.workingCapitalRequirement === financialPlan.workingCapitalRequirement, `workingCapitalRequirement invariant: ${fs.workingCapitalRequirement} === ${financialPlan.workingCapitalRequirement}`);
  assert(fs.availableCapital === financialPlan.promoterContribution, `availableCapital invariant: ${fs.availableCapital} === ${financialPlan.promoterContribution}`);
  assert(fs.financingGap === financialPlan.financingGap, `financingGap invariant: ${fs.financingGap} === ${financialPlan.financingGap}`);
  assert(fs.promoterContribution === financialPlan.promoterContribution, `promoterContribution invariant: ${fs.promoterContribution} === ${financialPlan.promoterContribution}`);
  assert(fs.bankTermLoanRequired === financialPlan.bankTermLoanRequired, `bankTermLoanRequired invariant: ${fs.bankTermLoanRequired} === ${financialPlan.bankTermLoanRequired}`);
  assert(fs.monthlyRevenue === financialPlan.monthlyRevenue, `monthlyRevenue invariant: ${fs.monthlyRevenue} === ${financialPlan.monthlyRevenue}`);
  assert(fs.monthlyOperatingExpenses === financialPlan.monthlyOperatingExpenses, `monthlyOperatingExpenses invariant: ${fs.monthlyOperatingExpenses} === ${financialPlan.monthlyOperatingExpenses}`);
  assert(fs.monthlyNetProfit === financialPlan.monthlyNetProfit, `monthlyNetProfit invariant: ${fs.monthlyNetProfit} === ${financialPlan.monthlyNetProfit}`);
  assert(fs.estimatedMonthlyEmi === financialPlan.monthlyEmi, `estimatedMonthlyEmi invariant: ${fs.estimatedMonthlyEmi} === ${financialPlan.monthlyEmi}`);
  assert(fs.debtServiceCoverageRatio === financialPlan.debtServiceCoverageRatio, `debtServiceCoverageRatio invariant: ${fs.debtServiceCoverageRatio} === ${financialPlan.debtServiceCoverageRatio}`);
  assert(fs.breakEvenSalesPercent === financialPlan.breakEvenSalesPercent, `breakEvenSalesPercent invariant: ${fs.breakEvenSalesPercent} === ${financialPlan.breakEvenSalesPercent}`);
  assert(fs.paybackPeriodYears === financialPlan.paybackPeriodYears, `paybackPeriodYears invariant: ${fs.paybackPeriodYears} === ${financialPlan.paybackPeriodYears}`);

  // Test missing financials scenario: never estimate, mark as null
  const emptyFinParams: GenerateSubmissionPackageParams = {
    ...baseParams,
    financialPlan: null
  };
  const emptyFinPkg = generateSubmissionPackage(emptyFinParams);
  assert(emptyFinPkg.financialSummary.totalProjectCost === null, 'Missing financial plan totalProjectCost is null');
  assert(emptyFinPkg.financialSummary.debtServiceCoverageRatio === null, 'Missing financial plan DSCR is null');
  assert(emptyFinPkg.completeness.missingInformationItems.some(i => i.includes('Total Project Cost')), 'Missing financial flagged in missing items');

  // =========================================================================
  // 3. GOVERNMENT SCHEME INTEGRITY
  // =========================================================================
  console.log('\n--- 3. Scheme Integrity Verification ---');

  const secGovMatch = govPkg.sections.find(s => s.id === 'sec_gov_matching_status');
  assert(Boolean(secGovMatch), 'Government matching section present');
  assert(Boolean(secGovMatch?.paragraphs.some(p => p.includes("'eligible'"))), 'Phase 7 deterministic status preserved verbatim');

  const secGovLinks = govPkg.sections.find(s => s.id === 'sec_gov_official_links');
  assert(Boolean(secGovLinks), 'Official links section present');
  assert(Boolean(secGovLinks?.paragraphs.some(p => p.includes('kviconline.gov.in'))), 'Official scheme URL preserved verbatim');

  // Verify no artificial ranking in scheme list
  const secBankSchemes = bankPkg.sections.find(s => s.id === 'sec_schemes_info');
  assert(!Boolean(secBankSchemes?.paragraphs.some(p => p.toLowerCase().includes('best scheme') || p.toLowerCase().includes('score'))), 'No artificial scheme ranking or scoring in scheme section');

  // =========================================================================
  // 4. DOCUMENT READINESS INTEGRITY
  // =========================================================================
  console.log('\n--- 4. Document Readiness Integrity ---');

  const docSec = bankPkg.sections.find(s => s.id === 'sec_document_readiness');
  assert(Boolean(docSec), 'Document readiness section present in bank package');
  assert(Boolean(docSec?.paragraphs.some(p => p.includes('GramUdyam has not performed independent KYC verification'))), 'Prominent disclaimer that documents are user-declared');
  assert(bankPkg.completeness.requiredDocumentsAvailable === 2, 'Required documents available count is factual (2)');
  assert(bankPkg.completeness.documentsToPrepare === 1, 'Required documents to prepare count is factual (1)');

  // =========================================================================
  // 5. EXECUTION EVIDENCE & TIMELINE INTEGRITY
  // =========================================================================
  console.log('\n--- 5. Execution Evidence & Timeline Integrity ---');

  const eviSec = bankPkg.sections.find(s => s.id === 'sec_evidence_index');
  assert(Boolean(eviSec), 'Evidence index section present in bank package');
  assert(Boolean(eviSec?.paragraphs.some(p => p.includes('does not independently verify the authenticity'))), 'Prominent non-verification disclosure in evidence index');
  assert(Boolean(eviSec?.tables?.[0]?.rows.some(r => r.includes('user_recorded'))), 'Evidence verification status remains user_recorded');

  const tleSec = bankPkg.sections.find(s => s.id === 'sec_execution_timeline');
  assert(Boolean(tleSec), 'Execution timeline section present in bank package');
  assert(Boolean(tleSec?.tables?.[0]?.rows.some(r => r[1] === 'Finalize Vermicompost Supplier Quotations Completed')), 'Timeline event description preserved');

  // =========================================================================
  // 6. USER-EDITABLE CONTENT & MASS-ASSIGNMENT PROTECTION
  // =========================================================================
  console.log('\n--- 6. User Inputs & Mass-Assignment Protection ---');

  const userAId = 'usr_alice_001';
  const userBId = 'usr_bob_002';

  const createdPkg = submissionPackageService.generate(baseParams, userAId);
  const pkgId = createdPkg.metadata.packageId;

  // Legitimate update
  const updatedInputs: SubmissionPackageUserInputs = {
    targetInstitutionName: 'Bank of Baroda',
    targetBranchName: 'Indore Main',
    coverNote: 'Updated cover note for review.'
  };
  const updatedPkg = submissionPackageService.updateUserInputs(pkgId, updatedInputs, userAId);
  assert(updatedPkg.userInputs.targetInstitutionName === 'Bank of Baroda', 'Allowed user input field updated');
  assert(updatedPkg.userInputs.targetBranchName === 'Indore Main', 'Allowed branch name updated');

  // Malicious mass assignment attempt: try to pass modified financial values and packageId
  const maliciousPayload: any = {
    coverNote: 'Malicious note',
    packageId: 'forged_pkg_id',
    financialSummary: { totalProjectCost: 999999999 },
    completeness: { status: 'guaranteed_approved' }
  };
  const defendedPkg = submissionPackageService.updateUserInputs(pkgId, maliciousPayload, userAId);
  assert(defendedPkg.metadata.packageId === pkgId, 'Protected packageId cannot be overwritten via mass assignment');
  assert(defendedPkg.financialSummary.totalProjectCost === financialPlan.totalProjectCost, 'Protected financial metrics cannot be overwritten via mass assignment');
  assert((defendedPkg.completeness.status as string) !== 'guaranteed_approved', 'Protected completeness status cannot be overwritten via mass assignment');

  // =========================================================================
  // 7. MULTI-TENANT SECURITY & ISOLATION
  // =========================================================================
  console.log('\n--- 7. Multi-Tenant Security & Isolation ---');

  // User B tries to read User A's package
  let userBReadBlocked = false;
  try {
    submissionPackageService.getById(pkgId, userBId);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) userBReadBlocked = true;
  }
  assert(userBReadBlocked, 'Cross-user package read blocked with 403 Forbidden');

  // User B tries to update User A's package
  let userBUpdateBlocked = false;
  try {
    submissionPackageService.updateUserInputs(pkgId, { coverNote: 'Hacked' }, userBId);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) userBUpdateBlocked = true;
  }
  assert(userBUpdateBlocked, 'Cross-user package modification blocked with 403 Forbidden');

  // User B tries to export User A's package
  let userBExportBlocked = false;
  try {
    submissionPackageService.exportAsText(pkgId, userBId);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) userBExportBlocked = true;
  }
  assert(userBExportBlocked, 'Cross-user package text export blocked with 403 Forbidden');

  // User B tries to delete User A's package
  let userBDeleteBlocked = false;
  try {
    submissionPackageService.delete(pkgId, userBId);
  } catch (err: any) {
    if (err.message.includes('Forbidden')) userBDeleteBlocked = true;
  }
  assert(userBDeleteBlocked, 'Cross-user package deletion blocked with 403 Forbidden');

  // Forged package ID retrieval
  let forgedPkgBlocked = false;
  try {
    submissionPackageService.getById('non_existent_pkg_123', userAId);
  } catch (err: any) {
    if (err.message.includes('not found')) forgedPkgBlocked = true;
  }
  assert(forgedPkgBlocked, 'Non-existent package ID returns 404 Not Found');

  // =========================================================================
  // 8. GUEST MODE PERSISTENCE & CLEANUP
  // =========================================================================
  console.log('\n--- 8. Guest Mode & Storage Cleanup ---');

  const guestPlanId = 'plan_guest_888';
  const guestParams: GenerateSubmissionPackageParams = {
    ...baseParams,
    planId: guestPlanId
  };
  const guestPkg = generateSubmissionPackage(guestParams);

  saveGuestSubmissionPackage(guestPlanId, guestPkg);
  const storedGuestPkgs = getGuestSubmissionPackages(guestPlanId);
  assert(storedGuestPkgs.length === 1, 'Guest package stored in scoped localStorage');
  assert(storedGuestPkgs[0].metadata.packageId === guestPkg.metadata.packageId, 'Guest package ID matches stored package');

  // Guest update
  const updatedGuestPkg = updateGuestSubmissionPackageUserInputs(
    guestPkg.metadata.packageId,
    guestPlanId,
    { coverNote: 'Guest cover note updated' }
  );
  assert(updatedGuestPkg?.userInputs.coverNote === 'Guest cover note updated', 'Guest package user inputs updated');

  // Guest plan deletion cleans up associated packages
  deleteGuestPlan(guestPlanId);
  const remainingGuestPkgs = getGuestSubmissionPackages(guestPlanId);
  assert(remainingGuestPkgs.length === 0, 'deleteGuestPlan cleans up associated guest submission packages');

  // =========================================================================
  // 9. XSS & CONTENT DEFENSE
  // =========================================================================
  console.log('\n--- 9. XSS & Content Safety ---');

  const xssInput = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
  const escaped = escapeHtml(xssInput);
  assert(!escaped.includes('<script>'), 'HTML tags escaped (&lt;script&gt;)');
  assert(escaped.includes('&lt;script&gt;'), 'Script tag converted to safe entities');

  const xssPkg = generateSubmissionPackage({
    ...baseParams,
    userInputs: {
      coverNote: xssInput,
      applicantStatement: '<b onmouseover="alert(1)">statement</b>'
    }
  });
  const htmlExport = generateSubmissionPackageHtml(xssPkg);
  assert(!htmlExport.includes('<script>alert("XSS")</script>'), 'Exported HTML does not contain raw script tags');
  assert(htmlExport.includes('&lt;script&gt;'), 'Exported HTML contains escaped entities for user text');

  // =========================================================================
  // 10. PLAIN TEXT & HTML EXPORT INTEGRITY
  // =========================================================================
  console.log('\n--- 10. Export Document Verification ---');

  const textExport = generateSubmissionPackageText(bankPkg);
  assert(textExport.includes('BANK CREDIT APPRAISAL DOSSIER'), 'Text export contains title header');
  assert(textExport.includes(bankPkg.metadata.businessName), 'Text export contains business name');
  assert(textExport.includes(bankPkg.metadata.snapshotNotice), 'Text export contains snapshot notice');
  assert(textExport.includes('STATUTORY & REGULATORY DISCLAIMERS'), 'Text export contains disclaimers header');
  assert(textExport.includes('Informational Preparation Aid'), 'Text export contains specific statutory disclaimer');

  const govHtml = generateSubmissionPackageHtml(govPkg);
  assert(govHtml.includes('Government Scheme Submission Dossier'), 'HTML export contains title');
  assert(govHtml.includes('@media print'), 'HTML export contains print styles');
  assert(govHtml.includes('Statutory Disclaimers & Institutional Disclosures'), 'HTML export contains institutional disclosures');

  // =========================================================================
  // 11. STRICT NO-ARTIFICIAL-SCORING / RANKING AUDIT
  // =========================================================================
  console.log('\n--- 11. No Artificial Scoring / Ranking Keyword Audit ---');

  const forbiddenKeys = [
    'bestScheme',
    'schemeRank',
    'schemeScore',
    'packageScore',
    'readinessScore',
    'approvalScore',
    'loanScore',
    'bankScore',
    'governmentScore',
    'overallScore',
    'successProbability',
    'approvalProbability'
  ];

  const pkgString = JSON.stringify(bankPkg) + JSON.stringify(govPkg);
  let forbiddenFound = false;
  for (const fk of forbiddenKeys) {
    if (pkgString.includes(`"${fk}"`)) {
      forbiddenFound = true;
      console.error(`Forbidden key detected: ${fk}`);
    }
  }
  assert(!forbiddenFound, 'Zero forbidden artificial scoring or ranking keys present in generated packages');

  // Final summary
  console.log('\n========================================================================');
  console.log(`PHASE 15 TEST RESULTS: ${passedTests} PASSED / ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase15TestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
