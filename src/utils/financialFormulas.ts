/**
 * Authoritative Deterministic Financial Formulas for GramUdyam
 * Single Source of Truth for all financial & scaling calculations.
 */

import { LoanEmiCalculation } from '../types/loans.ts';

// Scenario Adjustment Constants
export const CONSERVATIVE_REVENUE_FACTOR = 0.85; // -15% gross revenue under adverse market conditions
export const CONSERVATIVE_OPEX_FACTOR = 1.05;    // +5% operating expense inflation
export const CONSERVATIVE_INTEREST_RATE_DELTA = 0.01; // +100 bps bank risk spread

export const BASE_REVENUE_FACTOR = 1.00; // 100% baseline operational throughput
export const BASE_OPEX_FACTOR = 1.00;    // 100% baseline operational expense
export const BASE_INTEREST_RATE_DELTA = 0.00; // Baseline priority sector bank lending rate (9.5% p.a.)

export const OPTIMISTIC_REVENUE_FACTOR = 1.10; // +10% peak off-take / direct retail premium
export const OPTIMISTIC_OPEX_FACTOR = 0.96;    // -4% bulk raw material sourcing efficiency
export const OPTIMISTIC_INTEREST_RATE_DELTA = -0.01; // -100 bps concessional interest subvention

/**
 * 1. Authoritative Total Project Cost Formula:
 * Total Project Cost = Capital Expenditure (CapEx / Fixed Assets) + Working Capital Requirement
 * 
 * Note on Pre-Operative / Startup Expenses:
 * In our standard rural enterprise financial model, pre-operative / startup expenses
 * are categorized under Fixed Capital Assets (CapEx) as pre-operative civil/licensing assets.
 * CapEx = Equipment Cost + Infrastructure Cost + Pre-Operative Cost.
 * Working Capital = Raw Material Reserve + Cash Contingency.
 * Total Project Cost = CapEx + Working Capital.
 * No component is ever double-counted.
 */
export function calculateTotalProjectCost(fixedAssetsCost: number, workingCapitalRequirement: number): number {
  return fixedAssetsCost + workingCapitalRequirement;
}

/**
 * 2. Authoritative Financing Gap Formula:
 * Financing Gap = Math.max(0, Total Project Cost - Available Capital)
 * 
 * Always satisfies:
 * Promoter Contribution + Financing Gap = Total Project Cost
 */
export function calculateFinancingGap(totalProjectCost: number, availableCapital: number): {
  financingGap: number;
  promoterContribution: number;
  promoterContributionPercent: number;
  requiresExternalFinancing: boolean;
} {
  const safeCapital = Math.max(0, availableCapital || 0);
  const financingGap = Math.max(0, totalProjectCost - safeCapital);
  const promoterContribution = Math.min(safeCapital, totalProjectCost);
  const promoterContributionPercent = totalProjectCost > 0
    ? Math.round((promoterContribution / totalProjectCost) * 100)
    : 0;

  return {
    financingGap,
    promoterContribution,
    promoterContributionPercent,
    requiresExternalFinancing: financingGap > 0
  };
}

/**
 * 3. Authoritative Reducing-Balance Equated Monthly Installment (EMI) Formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 * 
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate % / 12 / 100)
 * n = Tenure in months
 * 
 * For zero interest:
 * EMI = P / n
 * 
 * Guards against negative, NaN, 0 tenure, 0 loan, without crashing.
 */
export function calculateEmi(
  principal: number,
  annualInterestRatePercent: number,
  tenureMonths: number
): LoanEmiCalculation {
  const p = Math.max(0, principal || 0);
  const n = Math.max(0, tenureMonths || 0);
  const rate = Math.max(0, annualInterestRatePercent || 0);

  if (p <= 0 || n <= 0 || isNaN(p) || isNaN(n)) {
    return {
      loanAmount: p,
      annualInterestRate: rate,
      tenureMonths: n,
      monthlyEmi: 0,
      totalInterestPayable: 0,
      totalPayment: 0
    };
  }

  // Zero interest: EMI = P / n
  if (rate === 0) {
    const monthlyEmi = Math.round(p / n);
    return {
      loanAmount: p,
      annualInterestRate: 0,
      tenureMonths: n,
      monthlyEmi,
      totalInterestPayable: 0,
      totalPayment: p
    };
  }

  const monthlyRate = rate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, n);
  if (!isFinite(factor) || factor <= 1) {
    const fallbackEmi = Math.round(p / n);
    return {
      loanAmount: p,
      annualInterestRate: rate,
      tenureMonths: n,
      monthlyEmi: fallbackEmi,
      totalInterestPayable: 0,
      totalPayment: p
    };
  }

  const monthlyEmi = Math.round((p * monthlyRate * factor) / (factor - 1));
  const totalPayment = monthlyEmi * n;
  const totalInterestPayable = Math.max(0, totalPayment - p);

  return {
    loanAmount: p,
    annualInterestRate: rate,
    tenureMonths: n,
    monthlyEmi,
    totalInterestPayable,
    totalPayment
  };
}

