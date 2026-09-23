import { 
  CapexBreakdown, 
  FinancialPlan, 
  OpexMonthlyBreakdown, 
  FinancialScenarioType,
  ScenarioProjection,
  MultiScenarioProjections,
  CashFlowProjection,
  MonthlyCashFlowPoint,
  AnnualCashFlowPoint
} from '../types/financial.ts';
import { LoanEmiCalculation } from '../types/loans.ts';
import { BusinessTemplate } from '../types/business.ts';
import { 
  evaluateBusinessScaling, 
  calculateScaledCostBreakdown, 
  SCALE_DEFINITIONS 
} from './scalingEngine.ts';

/**
 * Calculates monthly EMI using the standard reducing-balance formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEmi(principal: number, annualInterestRate: number, tenureMonths: number): LoanEmiCalculation {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      loanAmount: principal,
      annualInterestRate,
      tenureMonths,
      monthlyEmi: 0,
      totalInterestPayable: 0,
      totalPayment: 0
    };
  }

  const monthlyRate = annualInterestRate / (12 * 100);
  if (monthlyRate === 0) {
    const monthlyEmi = Math.round(principal / tenureMonths);
    return {
      loanAmount: principal,
      annualInterestRate: 0,
      tenureMonths,
      monthlyEmi,
      totalInterestPayable: 0,
      totalPayment: principal
    };
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayment = monthlyEmi * tenureMonths;
  const totalInterestPayable = Math.max(0, totalPayment - principal);

  return {
    loanAmount: principal,
    annualInterestRate,
    tenureMonths,
    monthlyEmi,
    totalInterestPayable,
    totalPayment
  };
}

/**
 * Derives dynamic CAPEX asset allocation based on total recommended capital
 */
export function deriveCapexBreakdown(totalCapex: number): CapexBreakdown {
  const plantAndMachinery = Math.round(totalCapex * 0.58);
  const buildingAndCivilWorks = Math.round(totalCapex * 0.18);
  const electrificationAndUtilities = Math.round(totalCapex * 0.10);
  const landAndSiteDevelopment = Math.round(totalCapex * 0.05);
  const preOperativeExpenses = Math.round(totalCapex * 0.04);
  const contingencies = totalCapex - (plantAndMachinery + buildingAndCivilWorks + electrificationAndUtilities + landAndSiteDevelopment + preOperativeExpenses);

  return {
    landAndSiteDevelopment,
    buildingAndCivilWorks,
    plantAndMachinery,
    electrificationAndUtilities,
    preOperativeExpenses,
    contingencies,
    totalCapex
  };
}

/**
 * Derives monthly OPEX breakdown
 */
export function deriveMonthlyOpex(annualOperatingCost: number): OpexMonthlyBreakdown {
  const totalMonthly = Math.round(annualOperatingCost / 12);
  const rawMaterials = Math.round(totalMonthly * 0.62);
  const laborAndWages = Math.round(totalMonthly * 0.18);
  const utilitiesAndPower = Math.round(totalMonthly * 0.09);
  const packagingAndTransport = Math.round(totalMonthly * 0.06);
  const marketingAndAdmin = totalMonthly - (rawMaterials + laborAndWages + utilitiesAndPower + packagingAndTransport);

  return {
    rawMaterials,
    laborAndWages,
    utilitiesAndPower,
    packagingAndTransport,
    marketingAndAdmin,
    totalMonthlyOpex: totalMonthly
  };
}

/**
 * Scenario parameters defining variations from baseline model
 */
export interface ScenarioMultipliers {
  revenueMultiplier: number;
  opexMultiplier: number;
  interestRateDelta: number; // e.g. +0.01 for +1%
}

export const SCENARIO_PRESETS: Record<FinancialScenarioType, ScenarioMultipliers> = {
  conservative: {
    revenueMultiplier: 0.85, // -15% gross receipts
    opexMultiplier: 1.05,    // +5% cost inflation
    interestRateDelta: 0.01  // +100 bps loan rate
  },
  base: {
    revenueMultiplier: 1.00, // 100% baseline
    opexMultiplier: 1.00,    // 100% baseline
    interestRateDelta: 0.00  // baseline
  },
  optimistic: {
    revenueMultiplier: 1.10, // +10% receipts
    opexMultiplier: 0.96,    // -4% bulk procurement discount
    interestRateDelta: -0.01 // -100 bps rate discount
  }
};

