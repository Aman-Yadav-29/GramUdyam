import { 
  discoverBusinessesByBudget, 
  calculateBusinessPlanForCapital, 
  DEFAULT_DISCOVERY_CONFIG 
} from './server/services/discoveryEngine.ts';
import { BUSINESS_TEMPLATES } from './src/data/businessTemplates.ts';
import { DiscoverySortOption } from './src/types/business.ts';

console.log('================================================================');
console.log('🧪 GRAMUDYAM PHASE 3: BUDGET-FIRST BUSINESS DISCOVERY VERIFICATION');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: STRICT CAPITAL VALIDATION & NO ARBITRARY DEFAULT
// -----------------------------------------------------------------------------
console.log('📋 Test Suite 1: Strict Capital Validation (No Defaults)');

try {
  discoverBusinessesByBudget(undefined as any);
  assert(false, 'discoverBusinessesByBudget should reject undefined capital');
} catch (e: any) {
  assert(true, 'discoverBusinessesByBudget rejected undefined capital', e.message);
}

try {
  discoverBusinessesByBudget(null as any);
  assert(false, 'discoverBusinessesByBudget should reject null capital');
} catch (e: any) {
  assert(true, 'discoverBusinessesByBudget rejected null capital', e.message);
}

try {
  discoverBusinessesByBudget(0);
  assert(false, 'discoverBusinessesByBudget should reject zero capital');
} catch (e: any) {
  assert(true, 'discoverBusinessesByBudget rejected zero capital', e.message);
}

try {
  discoverBusinessesByBudget(-50000);
  assert(false, 'discoverBusinessesByBudget should reject negative capital');
} catch (e: any) {
  assert(true, 'discoverBusinessesByBudget rejected negative capital', e.message);
}

// -----------------------------------------------------------------------------
// TEST SUITE 2: BUDGET PRESET RUNS (₹50k, ₹1L, ₹2L, ₹5L, ₹10L)
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 2: Preset Capital Evaluations');

const PRESETS = [50000, 100000, 200000, 500000, 1000000];