/**
 * 4. Authoritative Break-Even Analysis using Contribution Margin Approach:
 * 
 * Contribution Margin (CM) = Monthly Revenue - Variable Costs
 * Contribution Margin Ratio (CMR) = CM / Monthly Revenue
 * Break-even Revenue = Fixed Costs / CMR
 * Break-even Capacity % = (Fixed Costs / CM at Full Capacity) * 100
 * where Full Capacity CM = CM / (capacityUtilization / 100)
 * => Break-even Capacity % = (Fixed Costs / CM) * capacityUtilization
 * 
 * If CM <= 0, unit economics are negative; break-even is not achievable.
 * No arbitrary clamps (e.g. Math.min/Math.max) to fabricate percentages.
 */
export function calculateBreakEven(
  monthlyRevenue: number,
  monthlyFixedCosts: number,
  monthlyVariableCosts: number,
  capacityUtilization: number = 80
): {
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenMonthlyRevenue: number | null;
  breakEvenSalesPercent: number | null;
  breakEvenStatus: string;
} {
  const contributionMargin = monthlyRevenue - monthlyVariableCosts;

  if (contributionMargin <= 0 || monthlyRevenue <= 0) {
    return {
      contributionMargin,
      contributionMarginRatio: monthlyRevenue > 0 ? contributionMargin / monthlyRevenue : 0,
      breakEvenMonthlyRevenue: null,
      breakEvenSalesPercent: null,
      breakEvenStatus: 'Not achievable under current assumptions'
    };
  }

  const contributionMarginRatio = contributionMargin / monthlyRevenue;
  const breakEvenMonthlyRevenue = Math.round(monthlyFixedCosts / contributionMarginRatio);
  const breakEvenCapacity = (monthlyFixedCosts / contributionMargin) * capacityUtilization;
  const breakEvenSalesPercent = Number(breakEvenCapacity.toFixed(1));

  let breakEvenStatus: string;
  if (breakEvenCapacity > 100) {
    breakEvenStatus = `Requires ${breakEvenSalesPercent}% capacity (exceeds 100% rated capacity under current assumptions)`;
  } else {
    breakEvenStatus = `Achievable at ${breakEvenSalesPercent}% plant capacity`;
  }

  return {
    contributionMargin,
    contributionMarginRatio,
    breakEvenMonthlyRevenue,
    breakEvenSalesPercent,
    breakEvenStatus
  };
}

/**
 * 5. Authoritative Debt Service Coverage Ratio (DSCR):
 * DSCR = Cash Available for Debt Service (CADS) / Debt Service
 * CADS = Annual Net Profit + Annual Depreciation + Annual Interest Expense
 * Debt Service = Annual EMI (Principal + Interest)
 * 
 * When Debt Service == 0: DSCR is null, indicated as "No debt service".
 * Never returns Infinity or fabricated values.
 */
export function calculateDscr(
  cashAvailableForDebtService: number,
  totalDebtService: number
): {
  dscr: number | null;
  dscrStatus: string;
} {
  if (totalDebtService <= 0) {
    return {
      dscr: null,
      dscrStatus: 'No debt service'
    };
  }

  const dscr = Number((cashAvailableForDebtService / totalDebtService).toFixed(2));
  let dscrStatus: string;
  if (dscr >= 1.50) {
    dscrStatus = `Comfortable debt coverage (${dscr}x)`;
  } else if (dscr >= 1.00) {
    dscrStatus = `Adequate debt coverage (${dscr}x)`;
  } else {
    dscrStatus = `Debt service deficit (${dscr}x, cash flow insufficient)`;
  }

  return {
    dscr,
    dscrStatus
  };
}