/**
 * Computes deterministic scenario projections
 */
export function computeScenarioProjection(
  scenario: FinancialScenarioType,
  baseRevenue: number,
  baseOpex: number,
  depreciationMonthly: number,
  projectCost: number,
  financingGap: number,
  baseInterestRate: number,
  tenureMonths: number,
  capacityUtilization: number = 80,
  rawMaterialPortion: number = 0.60
): ScenarioProjection {
  const multipliers = SCENARIO_PRESETS[scenario];
  const monthlyRevenue = Math.round(baseRevenue * multipliers.revenueMultiplier);
  const monthlyOpex = Math.round(baseOpex * multipliers.opexMultiplier);
  
  const annualRate = Math.max(0.05, baseInterestRate + multipliers.interestRateDelta);
  const monthlyInterest = financingGap > 0
    ? Math.round((financingGap * annualRate) / 12)
    : 0;

  const emiCalc = calculateEmi(financingGap, annualRate * 100, tenureMonths);
  const monthlyEmi = emiCalc.monthlyEmi;

  const monthlyNetProfit = Math.round(monthlyRevenue - monthlyOpex - depreciationMonthly - monthlyInterest);
  const netMarginPercent = monthlyRevenue > 0
    ? Number(((monthlyNetProfit / monthlyRevenue) * 100).toFixed(1))
    : 0;

  const annualRevenue = monthlyRevenue * 12;
  const annualOpex = monthlyOpex * 12;
  const annualNetProfit = monthlyNetProfit * 12;
  const annualNetCashFlow = (monthlyNetProfit + depreciationMonthly) * 12;

  const roiPercent = projectCost > 0
    ? Number(((annualNetProfit / projectCost) * 100).toFixed(1))
    : 0;

  const paybackPeriodYears = annualNetCashFlow > 0
    ? Number((projectCost / annualNetCashFlow).toFixed(1))
    : 9.9;

  // Break-even calculations
  const fixedPortion = Math.round(monthlyOpex * (1 - rawMaterialPortion)) + depreciationMonthly + monthlyInterest;
  const variablePortion = Math.round(monthlyOpex * rawMaterialPortion);
  const contributionMargin = monthlyRevenue - variablePortion;

  let breakEvenSalesPercent: number;
  let breakEvenMonthlyRevenue: number;

  if (contributionMargin <= 0) {
    breakEvenSalesPercent = 100;
    breakEvenMonthlyRevenue = monthlyRevenue;
  } else {
    const breakEvenCapacity = (fixedPortion / contributionMargin) * capacityUtilization;
    breakEvenSalesPercent = Number(Math.max(0, breakEvenCapacity).toFixed(1));
    const marginRatio = contributionMargin / monthlyRevenue;
    breakEvenMonthlyRevenue = marginRatio > 0 ? Math.round(fixedPortion / marginRatio) : monthlyRevenue;
  }

  // DSCR calculation
  let debtServiceCoverageRatio: number | null = null;
  if (financingGap > 0) {
    const annualDebtService = monthlyEmi * 12;
    const annualCashAvailable = (monthlyNetProfit + depreciationMonthly + monthlyInterest) * 12;
    debtServiceCoverageRatio = annualDebtService > 0
      ? Number((annualCashAvailable / annualDebtService).toFixed(2))
      : null;
  }

  return {
    scenario,
    monthlyRevenue,
    monthlyOpex,
    monthlyNetProfit,
    netMarginPercent,
    annualRevenue,
    annualOpex,
    annualNetProfit,
    annualNetCashFlow,
    roiPercent,
    paybackPeriodYears,
    breakEvenSalesPercent,
    breakEvenMonthlyRevenue,
    debtServiceCoverageRatio,
    monthlyEmi
  };
}

/**
 * Generates monthly and 3-year cash flow projections
 */
