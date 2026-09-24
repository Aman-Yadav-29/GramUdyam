import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { generateDetailedProjectReport } from './src/utils/dprGenerator.ts';
import { generateBankAppraisalDossier, assessCreditGuarantee } from './src/utils/bankAppraisalEngine.ts';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

console.log('========================================================================');
console.log('PHASE 11 EDGE CASES & BOUNDARY CONDITION AUDIT');
console.log('========================================================================');

const templateAgri = ENTERPRISE_TEMPLATES.find((t) => t.id === 'ent_vermicompost')!;
const templateNonAgri = ENTERPRISE_TEMPLATES.find((t) => t.id === 'ent_flyash_bricks')!;

// 1. Capital = 0
{
  console.log('\n--- Test 1: Capital = 0 ---');
  const p4 = financialEngineService.generateFinancialProjections({
    enterpriseId: templateAgri.id,
    capitalAvailable: 0,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi'
  }).plan;

  const dpr = generateDetailedProjectReport({
    enterprise: templateAgri,
    financialPlan: p4,
    availableCapital: 0,
    location: { state: 'Uttar Pradesh', district: 'Varanasi', locationType: 'rural' }
  });

  const appraisal = generateBankAppraisalDossier({
    enterpriseId: templateAgri.id,
    enterpriseName: templateAgri.name,
    enterpriseCategory: templateAgri.category,
    totalProjectCost: p4.totalProjectCost,
    fixedAssetsCost: p4.fixedAssetsCost,
    workingCapitalRequirement: p4.workingCapitalRequirement,
    availableCapital: 0,
    promoterContribution: p4.promoterContribution,
    bankTermLoanRequired: p4.bankTermLoanRequired,
    financingGap: p4.financingGap,
    monthlyRevenue: p4.monthlyRevenue,
    monthlyOpex: p4.monthlyOperatingExpenses,
    monthlyNetProfit: p4.monthlyNetProfit,
    debtServiceCoverageRatio: p4.debtServiceCoverageRatio,
    estimatedMonthlyEmi: p4.monthlyEmi,
    breakEvenCapacityPercent: p4.breakEvenSalesPercent,
    paybackYears: p4.paybackPeriodYears,
    state: 'Uttar Pradesh',
    district: 'Varanasi'
  });

  assert(dpr.financialSummary.availableCapital === 0, 'DPR availableCapital is 0');
  assert(dpr.financialSummary.financingGap === p4.totalProjectCost, 'Financing gap equals total project cost');
  assert(appraisal.marginAssessment.shortfallAmount > 0, 'Margin assessment identifies promoter margin shortfall');
  assert(!appraisal.marginAssessment.isCompliant, 'Margin assessment marked non-compliant for 0 capital');
}

// 2. No financing required (Zero Debt / Capital > Total Cost)
{
  console.log('\n--- Test 2: Zero Debt / 100% Equity (Capital > Cost) ---');
  const p4 = financialEngineService.generateFinancialProjections({
    enterpriseId: templateAgri.id,
    capitalAvailable: 100000,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi'
  }).plan;

  const dpr = generateDetailedProjectReport({
    enterprise: templateAgri,
    financialPlan: p4,
    availableCapital: 100000,
    location: { state: 'Uttar Pradesh', district: 'Varanasi', locationType: 'rural' }
  });

  const appraisal = generateBankAppraisalDossier({
    enterpriseId: templateAgri.id,
    enterpriseName: templateAgri.name,
    enterpriseCategory: templateAgri.category,
    totalProjectCost: p4.totalProjectCost,
    fixedAssetsCost: p4.fixedAssetsCost,
    workingCapitalRequirement: p4.workingCapitalRequirement,
    availableCapital: 100000,
    promoterContribution: p4.promoterContribution,
    bankTermLoanRequired: p4.bankTermLoanRequired,
    financingGap: p4.financingGap,
    monthlyRevenue: p4.monthlyRevenue,
    monthlyOpex: p4.monthlyOperatingExpenses,
    monthlyNetProfit: p4.monthlyNetProfit,
    debtServiceCoverageRatio: p4.debtServiceCoverageRatio,
    estimatedMonthlyEmi: p4.monthlyEmi,
    breakEvenCapacityPercent: p4.breakEvenSalesPercent,
    paybackYears: p4.paybackPeriodYears,
    state: 'Uttar Pradesh',
    district: 'Varanasi'
  });

  assert(dpr.financialSummary.financingGap === 0, 'DPR financingGap is 0');
  assert(dpr.financialSummary.debtServiceCoverageRatio === null, 'DSCR is null (no debt)');
  assert(appraisal.dscrComfortBand === 'no_debt', 'Appraisal DSCR comfort band is no_debt');
  assert(appraisal.creditGuarantee.schemeName === 'None', 'Credit guarantee is None for zero debt');
  assert(appraisal.creditGuarantee.guaranteeFeeBenchmark.includes('Zero bank debt'), 'Guarantee fee notes zero debt');
}

// 3. Multi-tier Guarantee Routing (CGFMU <= 20L, CGTMSE > 20L to 5Cr, Commercial > 5Cr)
{
  console.log('\n--- Test 3: Multi-tier Credit Guarantee Routing ---');
  // CGFMU tier (e.g. ₹16.5L loan)
  const g16L = assessCreditGuarantee(1650000, false);
  assert(g16L.schemeName === 'CGFMU', 'Loan of ₹16.5L routes to CGFMU (under ₹20L ceiling)');
  assert(g16L.isCollateralFreeEligible === true, 'CGFMU is collateral-free eligible');

  // CGTMSE tier (e.g. ₹35L loan)
  const g35L = assessCreditGuarantee(3500000, false);
  assert(g35L.schemeName === 'CGTMSE', 'Loan of ₹35L routes to CGTMSE (above ₹20L ceiling)');
  assert(g35L.isCollateralFreeEligible === true, 'CGTMSE is collateral-free eligible');
  assert(g35L.maxEligibleCoveragePercent === 75, 'CGTMSE general coverage is 75%');

  // Commercial > 5Cr
  const g6Cr = assessCreditGuarantee(60000000, false);
  assert(g6Cr.schemeName === 'None', 'Loan of ₹6Cr exceeds CGTMSE ₹5Cr cap');
  assert(g6Cr.isCollateralFreeEligible === false, 'Above ₹5Cr requires collateral');
}

// 4. Missing optional fields / fallback behavior
{
  console.log('\n--- Test 4: Missing optional fields in DPR ---');
  const p4 = financialEngineService.generateFinancialProjections({
    enterpriseId: templateAgri.id,
    capitalAvailable: 15000,
    promoterCategory: 'general',
    locationType: 'rural',
    state: 'Uttar Pradesh',
    district: 'Varanasi'
  }).plan;

  const dprMinimal = generateDetailedProjectReport({
    enterprise: templateAgri,
    financialPlan: p4,
    availableCapital: 15000,
    location: {
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      locationType: 'rural'
    }
  });

  assert(dprMinimal.sections.length === 25, 'All 25 sections generate even with zero optional params');
  assert(dprMinimal.metadata.promoterName === 'Promoter / Entrepreneur', 'Safe default promoter name used');
  assert(dprMinimal.disclosures.length >= 3, 'All disclosures present');
}

console.log('\n========================================================================');
console.log(`EDGE CASE RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================================================');

if (failed > 0) process.exit(1);