for (const capital of PRESETS) {
  const result = discoverBusinessesByBudget(capital);
  
  assert(result.availableCapital === capital, `Result capital strictly matches input ₹${capital}`);
  assert(result.totalAnalyzed === BUSINESS_TEMPLATES.length, `Evaluated all ${BUSINESS_TEMPLATES.length} configured templates`);
  
  const sumOfTiers = result.fitsBudget.length + result.limitedFinancing.length + result.higherInvestment.length;
  assert(sumOfTiers === BUSINESS_TEMPLATES.length, `Tier counts sum exactly to total templates (${sumOfTiers} === ${BUSINESS_TEMPLATES.length})`);
  assert(result.counts.fitsBudget === result.fitsBudget.length, 'counts.fitsBudget matches fitsBudget array length');
  assert(result.counts.limitedFinancing === result.limitedFinancing.length, 'counts.limitedFinancing matches limitedFinancing array length');
  assert(result.counts.higherInvestment === result.higherInvestment.length, 'counts.higherInvestment matches higherInvestment array length');
  
  // Verify configuration properties
  assert(typeof result.config.minPromoterEquityPercent === 'number', `minPromoterEquityPercent present in config (${result.config.minPromoterEquityPercent}%)`);
  assert(typeof result.config.minViableDscr === 'number', `minViableDscr present in config (${result.config.minViableDscr}x)`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 3: CUSTOM CAPITAL AMOUNT (₹3,50,000) - NO ROUNDING TO PRESET
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 3: Custom Capital Amount (₹3,50,000)');

const customCapital = 350000;
const customResult = discoverBusinessesByBudget(customCapital);

assert(customResult.availableCapital === 350000, 'Custom capital preserved exactly as ₹3,50,000 (not mapped to ₹2L or ₹5L)');

const allCustomPlans = [
  ...customResult.fitsBudget,
  ...customResult.limitedFinancing,
  ...customResult.higherInvestment
];

assert(allCustomPlans.length === BUSINESS_TEMPLATES.length, `Evaluated all ${BUSINESS_TEMPLATES.length} businesses for custom capital ₹3,50,000`);

// Check each business plan under ₹3,50,000
for (const plan of allCustomPlans) {
  assert(plan.availableCapital === 350000, `Business plan for ${plan.business.name} retains custom capital`);
  
  // Check financing gap calculation
  const expectedGap = Math.max(0, plan.projectCost - customCapital);
  assert(plan.financingGap === expectedGap, `Financing gap correctly calculated for ${plan.business.name}: ${plan.financingGap} === ${expectedGap}`);
  
  // Check affordability categorization logic
  if (customCapital >= plan.projectCost) {
    assert(plan.affordabilityTier === 'FITS_BUDGET', `${plan.business.name} with project cost ₹${plan.projectCost} categorized as FITS_BUDGET`);
    assert(plan.monthlyEmi === 0, `Zero financing has 0 EMI`);
    assert(plan.dscr === null, `Zero financing has null DSCR`);
  } else {
    const minEquity = customResult.config.minPromoterEquityPercent ?? 20;
    const minDscr = customResult.config.minViableDscr ?? 1.20;
    const isViable = plan.promoterEquityPercent >= minEquity && (plan.dscr !== null && plan.dscr >= minDscr);
    
    if (isViable) {
      assert(plan.affordabilityTier === 'LIMITED_FINANCING', `${plan.business.name} correctly categorized as LIMITED_FINANCING (Equity: ${plan.promoterEquityPercent}%, DSCR: ${plan.dscr})`);
    } else {
      assert(plan.affordabilityTier === 'HIGHER_INVESTMENT', `${plan.business.name} correctly categorized as HIGHER_INVESTMENT (Equity: ${plan.promoterEquityPercent}%, DSCR: ${plan.dscr})`);
    }
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 4: MATHEMATICAL RIGOR (FORMULAS, BREAK-EVEN, ROI, PAYBACK)
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 4: Deterministic Financial Calculations');

for (const tmpl of BUSINESS_TEMPLATES) {
  const plan = calculateBusinessPlanForCapital(tmpl, 200000);
  
  // 1. Project Cost
  const calculatedCost = tmpl.fixedAssets.totalFixedAssets + tmpl.workingCapital.totalWorkingCapital;
  assert(plan.projectCost === calculatedCost, `Project cost for ${tmpl.name} matches sum of assets + working capital`);
  
  // 2. Net profit calculation check
  const monthlyRevenue = tmpl.revenueAssumptions.expectedMonthlyRevenue;
  const monthlyOpex = tmpl.operatingCosts.totalMonthlyOpex;
  const monthlyDep = Math.round(((tmpl.fixedAssets.equipmentCost * 0.15) + (tmpl.fixedAssets.infrastructureCost * 0.05)) / 12);
  const gap = Math.max(0, calculatedCost - 200000);
  const monthlyInt = gap > 0 ? Math.round((gap * DEFAULT_DISCOVERY_CONFIG.annualInterestRate) / 12) : 0;
  const expectedProfit = Math.round(monthlyRevenue - monthlyOpex - monthlyDep - monthlyInt);
  assert(plan.monthlyNetProfit === expectedProfit, `Monthly net profit matches formula for ${tmpl.name} (${plan.monthlyNetProfit} === ${expectedProfit})`);
  
  // 3. Margin
  const expectedMargin = Number(((expectedProfit / monthlyRevenue) * 100).toFixed(1));
  assert(plan.netMargin === expectedMargin, `Net margin percent accurate for ${tmpl.name}: ${plan.netMargin}% === ${expectedMargin}%`);
  
  // 4. Payback
  const annualCashFlow = (expectedProfit + monthlyDep) * 12;
  const expectedPayback = annualCashFlow > 0 ? Number((calculatedCost / annualCashFlow).toFixed(1)) : 9.9;
  assert(plan.paybackYears === expectedPayback, `Payback years accurate for ${tmpl.name}: ${plan.paybackYears} === ${expectedPayback}`);
  
  // 5. Break-even capacity percent
  assert(typeof plan.breakEvenPercent === 'number' && !isNaN(plan.breakEvenPercent), `Break-even capacity percent is valid number for ${tmpl.name}: ${plan.breakEvenPercent}%`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 5: NEUTRAL WORDING AUDIT (NO "STATUTORY" CLAIMS)
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 5: Neutral Regulatory & Affordability Phrasing');

for (const tmpl of BUSINESS_TEMPLATES) {
  const plan = calculateBusinessPlanForCapital(tmpl, 100000);
  assert(!plan.affordabilityReason.toLowerCase().includes('statutory'), `Affordability explanation for ${tmpl.name} contains no unverified "statutory" claims`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 6: SORTING VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n📋 Test Suite 6: Multi-Dimensional Sorting Verification');

const sortOptions: DiscoverySortOption[] = [
  'lowest_investment',
  'highest_profit',
  'lowest_gap',
  'shortest_payback',
  'highest_roi'
];

for (const sort of sortOptions) {
  const res = discoverBusinessesByBudget(200000, { sortBy: sort });
  
  // Check sorting within each non-empty tier
  for (const tierList of [res.fitsBudget, res.limitedFinancing, res.higherInvestment]) {
    let correctlySorted = true;
    for (let i = 1; i < tierList.length; i++) {
      const prev = tierList[i - 1];
      const curr = tierList[i];
      
      if (sort === 'lowest_investment' && prev.projectCost > curr.projectCost) correctlySorted = false;
      if (sort === 'highest_profit' && prev.monthlyNetProfit < curr.monthlyNetProfit) correctlySorted = false;
      if (sort === 'lowest_gap' && prev.financingGap > curr.financingGap) correctlySorted = false;
      if (sort === 'shortest_payback' && prev.paybackYears > curr.paybackYears) correctlySorted = false;
      if (sort === 'highest_roi' && prev.roi < curr.roi) correctlySorted = false;
    }
    assert(correctlySorted, `Sorting option '${sort}' correctly sorts within tier (${tierList.length} items)`);
  }
}

console.log('\n================================================================');
console.log(`📊 FINAL RESULT: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
