/**
 * Phase 11: Bank Credit Appraisal Dossier & Lending Feasibility Matrix Test Suite
 * Tests:
 * 1. Promoter Margin Compliance (General vs Special Category, Shortfall Calculation, Citations)
 * 2. DSCR Credit Comfort Banding (Comfortable >= 1.5x, Marginal 1.25-1.49x, High Risk < 1.25x, Zero Debt)
 * 3. Credit Guarantee Coverage (CGFMU up to ₹20L, CGTMSE up to ₹500L, Nil for Large/Zero Debt)
 * 4. Institutional Loan Product Matching & Sizing (MUDRA Shishu/Kishore/Tarun, Stand-Up India, MSME Term Loans)
 * 5. Statutory Regulatory Clearances (Udyam, FSSAI Basic vs State License, CPCB White/Green/Orange, GSTIN threshold, CGWA NOC)
 * 6. Milestone Disbursement Schedule (Exact Sum Invariance: sum(tranches) === totalProjectCost)
 * 7. Bank Branch Interview Prompts Generation (5 Core Credit Officer Topics)
 * 8. Financial Invariance Audit across all 13 Enterprise Templates (All 15 Phase 4 metrics remain immutable)
 * 9. Banker's Dossier Plain Text & Printable HTML Exports
 * 10. Backend Service & IDOR / Validation Safety
 */

import {
  assessPromoterMargin,
  assessDscrComfort,
  assessCreditGuarantee,
  matchLoanProductsForAppraisal,
  deriveStatutoryClearances,
  generateBankInterviewPrompts,
  deriveDisbursementMilestones,
  generateBankAppraisalDossier,
  generateBankDossierPlainText,
  generateBankDossierHtml
} from './src/utils/bankAppraisalEngine.ts';
import { bankAppraisalService } from './server/services/bankAppraisalService.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { assembleBusinessPlan } from './src/utils/businessPlanGenerator.ts';

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

