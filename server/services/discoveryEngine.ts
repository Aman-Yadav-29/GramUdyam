import type { BusinessTemplate, CalculatedBusinessPlan, BudgetDiscoveryResult, AffordabilityTier, DiscoverySortOption } from '../../src/types/business.ts';
import type { GisLocationQuery, DistrictIntelligence } from '../../src/types/location.ts';
import { BUSINESS_TEMPLATES } from '../../src/data/businessTemplates.ts';
import { evaluateBusinessScaling } from '../../src/utils/scalingEngine.ts';
import {
  calculateTotalProjectCost,
  calculateFinancingGap,
  calculateEmi as calculateFormulasEmi,
  calculateDscr,
  calculateBreakEven
} from '../../src/utils/financialFormulas.ts';
import { evaluateEnterpriseLocationSynergy } from '../../src/utils/locationIntelligenceEngine.ts';
import { locationGisService } from './locationGisService.ts';
import { agriLocationService } from './agriLocationService.ts';

export interface DiscoveryConfig {
  /**
   * Maximum leverage multiple allowed for "Limited Financing".
   * E.g. 5 means availableCapital * 5 >= projectCost (i.e. user provides at least 20% promoter equity).
   */
  maxLeverageMultiple: number;
  /**
   * Maximum debt gap considered manageable under micro/MSME financing (in INR).
   * Default: ₹15,00,000 (15 Lakhs), aligned with Mudra Tarun & PMEGP micro lending.
   */
  maxManageableDebt: number;
  /**
   * Annual interest rate for term loan estimation. Default: 9.5% p.a.
   */
  annualInterestRate: number;
  /**
   * Standard loan tenure in months. Default: 60 months (5 years).
   */
  loanTenureMonths: number;
  /**
   * Minimum Debt Service Coverage Ratio (DSCR) for viable debt servicing. Default: 1.20x
   */
  minViableDscr: number;
  /**
   * Minimum promoter equity percentage required for viable bank leverage. Default: 20%
   */
  minPromoterEquityPercent: number;
}

export const DEFAULT_DISCOVERY_CONFIG: DiscoveryConfig = {
  maxLeverageMultiple: 5.0, // Minimum 20% equity (1/5)
  maxManageableDebt: 1500000, // ₹15 Lakhs
  annualInterestRate: 0.095, // 9.5% p.a. illustrative assumption
  loanTenureMonths: 60, // 5 years
  minViableDscr: 1.20, // Banking benchmark
  minPromoterEquityPercent: 20 // 20% promoter equity threshold
};

/**
 * Calculates reducing balance Equated Monthly Installment (EMI) using authoritative formula
 */
export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  return calculateFormulasEmi(principal, annualRate * 100, tenureMonths).monthlyEmi;
}

/**
 * Calculates complete financial metrics for a business template given available capital.
 */
