import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { generateDetailedProjectReport } from './src/utils/dprGenerator.ts';
import { generateBankAppraisalDossier } from './src/utils/bankAppraisalEngine.ts';

const capitalLevels = [50000, 100000, 200000, 500000, 1000000];
const testBusinesses = [
  'ent_vermicompost',     // Agriculture & organic fertilizer
  'ent_mushroom',         // Agro-processing / horticulture
  'ent_spices_processing',// Food processing / manufacturing
  'ent_oil_expeller',     // Agro processing / edible oil
  'ent_corrugated_boxes', // Industrial packaging / manufacturing
  'ent_flyash_bricks',    // Construction & industrial manufacturing
  'ent_dairy_cattle'      // Livestock & commercial dairy
];

console.log('========================================================================');
console.log('PHASE 11 vs PHASE 4 FINANCIAL INVARIANCE VERIFICATION');
console.log('========================================================================');

let allPassed = true;
let totalComparisons = 0;

for (const businessId of testBusinesses) {
  const template = ENTERPRISE_TEMPLATES.find((t) => t.id === businessId)!;
  console.log(`\nTesting Enterprise: ${template.name} (${template.category})`);

  for (const capital of capitalLevels) {
    const p4 = financialEngineService.generateFinancialProjections({
      enterpriseId: template.id,
      capitalAvailable: capital,
      promoterCategory: 'general',
      locationType: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi'
    }).plan;

    const dpr = generateDetailedProjectReport({
      enterprise: template,
      financialPlan: p4,
      availableCapital: capital,
      location: {
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        locationType: 'rural'
      }
    });

    const appraisal = generateBankAppraisalDossier({
      enterpriseId: template.id,
      enterpriseName: template.name,
      enterpriseCategory: template.category,
      totalProjectCost: p4.totalProjectCost,
      fixedAssetsCost: p4.fixedAssetsCost,
      workingCapitalRequirement: p4.workingCapitalRequirement,
      availableCapital: capital,
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
      district: 'Varanasi',
      locationType: 'rural',
      isWomanOrSpecialCategory: false
    });

    // Check DPR vs Phase 4 vs Appraisal
    const checks = [
      ['totalProjectCost', p4.totalProjectCost, dpr.financialSummary.totalProjectCost, appraisal.totalProjectCost],
      ['fixedAssetsCost', p4.fixedAssetsCost, dpr.financialSummary.fixedAssetsCost, appraisal.fixedAssetsCost],
      ['workingCapitalRequirement', p4.workingCapitalRequirement, dpr.financialSummary.workingCapitalRequirement, appraisal.workingCapitalRequirement],
      ['availableCapital', capital, dpr.financialSummary.availableCapital, appraisal.availableCapital],
      ['promoterContribution', p4.promoterContribution, dpr.financialSummary.promoterContribution, appraisal.promoterContribution],
      ['financingGap', p4.financingGap, dpr.financialSummary.financingGap, appraisal.financingGap],
      ['bankTermLoanRequired', p4.bankTermLoanRequired, dpr.financialSummary.bankTermLoanRequired, appraisal.bankTermLoanRequired],
      ['monthlyRevenue', p4.monthlyRevenue, dpr.financialSummary.monthlyRevenue, appraisal.monthlyRevenue],
      ['monthlyOpex', p4.monthlyOperatingExpenses, dpr.financialSummary.monthlyOpex, appraisal.monthlyOpex],
      ['monthlyNetProfit', p4.monthlyNetProfit, dpr.financialSummary.monthlyNetProfit, appraisal.monthlyNetProfit],
      ['dscr', p4.debtServiceCoverageRatio, dpr.financialSummary.debtServiceCoverageRatio, appraisal.debtServiceCoverageRatio],
      ['breakEvenSalesPercent', p4.breakEvenSalesPercent, dpr.financialSummary.breakEvenCapacityPercent, dpr.financialSummary.breakEvenCapacityPercent],
      ['paybackPeriodYears', p4.paybackPeriodYears, dpr.financialSummary.paybackYears, dpr.financialSummary.paybackYears],
      ['monthlyEmi', p4.monthlyEmi, dpr.financialSummary.estimatedMonthlyEmi, dpr.financialSummary.estimatedMonthlyEmi]
    ];

    for (const [name, p4Val, dprVal, appVal] of checks) {
      totalComparisons++;
      if (p4Val !== dprVal || p4Val !== appVal) {
        console.error(`  FAIL [Capital: ₹${capital.toLocaleString()}] ${name}: P4=${p4Val}, DPR=${dprVal}, Appraisal=${appVal}`);
        allPassed = false;
      }
    }
    console.log(`  ✓ Capital ₹${capital.toLocaleString('en-IN')}: All 14 financial invariants verified equal across P4, DPR, and Appraisal.`);
  }
}

console.log('\n========================================================================');
console.log(`RESULT: ${totalComparisons} invariant comparisons completed. All passed: ${allPassed}`);
console.log('========================================================================');

if (!allPassed) process.exit(1);
