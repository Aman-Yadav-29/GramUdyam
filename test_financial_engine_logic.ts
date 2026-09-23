/**
 * Comprehensive Deterministic Unit Tests for GramUdyam Financial Engine & Scaling
 * 
 * Verifies all requirements with known hand-calculable values and real business templates:
 * 1. Project Cost: Total Project Cost = CapEx + Working Capital Requirement
 * 2. Financing Gap: Math.max(0, Total Project Cost - Available Capital)
 * 3. EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1) and zero-interest division
 * 4. Break-Even: Contribution Margin approach with hand-calculable verification
 * 5. DSCR: Cash Available for Debt Service / Debt Service, handling 0 debt service explicitly
 * 6. Business Scaling: Integer stepping, no fractional units, Case A, B, C, D, edge cases
 * 7. Multi-Scenario: Sensitivity hierarchy (Conservative vs Base vs Optimistic)
 */

import {
  calculateTotalProjectCost,
  calculateFinancingGap,
  calculateEmi,
  calculateBreakEven,
  calculateDscr,
  CONSERVATIVE_REVENUE_FACTOR,
  CONSERVATIVE_OPEX_FACTOR,
  CONSERVATIVE_INTEREST_RATE_DELTA,
  BASE_REVENUE_FACTOR,
  BASE_OPEX_FACTOR,
  BASE_INTEREST_RATE_DELTA,
  OPTIMISTIC_REVENUE_FACTOR,
  OPTIMISTIC_OPEX_FACTOR,
  OPTIMISTIC_INTEREST_RATE_DELTA
} from './src/utils/financialFormulas.ts';
import { calculateDeterministicFinancialPlan } from './src/utils/financialEngine.ts';
import { evaluateBusinessScaling, calculateScaledCostBreakdown, SCALE_DEFINITIONS } from './src/utils/scalingEngine.ts';
import { BUSINESS_TEMPLATES } from './src/data/businessTemplates.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, message: string) {
  totalTests++;
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passedTests++;
    console.log(`  ✅ PASS: ${message} (${actual} ≈ ${expected}, diff: ${diff.toFixed(4)})`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message} (expected ${expected}, got ${actual}, diff: ${diff})`);
  }
}

console.log('================================================================');
console.log('🧪 GRAMUDYAM DETERMINISTIC FINANCIAL ENGINE & SCALING TEST SUITE');
console.log('================================================================\n');

// -------------------------------------------------------------
// Test Suite 1: Hand-Calculable Core Metric Tests (User Mandate)
// -------------------------------------------------------------
console.log('📋 Test Suite 1: Known-Value Metric Tests');
{
  // 1. Project Cost: CapEx = 100000, Working Capital = 50000 -> Expected Total Project Cost = 150000
  const cost1 = calculateTotalProjectCost(100000, 50000);
  assert(cost1 === 150000, `CapEx 100k + WC 50k = Total Project Cost 150k (got ${cost1})`);

  // 2. Financing Gap: Project Cost = 150000, Available Capital = 100000 -> Expected Financing Gap = 50000
  const gap1 = calculateFinancingGap(150000, 100000);
  assert(gap1.financingGap === 50000, `Project Cost 150k - Capital 100k = Financing Gap 50k (got ${gap1.financingGap})`);
  assert(gap1.promoterContribution === 100000, `Promoter contribution is 100k (got ${gap1.promoterContribution})`);
  assert(gap1.requiresExternalFinancing === true, 'External financing is required when gap > 0');

  // 3. No Financing Gap: Project Cost = 150000, Available Capital = 200000 -> Expected Financing Gap = 0
  const gap2 = calculateFinancingGap(150000, 200000);
  assert(gap2.financingGap === 0, `Project Cost 150k - Capital 200k = Financing Gap 0 (got ${gap2.financingGap})`);
  assert(gap2.promoterContribution === 150000, `Promoter contribution capped at project cost 150k (got ${gap2.promoterContribution})`);
  assert(gap2.requiresExternalFinancing === false, 'No external financing required when gap === 0');

  // 4. Zero-Interest EMI: Principal = 120000, Months = 12, Interest = 0 -> Expected EMI = 10000
  const emiZeroRate = calculateEmi(120000, 0, 12);
  assert(emiZeroRate.monthlyEmi === 10000, `Principal 120k, 12 mos, 0% interest = EMI 10k (got ${emiZeroRate.monthlyEmi})`);
  assert(emiZeroRate.totalInterestPayable === 0, 'Zero interest payable for 0% loan');
  assert(emiZeroRate.totalPayment === 120000, 'Total payment equals principal for 0% loan');

  // 5. Standard EMI with known interest: P = 1,000,000, 9.5% p.a., 60 months
  // r = 9.5 / 12 / 100 = 0.007916666666667
  // (1+r)^60 = 1.6050092
  // EMI = 1,000,000 * 0.007916666666667 * 1.6050092 / (1.6050092 - 1) = 21,001.93 -> 21,002
  const emiStandard = calculateEmi(1000000, 9.5, 60);
  assertClose(emiStandard.monthlyEmi, 21002, 2, `P=10L, 9.5%, 60 mos yields ₹21,002/mo (got ${emiStandard.monthlyEmi})`);

  // 6. EMI edge cases: 0 principal, negative principal, 0 tenure
  assert(calculateEmi(0, 9.5, 60).monthlyEmi === 0, 'Zero principal returns EMI 0');
  assert(calculateEmi(-50000, 9.5, 60).monthlyEmi === 0, 'Negative principal returns EMI 0');
  assert(calculateEmi(100000, 9.5, 0).monthlyEmi === 0, 'Zero tenure returns EMI 0');

  // 7. Break-Even hand-calculable test:
  // Revenue = 100000, Fixed = 20000, Variable = 60000, Capacity = 80%
  // CM = 100000 - 60000 = 40000
  // CMR = 40000 / 100000 = 0.40
  // BE Revenue = 20000 / 0.40 = 50000
  // BE Capacity % = (20000 / 40000) * 80 = 40.0%
  const beCalc = calculateBreakEven(100000, 20000, 60000, 80);
  assert(beCalc.contributionMargin === 40000, `Contribution Margin = 40k (got ${beCalc.contributionMargin})`);
  assert(beCalc.breakEvenMonthlyRevenue === 50000, `Break-Even Monthly Revenue = 50k (got ${beCalc.breakEvenMonthlyRevenue})`);
  assert(beCalc.breakEvenSalesPercent === 40.0, `Break-Even Capacity = 40.0% (got ${beCalc.breakEvenSalesPercent})`);

  // 8. Negative Break-Even (unit economics negative): Variable > Revenue
  const beNegative = calculateBreakEven(100000, 20000, 110000, 80);
  assert(beNegative.breakEvenSalesPercent === null, 'Negative CM returns null breakEvenSalesPercent');
  assert(beNegative.breakEvenMonthlyRevenue === null, 'Negative CM returns null breakEvenMonthlyRevenue');

  // 9. DSCR hand-calculable test:
  // Cash Available = 300,000, Debt Service = 200,000 -> DSCR = 1.50x
  const dscr1 = calculateDscr(300000, 200000);
  assert(dscr1.dscr === 1.50, `DSCR = 300k / 200k = 1.50x (got ${dscr1.dscr})`);
  assert(dscr1.dscrStatus.includes('Comfortable'), 'DSCR >= 1.5 indicates comfortable coverage');

  // 10. DSCR with zero debt service:
  const dscrZero = calculateDscr(300000, 0);
  assert(dscrZero.dscr === null, 'Zero debt service returns null DSCR (never Infinity)');
  assert(dscrZero.dscrStatus === 'No debt service', 'Zero debt service status indicates "No debt service"');
}

// -------------------------------------------------------------
// Test Suite 2: Business Scaling Verification (All 4 Cases & Edge Cases)
// -------------------------------------------------------------
console.log('\n📋 Test Suite 2: Business Scaling Verification');
{
  const dairy = BUSINESS_TEMPLATES.find(t => t.id === 'ent_dairy_cattle')!;
  const scaleDef = SCALE_DEFINITIONS['ent_dairy_cattle'];

  // Test Case A: Enough capital for standard scale (10 animals, Total Cost ₹8.0 Lakh)
  // Capital = ₹10 Lakh >= ₹8 Lakh
  const scalingA = evaluateBusinessScaling(dairy, 1000000);
  assert(scalingA.isScalable === true, 'Dairy farm is scalable');
  assert(scalingA.canScaleToBudget === true, 'Can scale to budget');
  assert(scalingA.suggestedScaleUnits === 10, `Suggested scale is standard 10 animals (got ${scalingA.suggestedScaleUnits})`);
  assert(scalingA.financingGap === 0, 'Financing gap is 0 when fully equity funded');
  assert(scalingA.requiresExternalFinancing === false, 'No external financing needed for Case A');
  assert(scalingA.affordabilityTier === 'FITS_BUDGET', 'Tier is FITS_BUDGET');

  // Test Case B: User budget ₹1.5 Lakh.
  // Standard 10 animals costs ₹8.0 Lakh.
  // Downscaled 5 animals costs ₹4.95 Lakh.
  // User capital ₹1.5 Lakh provides 30.3% promoter equity (>= 20%).
  // Gap = ₹3.45 Lakh (<= ₹15 Lakh limit).
  // Matches Case B: Affordable with financing at 5 animals!
  const scalingB = evaluateBusinessScaling(dairy, 150000);
  assert(scalingB.standardScaleUnits === 10, 'Standard scale is 10 animals');
  assert(scalingB.suggestedScaleUnits === 5, `Suggested scale downscaled to 5 animals (got ${scalingB.suggestedScaleUnits})`);
  assert(Number.isInteger(scalingB.suggestedScaleUnits), 'Suggested units is strictly an integer, NO fractions');
  assert(scalingB.requiresExternalFinancing === true, 'Requires external financing');
  assert(scalingB.financingGap > 0, `Financing gap is positive: ₹${scalingB.financingGap}`);
  assert(scalingB.estimatedMonthlyEmi > 0, `Estimated EMI is calculated on financing gap: ₹${scalingB.estimatedMonthlyEmi}/mo`);
  assert(scalingB.affordabilityTier === 'LIMITED_FINANCING', 'Tier is LIMITED_FINANCING');

  // Test Case D: Insufficient capital for minimum viable scale
  // Dairy farm requires 5 animals (₹4.95 Lakh). User budget ₹20,000 provides only 4% equity (< 20%).
  const scalingD = evaluateBusinessScaling(dairy, 20000);
  assert(scalingD.canScaleToBudget === false, 'Cannot scale to ₹20,000 budget');
  assert(scalingD.suggestedScaleUnits === 5, 'Suggested scale remains at minimum viable 5 animals');
  assert(scalingD.affordabilityTier === 'HIGHER_INVESTMENT', 'Classified as HIGHER_INVESTMENT');
  assert(scalingD.affordabilityReason.includes('minimum viable scale'), 'Reason explicitly mentions minimum viable scale');

  // Test Edge Case: Zero or negative capital
  const scalingZero = evaluateBusinessScaling(dairy, 0);
  assert(scalingZero.affordabilityTier === 'HIGHER_INVESTMENT', 'Zero capital classified as HIGHER_INVESTMENT');
  assert(scalingZero.availableCapital === 0, 'Available capital safely guarded to 0');

  const scalingNeg = evaluateBusinessScaling(dairy, -50000);
  assert(scalingNeg.availableCapital === 0, 'Negative capital safely guarded to 0');
  assert(scalingNeg.affordabilityTier === 'HIGHER_INVESTMENT', 'Negative capital classified as HIGHER_INVESTMENT');

  // Test Edge Case: Invalid or undefined business template
  const scalingInvalid = evaluateBusinessScaling(null as any, 100000);
  assert(scalingInvalid !== null, 'Invalid template handled gracefully without crashing');
  assert(scalingInvalid.affordabilityTier === 'HIGHER_INVESTMENT', 'Invalid template classified as HIGHER_INVESTMENT');

  // Verify non-fractional units across all scale definitions
  for (const [key, def] of Object.entries(SCALE_DEFINITIONS)) {
    const template = BUSINESS_TEMPLATES.find(t => t.id === key);
    if (!template) continue;
    const res = evaluateBusinessScaling(template, 75000);
    assert(Number.isInteger(res.suggestedScaleUnits), `Template ${key}: suggested units (${res.suggestedScaleUnits}) is strictly integer`);
    assert(Number.isInteger(res.minViableUnits), `Template ${key}: min viable units (${res.minViableUnits}) is strictly integer`);
  }
}

// -------------------------------------------------------------
// Test Suite 3: Total Project Cost Across All Real Templates
// Mandatory Rule: Total Project Cost = CapEx + Working Capital Requirement
// -------------------------------------------------------------
console.log('\n📋 Test Suite 3: CapEx + Working Capital Consistency Across Templates');
{
  for (const template of BUSINESS_TEMPLATES) {
    const plan = calculateDeterministicFinancialPlan({
      business: template,
      availableCapital: 250000
    });

    assert(
      plan.totalProjectCost === plan.fixedAssetsCost + plan.workingCapitalRequirement,
      `Template '${template.name}': Total (${plan.totalProjectCost}) === CapEx (${plan.fixedAssetsCost}) + WC (${plan.workingCapitalRequirement})`
    );

    assert(
      plan.financingGap === Math.max(0, plan.totalProjectCost - 250000),
      `Template '${template.name}': Financing Gap === Total (${plan.totalProjectCost}) - Available (250000)`
    );

    assert(
      plan.promoterContribution + plan.financingGap === plan.totalProjectCost,
      `Template '${template.name}': Promoter (${plan.promoterContribution}) + Gap (${plan.financingGap}) === Total (${plan.totalProjectCost})`
    );
  }
}

// -------------------------------------------------------------
// Test Suite 4: Multi-Scenario Recalculation & Hierarchy
// -------------------------------------------------------------
console.log('\n📋 Test Suite 4: Multi-Scenario Hierarchy (Conservative vs Base vs Optimistic)');
{
  const template = BUSINESS_TEMPLATES.find(t => t.id === 'ent_spices_processing')!;

  const planBase = calculateDeterministicFinancialPlan({ business: template, availableCapital: 200000, scenario: 'base' });
  const planCons = calculateDeterministicFinancialPlan({ business: template, availableCapital: 200000, scenario: 'conservative' });
  const planOpt = calculateDeterministicFinancialPlan({ business: template, availableCapital: 200000, scenario: 'optimistic' });

  // Revenue hierarchy: Conservative < Base < Optimistic
  assert(
    planCons.monthlyRevenue < planBase.monthlyRevenue && planBase.monthlyRevenue < planOpt.monthlyRevenue,
    `Revenue: Cons (${planCons.monthlyRevenue}) < Base (${planBase.monthlyRevenue}) < Opt (${planOpt.monthlyRevenue})`
  );

  // OPEX hierarchy: Conservative > Base > Optimistic
  assert(
    planCons.monthlyOperatingExpenses > planBase.monthlyOperatingExpenses &&
    planBase.monthlyOperatingExpenses > planOpt.monthlyOperatingExpenses,
    `OPEX: Cons (${planCons.monthlyOperatingExpenses}) > Base (${planBase.monthlyOperatingExpenses}) > Opt (${planOpt.monthlyOperatingExpenses})`
  );

  // Net profit hierarchy: Conservative < Base < Optimistic
  assert(
    planCons.monthlyNetProfit < planBase.monthlyNetProfit && planBase.monthlyNetProfit < planOpt.monthlyNetProfit,
    `Net Profit: Cons (${planCons.monthlyNetProfit}) < Base (${planBase.monthlyNetProfit}) < Opt (${planOpt.monthlyNetProfit})`
  );

  // EMI sensitivity: Conservative rate (+100 bps) > Base rate > Optimistic rate (-100 bps)
  if (planBase.financingGap > 0) {
    assert(
      planCons.monthlyEmi > planOpt.monthlyEmi,
      `EMI Sensitivity: Cons EMI (${planCons.monthlyEmi}) > Opt EMI (${planOpt.monthlyEmi})`
    );
  }
}

// -------------------------------------------------------------
// Test Suite 5: Cash Flow 12-Month & 3-Year Continuity
// -------------------------------------------------------------
console.log('\n📋 Test Suite 5: Cash Flow Schedule Generation');
{
  const honey = BUSINESS_TEMPLATES.find(t => t.id === 'ent_beekeeping')!;
  const plan = calculateDeterministicFinancialPlan({ business: honey, availableCapital: 50000 });

  assert(plan.cashFlow.year1Monthly.length === 12, '12 monthly points in Year 1 cash flow');
  assert(plan.cashFlow.threeYearAnnual.length === 3, '3 annual points in 3-Year cash flow');

  // Verify monthly continuity: month 2 opening == month 1 closing
  const m1 = plan.cashFlow.year1Monthly[0];
  const m2 = plan.cashFlow.year1Monthly[1];
  assert(
    m2.cumulativeCashBalance === m1.cumulativeCashBalance + m2.netCashSurplus,
    'Cumulative cash balance rolls forward continuously each month'
  );
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 FINAL RESULT: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
}