export function generateCashFlowProjection(
  monthlyRevenue: number,
  monthlyOpex: number,
  monthlyDepreciation: number,
  monthlyInterest: number,
  monthlyEmi: number,
  initialCashSurplus: number = 0
): CashFlowProjection {
  const year1Monthly: MonthlyCashFlowPoint[] = [];
  let currentCumulative = initialCashSurplus;

  for (let m = 1; m <= 12; m++) {
    // Gestation ramp-up factor for months 1-2
    const rampFactor = m === 1 ? 0.75 : m === 2 ? 0.90 : 1.0;
    const rev = Math.round(monthlyRevenue * rampFactor);
    const opex = Math.round(monthlyOpex * (0.85 + 0.15 * rampFactor));
    const operatingCashFlow = rev - opex;
    const netCashSurplus = operatingCashFlow - monthlyEmi;
    currentCumulative += netCashSurplus;

    year1Monthly.push({
      month: m,
      grossRevenue: rev,
      operatingExpenses: opex,
      operatingCashFlow,
      debtServiceEmi: monthlyEmi,
      netCashSurplus,
      cumulativeCashBalance: currentCumulative
    });
  }

  const threeYearAnnual: AnnualCashFlowPoint[] = [];
  let yearEndCumulative = initialCashSurplus;

  for (let y = 1; y <= 3; y++) {
    // Normal annual expansion: Year 2 +7%, Year 3 +12%
    const growth = y === 1 ? 1.0 : y === 2 ? 1.07 : 1.14;
    const grossRev = Math.round(monthlyRevenue * 12 * growth);
    const opex = Math.round(monthlyOpex * 12 * (1 + (growth - 1) * 0.65));
    const depr = monthlyDepreciation * 12;
    const interest = Math.round(monthlyInterest * 12 * (y === 1 ? 1 : y === 2 ? 0.82 : 0.62)); // Reducing balance interest
    const netProf = grossRev - opex - depr - interest;
    const opCash = grossRev - opex;
    const debtServ = monthlyEmi * 12;
    const surplus = opCash - debtServ;
    yearEndCumulative += surplus;

    threeYearAnnual.push({
      year: y,
      grossRevenue: grossRev,
      operatingExpenses: opex,
      depreciation: depr,
      interest,
      netProfit: netProf,
      operatingCashFlow: opCash,
      debtService: debtServ,
      netSurplus: surplus,
      cumulativeCashBalance: yearEndCumulative
    });
  }

  return {
    year1Monthly,
    threeYearAnnual
  };
}

/**
 * Pure, deterministic Financial Engine:
 * Implements startup cost, fixed assets, working capital, total project cost,
 * monthly revenue, monthly opex, net profit, net margin, ROI, payback, break-even,
 * financing gap, EMI, DSCR, cash flows, scenarios and business scaling.
 */