export function calculateBusinessPlanForCapital(
  business: BusinessTemplate,
  availableCapital: number,
  config: DiscoveryConfig = DEFAULT_DISCOVERY_CONFIG,
  locationQuery?: GisLocationQuery,
  districtIntel?: DistrictIntelligence
): CalculatedBusinessPlan {
  // 1. Total Project Cost (MANDATORY RULE: Total Project Cost = CapEx + Working Capital Requirement)
  const projectCost = calculateTotalProjectCost(
    business.fixedAssets.totalFixedAssets, 
    business.workingCapital.totalWorkingCapital
  );
  
  // 2. Financing Gap Formula: Total Project Cost - Available Capital
  const gapAnalysis = calculateFinancingGap(projectCost, availableCapital);
  const financingGap = gapAnalysis.financingGap;
  const promoterEquityPercent = gapAnalysis.promoterContributionPercent;

  // 3. Monthly Operational Figures
  const monthlyRevenue = business.revenueAssumptions.expectedMonthlyRevenue;
  const monthlyOpex = business.operatingCosts.totalMonthlyOpex;

  // 4. Depreciation (15% on machinery + 5% on civil structures / infrastructure)
  const annualDepreciation = (business.fixedAssets.equipmentCost * 0.15) + (business.fixedAssets.infrastructureCost * 0.05);
  const monthlyDepreciation = Math.round(annualDepreciation / 12);

  // 5. Debt Service & EMI (Calculated strictly on actual financing gap)
  const monthlyEmi = financingGap > 0 
    ? calculateEmi(financingGap, config.annualInterestRate, config.loanTenureMonths)
    : 0;
  
  // Year 1 average monthly interest
  const monthlyInterest = financingGap > 0 
    ? Math.round((financingGap * config.annualInterestRate) / 12)
    : 0;

  // 6. Net Profit
  // Net Profit = Revenue - OPEX - Depreciation - Interest
  const monthlyNetProfit = Math.round(monthlyRevenue - monthlyOpex - monthlyDepreciation - monthlyInterest);
  const netMargin = monthlyRevenue > 0 ? Number(((monthlyNetProfit / monthlyRevenue) * 100).toFixed(1)) : 0;

  // 7. Returns & Payback
  const annualNetProfit = monthlyNetProfit * 12;
  const annualCashInflow = (monthlyNetProfit + monthlyDepreciation) * 12;
  
  const roi = projectCost > 0 ? Number(((annualNetProfit / projectCost) * 100).toFixed(1)) : 0;
  const paybackYears = annualCashInflow > 0 
    ? Number((projectCost / annualCashInflow).toFixed(1)) 
    : 9.9;

  // 8. Break-even capacity utilization
  const monthlyFixedCosts = Math.round(
    business.operatingCosts.laborAndWagesMonthly +
    (business.operatingCosts.utilitiesAndPowerMonthly * 0.4) +
    (business.operatingCosts.repairAndMaintenanceMonthly * 0.5) +
    monthlyDepreciation +
    monthlyInterest
  );
  const monthlyVariableCosts = Math.round(
    business.operatingCosts.rawMaterialsMonthly +
    (business.operatingCosts.utilitiesAndPowerMonthly * 0.6) +
    (business.operatingCosts.repairAndMaintenanceMonthly * 0.5) +
    business.operatingCosts.freightAndLogisticsMonthly
  );
  const currentCapacityUtilization = business.revenueAssumptions.capacityUtilizationPercent || 80;
  const beAnalysis = calculateBreakEven(monthlyRevenue, monthlyFixedCosts, monthlyVariableCosts, currentCapacityUtilization);
  const breakEvenPercent = beAnalysis.breakEvenSalesPercent ?? 100;

  // 9. Debt Service Coverage Ratio (DSCR)
  let dscr: number | null = null;
  if (financingGap > 0) {
    const annualDebtService = monthlyEmi * 12;
    const annualCashAvailableForDebt = (monthlyNetProfit + monthlyDepreciation + monthlyInterest) * 12;
    const dscrAnalysis = calculateDscr(annualCashAvailableForDebt, annualDebtService);
    dscr = dscrAnalysis.dscr;
  }

  // 10. Affordability Classification
  let affordabilityTier: AffordabilityTier;
  let affordabilityReason: string;

  if (projectCost <= availableCapital) {
    affordabilityTier = 'FITS_BUDGET';
    const surplus = availableCapital - projectCost;
    affordabilityReason = surplus > 0
      ? `Fully covered by your available capital of ₹${availableCapital.toLocaleString('en-IN')}, leaving ₹${surplus.toLocaleString('en-IN')} contingency cash buffer.`
      : `Fully covered within your exact available capital of ₹${availableCapital.toLocaleString('en-IN')}. No external bank loan required.`;
  } else {
    const isEquitySufficient = promoterEquityPercent >= config.minPromoterEquityPercent;
    const isDebtManageable = financingGap <= config.maxManageableDebt;
    const isDscrViable = dscr === null || dscr >= config.minViableDscr;

    if (isEquitySufficient && isDebtManageable && isDscrViable) {
      affordabilityTier = 'LIMITED_FINANCING';
      affordabilityReason = `Requires ₹${financingGap.toLocaleString('en-IN')} bank financing. Your capital provides ${promoterEquityPercent}% promoter equity (meets the configured promoter-equity threshold of ${config.minPromoterEquityPercent}%) with an estimated DSCR of ${dscr}x.`;
    } else {
      affordabilityTier = 'HIGHER_INVESTMENT';
      if (!isEquitySufficient) {
        affordabilityReason = `Requires ₹${financingGap.toLocaleString('en-IN')} additional capital. Current available capital represents only ${promoterEquityPercent}% equity, below the configured promoter-equity threshold of ${config.minPromoterEquityPercent}%.`;
      } else if (!isDebtManageable) {
        affordabilityReason = `Financing gap of ₹${financingGap.toLocaleString('en-IN')} exceeds the micro-lending ceiling of ₹${config.maxManageableDebt.toLocaleString('en-IN')}. Requires joint-equity or venture co-promoter.`;
      } else {
        affordabilityReason = `Projected Debt Service Coverage Ratio (${dscr}x) is below the configured benchmark of ${config.minViableDscr}x.`;
      }
    }
  }

  // Resolve effective district intelligence and location query
  const effectiveDistrictIntel = districtIntel || 
    ((locationQuery as any)?.agroClimaticZone || (locationQuery as any)?.waterAvailabilityScore 
      ? (locationQuery as unknown as DistrictIntelligence) 
      : undefined);
  const effectiveLocationQuery = (locationQuery as any)?.agroClimaticZone ? undefined : locationQuery;

  // Phase 5: Location Fit Assessment
  let locationFit = undefined;
  if (effectiveDistrictIntel) {
    locationFit = evaluateEnterpriseLocationSynergy(business, effectiveDistrictIntel, {
      locationType: effectiveLocationQuery?.locationType,
      villageOrTown: effectiveLocationQuery?.villageOrTown,
      subDistrictOrBlock: effectiveLocationQuery?.subDistrictOrBlock
    });
  }

  // Phase 6: Agriculture-Specific Location Analysis
  let agriLocationAnalysis = undefined;
  if (effectiveDistrictIntel) {
    const agri = agriLocationService.analyzeAgriLocation(
      business,
      effectiveDistrictIntel.state,
      effectiveDistrictIntel.district,
      {
        locationType: effectiveLocationQuery?.locationType,
        villageOrTown: effectiveLocationQuery?.villageOrTown,
        subDistrictOrBlock: effectiveLocationQuery?.subDistrictOrBlock
      }
    );
    if (agri) {
      agriLocationAnalysis = agri;
    }
  }

  return {
    business,
    projectCost,
    workingCapital: business.workingCapital.totalWorkingCapital,
    availableCapital,
    financingGap,
    promoterEquityPercent,
    monthlyRevenue,
    monthlyOpex,
    monthlyNetProfit,
    netMargin,
    roi,
    paybackYears,
    breakEvenPercent,
    monthlyEmi,
    dscr,
    affordabilityTier,
    affordabilityReason,
    scaling: evaluateBusinessScaling(business, availableCapital, config),
    locationFit,
    agriLocationAnalysis
  };
}