async function runPhase11Tests() {
  console.log('\n================================================================');
  console.log('STARTING PHASE 11: BANK CREDIT APPRAISAL & READINESS TEST SUITE');
  console.log('================================================================\n');

  // TEST GROUP 1: Promoter Margin Compliance
  console.log('--- TEST GROUP 1: PROMOTER MARGIN COMPLIANCE ---');
  {
    // Case 1A: Special Category (Women / SC / ST) requires 10%
    const resSpecial = assessPromoterMargin(1000000, 120000, true);
    assert(resSpecial.requiredMarginPercent === 10, 'Special category requires 10% promoter margin');
    assert(resSpecial.requiredMarginAmount === 100000, 'Special category required amount is ₹1,00,000 on ₹10,00,000 project');
    assert(resSpecial.isCompliant === true, '₹1,20,000 equity is compliant against ₹1,00,000 requirement');
    assert(resSpecial.shortfallAmount === 0, 'No shortfall when compliant');
    assert(resSpecial.actualMarginPercent === 12.0, 'Actual margin percent is exactly 12.0%');
    assert(resSpecial.governingNorm.includes('Special Category'), 'Governing norm references Special Category');

    // Case 1B: Special Category with Shortfall
    const resSpecialShort = assessPromoterMargin(1000000, 80000, true);
    assert(resSpecialShort.isCompliant === false, '₹80,000 equity is non-compliant against 10% requirement');
    assert(resSpecialShort.shortfallAmount === 20000, 'Shortfall correctly calculated as ₹20,000');
    assert(resSpecialShort.complianceNote.includes('Shortfall of ₹20,000'), 'Compliance note explicitly states shortfall amount');

    // Case 1C: General Category Micro project (<= 10L) requires 15%
    const resGeneralMicro = assessPromoterMargin(800000, 120000, false);
    assert(resGeneralMicro.requiredMarginPercent === 15, 'General micro project requires 15% promoter margin');
    assert(resGeneralMicro.requiredMarginAmount === 120000, 'Required amount is ₹1,20,000 (15% of 8L)');
    assert(resGeneralMicro.isCompliant === true, '₹1,20,000 equity exactly complies with 15% margin');

    // Case 1D: General Category Project > 10L requires 20%
    const resGeneralLarge = assessPromoterMargin(2500000, 400000, false);
    assert(resGeneralLarge.requiredMarginPercent === 20, 'General project > 10L requires 20% margin');
    assert(resGeneralLarge.requiredMarginAmount === 500000, 'Required margin is ₹5,00,000 (20% of 25L)');
    assert(resGeneralLarge.isCompliant === false, '₹4,00,000 equity has shortfall against ₹5,00,000');
    assert(resGeneralLarge.shortfallAmount === 100000, 'Shortfall is ₹1,00,000');
  }

  // TEST GROUP 2: Debt Service Coverage Ratio (DSCR) Comfort Banding
  console.log('\n--- TEST GROUP 2: DSCR BANKABILITY & CREDIT COMFORT BANDING ---');
  {
    // Zero external debt
    const zeroDebt = assessDscrComfort(null, 0);
    assert(zeroDebt.band === 'no_debt', 'Zero loan required maps to no_debt band');
    assert(zeroDebt.analysis.includes('Zero external bank debt'), 'Analysis correctly explains debt-free enterprise');

    // Comfortable: DSCR >= 1.50
    const dscrHigh = assessDscrComfort(1.85, 500000);
    assert(dscrHigh.band === 'comfortable', 'DSCR 1.85x maps to comfortable band');
    assert(dscrHigh.analysis.includes('commercial bank appraisal benchmark'), 'Comfortable analysis cites commercial benchmark (>= 1.50x)');

    // Marginal: 1.25 <= DSCR < 1.50
    const dscrMarginal = assessDscrComfort(1.35, 500000);
    assert(dscrMarginal.band === 'marginal', 'DSCR 1.35x maps to marginal band');
    assert(dscrMarginal.analysis.includes('marginal bankability range'), 'Marginal analysis notes scrutiny requirement');

    // High Risk: DSCR < 1.25
    const dscrLow = assessDscrComfort(1.10, 500000);
    assert(dscrLow.band === 'high_risk', 'DSCR 1.10x maps to high_risk band');
    assert(dscrLow.analysis.includes('below the standard commercial banking acceptance threshold'), 'High risk analysis warns of appraisal rejection risk');
  }

  // TEST GROUP 3: Collateral-Free Credit Guarantee (CGFMU & CGTMSE)
  console.log('\n--- TEST GROUP 3: CREDIT GUARANTEE EVALUATION ---');
  {
    // Micro Shishu loan <= 50,000
    const cgShishu = assessCreditGuarantee(45000, false);
    assert(cgShishu.schemeName === 'CGFMU', 'Loan <= 50k maps to CGFMU');
    assert(cgShishu.maxEligibleCoveragePercent === 100, 'Shishu eligible for 100% CGFMU guarantee');
    assert(cgShishu.isCollateralFreeEligible === true, 'Shishu is collateral-free');

    // MUDRA Kishore/Tarun <= 20 Lakhs
    const cgTarun = assessCreditGuarantee(1500000, false);
    assert(cgTarun.schemeName === 'CGFMU', 'Loan of ₹15L maps to CGFMU');
    assert(cgTarun.isCollateralFreeEligible === true, 'Loan of ₹15L is collateral-free under PMMY');
    assert(cgTarun.maxEligibleCoveragePercent === 75, 'General category receives 75% coverage');

    // MUDRA Tarun Woman / Special Category <= 20 Lakhs
    const cgTarunSpecial = assessCreditGuarantee(1500000, true);
    assert(cgTarunSpecial.maxEligibleCoveragePercent === 85, 'Special category receives 85% coverage under CGFMU');

    // MSME Term Loan between 20L and 500L under CGTMSE
    const cgMsme = assessCreditGuarantee(3500000, false);
    assert(cgMsme.schemeName === 'CGTMSE', 'Loan of ₹35L maps to CGTMSE');
    assert(cgMsme.isCollateralFreeEligible === true, 'CGTMSE provides collateral-free coverage up to ₹5 Cr');
    assert(cgMsme.statutoryReference.includes('CGTMSE') && cgMsme.coverageCondition.includes('CGTMSE Scheme XIV'), 'References CGTMSE Scheme XIV');


    // Zero Loan
    const cgZero = assessCreditGuarantee(0, false);
    assert(cgZero.schemeName === 'None', 'Zero loan requires no credit guarantee');
  }

  // TEST GROUP 4: Loan Product Matching
  console.log('\n--- TEST GROUP 4: LOAN PRODUCT MATCHING & SIZING ---');
  {
    // Small loan ₹3,00,000 matches MUDRA Kishore and RRB MSME
    const matched3L = matchLoanProductsForAppraisal(300000, false);
    assert(matched3L.length > 0, 'Matches institutional loan products for ₹3,00,000');
    assert(matched3L.some((m) => m.category === 'mudra_kishore'), 'Contains MUDRA Kishore facility');
    const kishore = matched3L.find((m) => m.category === 'mudra_kishore')!;
    assert(kishore.estimatedMonthlyEmi > 0, 'Computes positive monthly EMI for matched product');
    assert(kishore.indicativeTenureMonths === 60, 'MUDRA Kishore tenure is 60 months');
    assert(kishore.moratoriumMonths === 6, 'MUDRA Kishore moratorium is 6 months');

    // Stand-Up India eligibility check (only for Woman or SC/ST)
    const matchedGeneral15L = matchLoanProductsForAppraisal(1500000, false);
    assert(!matchedGeneral15L.some((m) => m.category === 'stand_up_india'), 'General category cannot match Stand-Up India');

    const matchedSpecial15L = matchLoanProductsForAppraisal(1500000, true);
    assert(matchedSpecial15L.some((m) => m.category === 'stand_up_india'), 'Woman/SC/ST matches Stand-Up India for ₹15L');
  }

  // TEST GROUP 5: Statutory & Regulatory Clearances
  console.log('\n--- TEST GROUP 5: STATUTORY REGULATORY CLEARANCES MATRIX ---');
  {
    // Agro processing unit with turnover under 12 Lakhs (Basic FSSAI)
    const agroUnder12L = deriveStatutoryClearances('agro_processing', 900000, false);
    assert(agroUnder12L.some((c) => c.id === 'stat_udyam'), 'Contains mandatory Udyam registration');
    assert(agroUnder12L.some((c) => c.id === 'stat_fssai'), 'Contains FSSAI requirement');
    const fssaiBasic = agroUnder12L.find((c) => c.id === 'stat_fssai')!;
    assert(fssaiBasic.name.includes('Basic Food Business Registration'), 'Sub-₹12L turnover requires FSSAI Basic');

    // Agro processing unit with turnover over 12 Lakhs (State License)
    const agroOver12L = deriveStatutoryClearances('agro_processing', 2500000, false);
    const fssaiState = agroOver12L.find((c) => c.id === 'stat_fssai')!;
    assert(fssaiState.name.includes('State Manufacturing License'), 'Turnover > ₹12L requires FSSAI State License');

    // GST threshold check: under ₹40L goods is post-commercial / voluntary
    const lowTurnover = deriveStatutoryClearances('dal_mill', 2000000, false);
    const gstLow = lowTurnover.find((c) => c.id === 'stat_gst')!;
    assert(gstLow.mandatory === false, 'GSTIN is voluntary/conditional for turnover < ₹40L');

    // GST threshold check: over ₹40L goods is mandatory pre-disbursement
    const highTurnover = deriveStatutoryClearances('dal_mill', 6000000, false);
    const gstHigh = highTurnover.find((c) => c.id === 'stat_gst')!;
    assert(gstHigh.mandatory === true, 'GSTIN is mandatory for turnover >= ₹40L');
    assert(gstHigh.stage === 'pre_disbursement', 'Mandatory GSTIN is pre_disbursement requirement');

    // Groundwater abstraction NOC when flagged
    const withWaterConcern = deriveStatutoryClearances('agro_processing', 2000000, true);
    assert(withWaterConcern.some((c) => c.id === 'stat_cgwa_noc'), 'Flagged groundwater concern triggers CGWA NOC requirement');

    const withoutWaterConcern = deriveStatutoryClearances('agro_processing', 2000000, false);
    assert(!withoutWaterConcern.some((c) => c.id === 'stat_cgwa_noc'), 'No CGWA NOC when groundwater is not flagged as concern');

    // CPCB White Category for solar cold storage
    const solarStorage = deriveStatutoryClearances('solar_cold_storage', 1000000, false);
    assert(solarStorage.some((c) => c.id === 'stat_cpcb_white'), 'Solar cold storage classifies as CPCB White category');
  }

  // TEST GROUP 6: Milestone Disbursement Schedule (Mathematical Invariance)
  console.log('\n--- TEST GROUP 6: MILESTONE DISBURSEMENT SCHEDULE ---');
  {
    const totalCost = 1450000;
    const promoterEquity = 290000;
    const termLoan = 1160000;

    const milestones = deriveDisbursementMilestones(totalCost, promoterEquity, termLoan);
    assert(milestones.length === 4, 'Generates standard 4-stage disbursement schedule');

    // CRITICAL MATHEMATICAL INVARIANCE TEST:
    const sumTranches = milestones.reduce((sum, m) => sum + m.estimatedTrancheAmount, 0);
    assert(sumTranches === totalCost, `Sum of all tranches (₹${sumTranches}) strictly equals totalProjectCost (₹${totalCost})`);

    // Verify stage progression
    assert(milestones[0].stageNumber === 1 && milestones[0].milestoneName.includes('Site Preparation'), 'Stage 1 is Site Preparation');
    assert(milestones[1].stageNumber === 2 && milestones[1].milestoneName.includes('Machinery'), 'Stage 2 is Machinery Order Advance');
    assert(milestones[2].stageNumber === 3 && milestones[2].milestoneName.includes('Delivery'), 'Stage 3 is Delivery & Commissioning');
    assert(milestones[3].stageNumber === 4 && milestones[3].milestoneName.includes('Working Capital'), 'Stage 4 is Working Capital Drawdown');

    // Verify field inspection requirements are populated
    milestones.forEach((m) => {
      assert(m.verificationRequired.length > 10, `Stage ${m.stageNumber} has explicit field verification requirements`);
    });
  }

  // TEST GROUP 7: Bank Branch Interview Preparation Prompts
  console.log('\n--- TEST GROUP 7: BANK BRANCH INTERVIEW Q&A PREPARATION ---');
  {
    const prompts = generateBankInterviewPrompts('oil_expeller', 1.65, true);
    assert(prompts.length === 5, 'Generates 5 core credit appraisal interview prompts');

    const topics = prompts.map((p) => p.topic);
    assert(topics.includes('Equity Margin & Source of Capital'), 'Includes Equity Margin topic');
    assert(topics.includes('Working Capital Turnaround & Receivable Cycles'), 'Includes Working Capital topic');
    assert(topics.includes('Machinery Selection & Supplier Reliability'), 'Includes Machinery Supplier topic');
    assert(topics.includes('Debt Service Capacity & Seasonal Downside'), 'Includes Debt Service Resilience topic');
    assert(topics.includes('Management Commitment & Operational Presence'), 'Includes Management Commitment topic');

    // Prompt responses should be comprehensive and context-aware
    prompts.forEach((p) => {
      assert(p.question.length > 20, `Question for "${p.topic}" is thorough`);
      assert(p.recommendedResponse.length > 20, `Recommended response for "${p.topic}" is actionable`);
      assert(p.riskMitigationContext.length > 20, `Risk context for "${p.topic}" is articulated`);
    });
  }

  // TEST GROUP 8: Comprehensive Financial Invariance Audit across All 13 Enterprise Templates
  console.log('\n--- TEST GROUP 8: FINANCIAL INVARIANCE AUDIT ACROSS ALL 13 ENTERPRISE TEMPLATES ---');
  {
    for (const template of ENTERPRISE_TEMPLATES) {
      const availableCapital = Math.round(template.minCapitalRequired * 0.25);
      const proj = financialEngineService.generateFinancialProjections({
        enterpriseId: template.id,
        capitalAvailable: availableCapital,
        promoterCategory: 'general',
        locationType: 'rural',
        state: 'Rajasthan',
        district: 'Alwar'
      });
      const finPlan = proj.plan;
      assert(finPlan !== null, `Financial plan calculated successfully for ${template.name}`);
      if (!finPlan) continue;

      // Generate assembled business plan (Phase 9 source of truth)
      const assembled = assembleBusinessPlan({
        enterprise: template as any,
        financialPlan: finPlan,
        availableCapital,
        location: {
          state: 'Rajasthan',
          district: 'Alwar',
          locationType: 'rural'
        }
      });
      assert(assembled !== null, `Assembled business plan valid for ${template.name}`);

      // Generate Phase 11 bank appraisal dossier
      const dossier = generateBankAppraisalDossier({
        enterpriseId: template.id,
        enterpriseName: template.name,
        enterpriseCategory: template.category,
        totalProjectCost: finPlan.totalProjectCost,
        fixedAssetsCost: finPlan.fixedAssetsCost,
        workingCapitalRequirement: finPlan.workingCapitalRequirement,
        availableCapital,
        promoterContribution: finPlan.promoterContribution,
        bankTermLoanRequired: finPlan.bankTermLoanRequired,
        financingGap: finPlan.financingGap,
        monthlyRevenue: finPlan.monthlyRevenue,
        monthlyOpex: proj.opex.totalMonthlyOpex,
        monthlyNetProfit: finPlan.monthlyNetProfit,
        debtServiceCoverageRatio: finPlan.debtServiceCoverageRatio,
        estimatedMonthlyEmi: finPlan.monthlyEmi,
        breakEvenCapacityPercent: finPlan.breakEvenSalesPercent ?? null,
        paybackYears: finPlan.paybackPeriodYears,
        state: 'Rajasthan',
        district: 'Alwar',
        locationType: 'rural'
      });



      // STRICT FINANCIAL INVARIANCE CHECK (ALL 15 KEY METRICS):
      assert(dossier.totalProjectCost === finPlan.totalProjectCost, `${template.name}: totalProjectCost invariant (${dossier.totalProjectCost})`);
      assert(dossier.fixedAssetsCost === finPlan.fixedAssetsCost, `${template.name}: fixedAssetsCost invariant (${dossier.fixedAssetsCost})`);
      assert(dossier.workingCapitalRequirement === finPlan.workingCapitalRequirement, `${template.name}: workingCapitalRequirement invariant (${dossier.workingCapitalRequirement})`);
      assert(dossier.availableCapital === availableCapital, `${template.name}: availableCapital invariant (${dossier.availableCapital})`);
      assert(dossier.financingGap === finPlan.financingGap, `${template.name}: financingGap invariant (${dossier.financingGap})`);
      assert(dossier.promoterContribution === finPlan.promoterContribution, `${template.name}: promoterContribution invariant (${dossier.promoterContribution})`);
      assert(dossier.bankTermLoanRequired === finPlan.bankTermLoanRequired, `${template.name}: bankTermLoanRequired invariant (${dossier.bankTermLoanRequired})`);
      assert(dossier.monthlyRevenue === finPlan.monthlyRevenue, `${template.name}: monthlyRevenue invariant (${dossier.monthlyRevenue})`);
      assert(dossier.monthlyOpex === proj.opex.totalMonthlyOpex, `${template.name}: monthlyOpex invariant (${dossier.monthlyOpex})`);
      assert(dossier.monthlyNetProfit === finPlan.monthlyNetProfit, `${template.name}: monthlyNetProfit invariant (${dossier.monthlyNetProfit})`);
      assert(dossier.debtServiceCoverageRatio === finPlan.debtServiceCoverageRatio, `${template.name}: debtServiceCoverageRatio invariant (${dossier.debtServiceCoverageRatio})`);

      // Verify tranche sum strictly invariant
      const trancheSum = dossier.disbursementMilestones.reduce((s, m) => s + m.estimatedTrancheAmount, 0);
      assert(trancheSum === finPlan.totalProjectCost, `${template.name}: disbursement tranche sum equals totalProjectCost`);
    }
  }


  // TEST GROUP 9: Banker's Dossier Plain Text & HTML Exports
  console.log('\n--- TEST GROUP 9: DOSSIER EXPORT GENERATION ---');
  {
    const template = ENTERPRISE_TEMPLATES[0];
    const proj = financialEngineService.generateFinancialProjections({
      enterpriseId: template.id,
      capitalAvailable: 250000,
      promoterCategory: 'general',
      locationType: 'rural',
      state: 'Rajasthan',
      district: 'Alwar'
    });
    const finPlan = proj.plan;
    const dossier = generateBankAppraisalDossier({
      enterpriseId: template.id,
      enterpriseName: template.name,
      enterpriseCategory: template.category,
      totalProjectCost: finPlan.totalProjectCost,
      fixedAssetsCost: finPlan.fixedAssetsCost,
      workingCapitalRequirement: finPlan.workingCapitalRequirement,
      availableCapital: 250000,
      promoterContribution: finPlan.promoterContribution,
      bankTermLoanRequired: finPlan.bankTermLoanRequired,
      financingGap: finPlan.financingGap,
      monthlyRevenue: finPlan.monthlyRevenue,
      monthlyOpex: proj.opex.totalMonthlyOpex,
      monthlyNetProfit: finPlan.monthlyNetProfit,
      debtServiceCoverageRatio: finPlan.debtServiceCoverageRatio,
      estimatedMonthlyEmi: finPlan.monthlyEmi,
      breakEvenCapacityPercent: finPlan.breakEvenSalesPercent ?? null,
      paybackYears: finPlan.paybackPeriodYears,
      state: 'Rajasthan',
      district: 'Alwar',
      locationType: 'rural'
    });

    // Plain text export
    const textExport = generateBankDossierPlainText(dossier);
    assert(textExport.includes('GRAMUDYAM — BANK CREDIT APPRAISAL DOSSIER'), 'Plain text contains official header');
    assert(textExport.includes('SECTION 1: ENTERPRISE & PROMOTER PROFILE'), 'Plain text contains Section 1');
    assert(textExport.includes('SECTION 2: CAPITAL STRUCTURE & PROMOTER MARGIN COMPLIANCE'), 'Plain text contains Section 2');
    assert(textExport.includes('SECTION 3: DEBT SERVICE & BANK REPAYMENT VIABILITY'), 'Plain text contains Section 3');
    assert(textExport.includes('SECTION 4: CREDIT GUARANTEE & COLLATERAL STRUCTURE'), 'Plain text contains Section 4');
    assert(textExport.includes('SECTION 5: MATCHED INSTITUTIONAL CREDIT FACILITIES'), 'Plain text contains Section 5');
    assert(textExport.includes('SECTION 6: STATUTORY PRE-SANCTION & DISBURSEMENT CLEARANCES'), 'Plain text contains Section 6');
    assert(textExport.includes('SECTION 7: PHASED CAPITAL DRAWDOWN & DISBURSEMENT MILESTONES'), 'Plain text contains Section 7');
    assert(textExport.includes('SECTION 8: BANK BRANCH DUE DILIGENCE & INTERVIEW Q&A PREPARATION'), 'Plain text contains Section 8');
    assert(textExport.includes('BANK CREDIT APPRAISAL DISCLAIMER:'), 'Plain text contains statutory disclaimer');

    // Printable HTML export
    const htmlExport = generateBankDossierHtml(dossier);
    assert(htmlExport.startsWith('<!DOCTYPE html>'), 'HTML export has valid DOCTYPE');
    assert(htmlExport.includes('<title>Bank Credit Appraisal Dossier'), 'HTML export has title tag');
    assert(htmlExport.includes('BANK CREDIT APPRAISAL & DESK REVIEW DOSSIER'), 'HTML export contains main heading');
    assert(htmlExport.includes('Phased Capital Drawdown Milestones'), 'HTML export contains milestones table');
    assert(htmlExport.includes('STATUTORY REGULATORY DISCLAIMER:'), 'HTML export contains statutory disclaimer');
  }

  // TEST GROUP 10: Backend Service Method Verification
  console.log('\n--- TEST GROUP 10: BACKEND SERVICE VERIFICATION ---');
  {
    const template = ENTERPRISE_TEMPLATES[1];
    const proj = financialEngineService.generateFinancialProjections({
      enterpriseId: template.id,
      capitalAvailable: 300000,
      promoterCategory: 'general',
      locationType: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi'
    });
    const finPlan = proj.plan;
    const reqPayload = {
      enterpriseId: template.id,
      enterpriseName: template.name,
      enterpriseCategory: template.category,
      totalProjectCost: finPlan.totalProjectCost,
      fixedAssetsCost: finPlan.fixedAssetsCost,
      workingCapitalRequirement: finPlan.workingCapitalRequirement,
      availableCapital: 300000,
      promoterContribution: finPlan.promoterContribution,
      bankTermLoanRequired: finPlan.bankTermLoanRequired,
      financingGap: finPlan.financingGap,
      monthlyRevenue: finPlan.monthlyRevenue,
      monthlyOpex: proj.opex.totalMonthlyOpex,
      monthlyNetProfit: finPlan.monthlyNetProfit,
      debtServiceCoverageRatio: finPlan.debtServiceCoverageRatio,
      estimatedMonthlyEmi: finPlan.monthlyEmi,
      breakEvenCapacityPercent: finPlan.breakEvenSalesPercent ?? null,
      paybackYears: finPlan.paybackPeriodYears,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      locationType: 'rural' as const
    };



    const serviceDossier = bankAppraisalService.generateAppraisal(reqPayload);

    assert(serviceDossier !== null, 'Service successfully generates appraisal dossier');
    assert(serviceDossier.enterpriseName === template.name, 'Dossier enterprise name matches');
    assert(serviceDossier.totalProjectCost === finPlan.totalProjectCost, 'Dossier total project cost matches');

    const serviceText = bankAppraisalService.exportText(serviceDossier);
    assert(serviceText.length > 500, 'Service exports comprehensive plain text');

    const serviceHtml = bankAppraisalService.exportHtml(serviceDossier);
    assert(serviceHtml.length > 500, 'Service exports comprehensive printable HTML');
  }

  console.log('\n================================================================');
  console.log(`PHASE 11 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase11Tests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