export function calculateDeterministicFinancialPlan(params: {
  business: BusinessTemplate;
  availableCapital: number;
  scenario?: FinancialScenarioType;
  customScaleUnits?: number;
  annualInterestRate?: number;
  loanTenureMonths?: number;
  isSpecialCategory?: boolean;
  isRural?: boolean;
}): FinancialPlan {
  const {
    business,
    availableCapital,
    scenario = 'base',
    customScaleUnits,
    annualInterestRate = 0.095,
    loanTenureMonths = 60,
    isSpecialCategory = false,
    isRural = true
  } = params;

  // 1. Business Scaling Evaluation
  const scaling = evaluateBusinessScaling(business, availableCapital);
  const scaleDef = SCALE_DEFINITIONS[business.id];

  // If customScaleUnits is passed, use it; otherwise use standard template
  const unitsToUse = customScaleUnits ?? (scaleDef ? scaleDef.standardScaleUnits : 1);
  const scaledBreakdown = scaleDef
    ? calculateScaledCostBreakdown(business, scaleDef, unitsToUse)
    : {
        units: 1,
        scalingRatio: 1,
        fixedAssets: business.fixedAssets,
        workingCapital: business.workingCapital,
        totalProjectCost: business.fixedAssets.totalFixedAssets + business.workingCapital.totalWorkingCapital,
        monthlyRevenue: business.revenueAssumptions.expectedMonthlyRevenue,
        monthlyOpex: business.operatingCosts.totalMonthlyOpex,
        monthlyNetProfit: business.revenueAssumptions.expectedMonthlyRevenue - business.operatingCosts.totalMonthlyOpex
      };

  // 2. Cost Aggregations (MANDATORY RULE: Total Project Cost = CapEx + Working Capital Requirement)
  const startupCost = scaledBreakdown.fixedAssets.preOperativeCost;
  const fixedAssetsCost = scaledBreakdown.fixedAssets.totalFixedAssets;
  const workingCapitalRequirement = scaledBreakdown.workingCapital.totalWorkingCapital;
  const totalProjectCost = fixedAssetsCost + workingCapitalRequirement;

  // 3. Financing Gap Formula: Total Project Cost - Available Capital
  const financingGap = Math.max(0, totalProjectCost - availableCapital);
  const promoterContribution = Math.min(availableCapital, totalProjectCost);
  const promoterContributionPercent = totalProjectCost > 0
    ? Math.round((promoterContribution / totalProjectCost) * 100)
    : 0;

  // 4. Indicative Subsidy (PMEGP / PMFME benchmarks)
  let eligibleSubsidyEstimate = 0;
  if (isRural && isSpecialCategory) {
    eligibleSubsidyEstimate = Math.min(1750000, Math.round(totalProjectCost * 0.35));
  } else if (isRural || isSpecialCategory) {
    eligibleSubsidyEstimate = Math.min(1250000, Math.round(totalProjectCost * 0.25));
  } else {
    eligibleSubsidyEstimate = Math.min(750000, Math.round(totalProjectCost * 0.15));
  }

  // 5. Debt Service & EMI
  const bankTermLoanRequired = financingGap;
  const emiCalc = calculateEmi(bankTermLoanRequired, annualInterestRate * 100, loanTenureMonths);
  const monthlyEmi = emiCalc.monthlyEmi;
  const monthlyInterest = bankTermLoanRequired > 0
    ? Math.round((bankTermLoanRequired * annualInterestRate) / 12)
    : 0;
  const interestExpenseYear1 = monthlyInterest * 12;

  // 6. Monthly Operational Figures
  const baseMonthlyRevenue = scaledBreakdown.monthlyRevenue;
  const baseMonthlyOpex = scaledBreakdown.monthlyOpex;

  // Detailed OPEX Breakdown
  const ratio = scaledBreakdown.scalingRatio;
  const monthlyOpexBreakdown: OpexMonthlyBreakdown = {
    rawMaterials: Math.round(business.operatingCosts.rawMaterialsMonthly * ratio),
    laborAndWages: Math.round(business.operatingCosts.laborAndWagesMonthly * (0.40 + 0.60 * ratio)),
    utilitiesAndPower: Math.round(business.operatingCosts.utilitiesAndPowerMonthly * (0.30 + 0.70 * ratio)),
    packagingAndTransport: Math.round(business.operatingCosts.freightAndLogisticsMonthly * ratio),
    marketingAndAdmin: Math.round(business.operatingCosts.repairAndMaintenanceMonthly * (0.30 + 0.70 * ratio)),
    totalMonthlyOpex: baseMonthlyOpex
  };

  // 7. Depreciation (15% on machinery + 5% on sheds/civil)
  const annualDepr = (scaledBreakdown.fixedAssets.equipmentCost * 0.15) + (scaledBreakdown.fixedAssets.infrastructureCost * 0.05);
  const monthlyDepreciation = Math.round(annualDepr / 12);
  const depreciationYear1 = annualDepr;

  // 8. Scenario Projections (Conservative, Base, Optimistic)
  const rawMaterialPortion = business.operatingCosts.totalMonthlyOpex > 0
    ? business.operatingCosts.rawMaterialsMonthly / business.operatingCosts.totalMonthlyOpex
    : 0.60;

  const scenarios: MultiScenarioProjections = {
    conservative: computeScenarioProjection(
      'conservative',
      baseMonthlyRevenue,
      baseMonthlyOpex,
      monthlyDepreciation,
      totalProjectCost,
      financingGap,
      annualInterestRate,
      loanTenureMonths,
      business.revenueAssumptions.capacityUtilizationPercent,
      rawMaterialPortion
    ),
    base: computeScenarioProjection(
      'base',
      baseMonthlyRevenue,
      baseMonthlyOpex,
      monthlyDepreciation,
      totalProjectCost,
      financingGap,
      annualInterestRate,
      loanTenureMonths,
      business.revenueAssumptions.capacityUtilizationPercent,
      rawMaterialPortion
    ),
    optimistic: computeScenarioProjection(
      'optimistic',
      baseMonthlyRevenue,
      baseMonthlyOpex,
      monthlyDepreciation,
      totalProjectCost,
      financingGap,
      annualInterestRate,
      loanTenureMonths,
      business.revenueAssumptions.capacityUtilizationPercent,
      rawMaterialPortion
    )
  };

  // Active projection according to selected scenario
  const activeProjection = scenarios[scenario];

  const monthlyRevenue = activeProjection.monthlyRevenue;
  const monthlyOperatingExpenses = activeProjection.monthlyOpex;
  const monthlyNetProfit = activeProjection.monthlyNetProfit;
  const netMarginPercent = activeProjection.netMarginPercent;

  const annualTurnoverYear1 = activeProjection.annualRevenue;
  const annualOperatingCostYear1 = activeProjection.annualOpex;
  const annualEbitda = annualTurnoverYear1 - annualOperatingCostYear1;
  const profitBeforeTax = Math.max(0, annualEbitda - interestExpenseYear1 - depreciationYear1);
  const taxEstimate = Math.round(profitBeforeTax * 0.22);
  const profitAfterTax = profitBeforeTax - taxEstimate;

  const debtServiceCoverageRatio = activeProjection.debtServiceCoverageRatio ?? 0;
  const breakEvenSalesPercent = activeProjection.breakEvenSalesPercent;
  const breakEvenMonthlyRevenue = activeProjection.breakEvenMonthlyRevenue;
  const paybackPeriodYears = activeProjection.paybackPeriodYears;
  const returnOnInvestmentPercent = activeProjection.roiPercent;

  // Working Capital Bank Loan (Cash Credit estimate: ~15% of annual turnover)
  const workingCapitalBankLoan = Math.round(annualTurnoverYear1 * 0.15);

  // 9. Cash Flow Projections
  const initialCashSurplus = Math.max(0, availableCapital - totalProjectCost);
  const cashFlow = generateCashFlowProjection(
    monthlyRevenue,
    monthlyOperatingExpenses,
    monthlyDepreciation,
    monthlyInterest,
    monthlyEmi,
    initialCashSurplus
  );

  return {
    startupCost,
    fixedAssetsCost,
    workingCapitalRequirement,
    totalProjectCost,
    availableCapital,
    promoterContribution,
    promoterContributionPercent,
    financingGap,
    eligibleSubsidyEstimate,
    bankTermLoanRequired,
    workingCapitalBankLoan,
    monthlyRevenue,
    monthlyOperatingExpenses,
    monthlyOpexBreakdown,
    monthlyDepreciation,
    monthlyInterest,
    monthlyEmi,
    monthlyNetProfit,
    netMarginPercent,
    annualTurnoverYear1,
    annualOperatingCostYear1,
    annualEbitda,
    interestExpenseYear1,
    depreciationYear1,
    profitBeforeTax,
    taxEstimate,
    profitAfterTax,
    debtServiceCoverageRatio,
    breakEvenSalesPercent,
    breakEvenMonthlyRevenue,
    paybackPeriodYears,
    returnOnInvestmentPercent,
    cashFlow,
    scenarios,
    scaling
  };
}