/**
 * Sorts calculated business plans according to user preference
 */
export function sortBusinessPlans(
  plans: CalculatedBusinessPlan[],
  sortBy: DiscoverySortOption
): CalculatedBusinessPlan[] {
  const sorted = [...plans];
  switch (sortBy) {
    case 'lowest_investment':
      return sorted.sort((a, b) => a.projectCost - b.projectCost);
    case 'highest_profit':
      return sorted.sort((a, b) => b.monthlyNetProfit - a.monthlyNetProfit);
    case 'lowest_gap':
      return sorted.sort((a, b) => a.financingGap - b.financingGap);
    case 'shortest_payback':
      return sorted.sort((a, b) => a.paybackYears - b.paybackYears);
    case 'highest_roi':
      return sorted.sort((a, b) => b.roi - a.roi);
    case 'location_relevance':
      return sorted.sort((a, b) => {
        const scoreA = a.locationFit?.locationScore ?? 50;
        const scoreB = b.locationFit?.locationScore ?? 50;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        // Secondary tiebreaker: highest profit
        return b.monthlyNetProfit - a.monthlyNetProfit;
      });
    default:
      return sorted;
  }
}

/**
 * Core Reusable Discovery Service:
 * discoverBusinessesByBudget(availableCapital, options)
 *
 * Evaluates ALL configured businesses against the user's available capital,
 * performing complete financial modeling and categorizing into 3 strict affordability tiers.
 */