/**
 * Backwards compatibility wrapper for buildFinancialPlan
 */
export function buildFinancialPlan(params: {
  recommendedCapital: number;
  availableEquity: number;
  expectedAnnualTurnover: number;
  netMarginPercent: number;
  isSpecialCategory: boolean;
  isRural: boolean;
  schemeCode?: string;
}): FinancialPlan {
  const totalProjectCost = params.recommendedCapital;
  const availableCapital = params.availableEquity;
  const financingGap = Math.max(0, totalProjectCost - availableCapital);
  const promoterContribution = Math.min(availableCapital, totalProjectCost);
  const promoterPercent = totalProjectCost > 0 ? Math.round((promoterContribution / totalProjectCost) * 100) : 100;

  const annualTurnoverYear1 = params.expectedAnnualTurnover;
  const annualOperatingCostYear1 = Math.round(annualTurnoverYear1 * (1 - (params.netMarginPercent / 100) - 0.08));
  const annualEbitda = annualTurnoverYear1 - annualOperatingCostYear1;

  const bankTermLoanRequired = financingGap;
  const emiCalc = calculateEmi(bankTermLoanRequired, 9.5, 60);
  const annualDebtService = emiCalc.monthlyEmi * 12;
  const interestExpenseYear1 = Math.round(bankTermLoanRequired * 0.095);
  const depreciationYear1 = Math.round(totalProjectCost * 0.10);

  const profitBeforeTax = Math.max(0, annualEbitda - interestExpenseYear1 - depreciationYear1);
  const taxEstimate = Math.round(profitBeforeTax * 0.22);
  const profitAfterTax = profitBeforeTax - taxEstimate;

  const netCashAvailableForDebtService = profitAfterTax + depreciationYear1 + interestExpenseYear1;
  const dscr = annualDebtService > 0 ? Number((netCashAvailableForDebtService / annualDebtService).toFixed(2)) : 0;

  const fixedCosts = Math.round(annualOperatingCostYear1 * 0.35) + interestExpenseYear1 + depreciationYear1;
  const variableCosts = Math.round(annualOperatingCostYear1 * 0.65);
  const contributionMargin = annualTurnoverYear1 - variableCosts;
  const breakEvenSalesPercent = contributionMargin > 0 ? Number(((fixedCosts / contributionMargin) * 100).toFixed(1)) : 48.0;

  const annualNetCashInflow = profitAfterTax + depreciationYear1;
  const paybackPeriodYears = annualNetCashInflow > 0 ? Number((totalProjectCost / annualNetCashInflow).toFixed(1)) : 3.2;
  const returnOnInvestmentPercent = totalProjectCost > 0 ? Number(((profitAfterTax / totalProjectCost) * 100).toFixed(1)) : 18.5;

  let subsidyEstimate = 0;
  if (params.isRural && params.isSpecialCategory) {
    subsidyEstimate = Math.min(1750000, Math.round(totalProjectCost * 0.35));
  } else if (params.isRural || params.isSpecialCategory) {
    subsidyEstimate = Math.min(1250000, Math.round(totalProjectCost * 0.25));
  } else {
    subsidyEstimate = Math.min(750000, Math.round(totalProjectCost * 0.15));
  }

  const monthlyRev = Math.round(annualTurnoverYear1 / 12);
  const monthlyOpex = Math.round(annualOperatingCostYear1 / 12);
  const monthlyDepr = Math.round(depreciationYear1 / 12);
  const monthlyInt = Math.round(interestExpenseYear1 / 12);
  const monthlyNet = Math.round(monthlyRev - monthlyOpex - monthlyDepr - monthlyInt);

  const scenarios: MultiScenarioProjections = {
    conservative: computeScenarioProjection('conservative', monthlyRev, monthlyOpex, monthlyDepr, totalProjectCost, financingGap, 0.095, 60),
    base: computeScenarioProjection('base', monthlyRev, monthlyOpex, monthlyDepr, totalProjectCost, financingGap, 0.095, 60),
    optimistic: computeScenarioProjection('optimistic', monthlyRev, monthlyOpex, monthlyDepr, totalProjectCost, financingGap, 0.095, 60)
  };

  const cashFlow = generateCashFlowProjection(monthlyRev, monthlyOpex, monthlyDepr, monthlyInt, emiCalc.monthlyEmi, Math.max(0, availableCapital - totalProjectCost));

  return {
    startupCost: Math.round(totalProjectCost * 0.04),
    fixedAssetsCost: Math.round(totalProjectCost * 0.75),
    workingCapitalRequirement: Math.round(totalProjectCost * 0.25),
    totalProjectCost,
    availableCapital,
    promoterContribution,
    promoterContributionPercent: promoterPercent,
    financingGap,
    eligibleSubsidyEstimate: subsidyEstimate,
    bankTermLoanRequired,
    workingCapitalBankLoan: Math.round(annualTurnoverYear1 * 0.15),
    monthlyRevenue: monthlyRev,
    monthlyOperatingExpenses: monthlyOpex,
    monthlyOpexBreakdown: deriveMonthlyOpex(annualOperatingCostYear1),
    monthlyDepreciation: monthlyDepr,
    monthlyInterest: monthlyInt,
    monthlyEmi: emiCalc.monthlyEmi,
    monthlyNetProfit: monthlyNet,
    netMarginPercent: monthlyRev > 0 ? Number(((monthlyNet / monthlyRev) * 100).toFixed(1)) : 0,
    annualTurnoverYear1,
    annualOperatingCostYear1,
    annualEbitda,
    interestExpenseYear1,
    depreciationYear1,
    profitBeforeTax,
    taxEstimate,
    profitAfterTax,
    debtServiceCoverageRatio: dscr,
    breakEvenSalesPercent,
    breakEvenMonthlyRevenue: Math.round(monthlyRev * (breakEvenSalesPercent / 100)),
    paybackPeriodYears,
    returnOnInvestmentPercent,
    cashFlow,
    scenarios
  };
}