export function discoverBusinessesByBudget(
  availableCapital: number,
  options?: {
    sortBy?: DiscoverySortOption;
    config?: Partial<DiscoveryConfig>;
    businesses?: BusinessTemplate[];
    location?: GisLocationQuery;
  }
): BudgetDiscoveryResult {
  if (availableCapital === undefined || availableCapital === null || typeof availableCapital !== 'number' || isNaN(availableCapital) || availableCapital <= 0) {
    throw new Error('availableCapital is required and must be a positive number.');
  }

  const activeSort: DiscoverySortOption = options?.sortBy || 'lowest_investment';
  const mergedConfig: DiscoveryConfig = {
    ...DEFAULT_DISCOVERY_CONFIG,
    ...(options?.config || {})
  };

  const businessTemplates = options?.businesses || BUSINESS_TEMPLATES;

  // Retrieve district intelligence if location specified
  let districtIntel: DistrictIntelligence | undefined = undefined;
  if (options?.location?.state && options?.location?.district) {
    districtIntel = locationGisService.getDistrictData(options.location.state, options.location.district);
  }

  // 1. Calculate financials for ALL configured businesses
  const evaluatedPlans = businessTemplates.map((template) =>
    calculateBusinessPlanForCapital(template, availableCapital, mergedConfig, options?.location, districtIntel)
  );

  // 2. Separate into the 3 Affordability Tiers (STRICT RULE: Financial Affordability is never overridden by Location)
  const fitsBudget = evaluatedPlans.filter((p) => p.affordabilityTier === 'FITS_BUDGET');
  const limitedFinancing = evaluatedPlans.filter((p) => p.affordabilityTier === 'LIMITED_FINANCING');
  const higherInvestment = evaluatedPlans.filter((p) => p.affordabilityTier === 'HIGHER_INVESTMENT');

  // 3. Sort each tier by the selected criteria
  const sortedFitsBudget = sortBusinessPlans(fitsBudget, activeSort);
  const sortedLimitedFinancing = sortBusinessPlans(limitedFinancing, activeSort);
  const sortedHigherInvestment = sortBusinessPlans(higherInvestment, activeSort);

  return {
    availableCapital,
    totalAnalyzed: evaluatedPlans.length,
    fitsBudget: sortedFitsBudget,
    limitedFinancing: sortedLimitedFinancing,
    higherInvestment: sortedHigherInvestment,
    activeSort,
    location: options?.location,
    counts: {
      fitsBudget: fitsBudget.length,
      limitedFinancing: limitedFinancing.length,
      higherInvestment: higherInvestment.length
    },
    config: {
      maxLeverageMultiple: mergedConfig.maxLeverageMultiple,
      maxManageableDebt: mergedConfig.maxManageableDebt,
      interestRatePercent: mergedConfig.annualInterestRate * 100,
      loanTenureMonths: mergedConfig.loanTenureMonths,
      minPromoterEquityPercent: mergedConfig.minPromoterEquityPercent,
      minViableDscr: mergedConfig.minViableDscr
    }
  };
}
