import { ScalingRecommendation, MultiScenarioProjections } from './financial.ts';
import { LocationFitAssessment, GisLocationQuery } from './location.ts';

export type IndustryCategory = 
  | 'agro_processing'
  | 'manufacturing'
  | 'dairy_livestock'
  | 'renewable_energy'
  | 'rural_services'
  | 'textiles_handicrafts'
  | 'retail_logistics';

export type AffordabilityTier = 'FITS_BUDGET' | 'LIMITED_FINANCING' | 'HIGHER_INVESTMENT';

export type DiscoverySortOption = 
  | 'lowest_investment'
  | 'highest_profit'
  | 'lowest_gap'
  | 'shortest_payback'
  | 'highest_roi'
  | 'location_relevance';

/**
 * Structured Business Template
 * Fully parameterized with real financial, equipment, infrastructure,
 * operational costs and price assumptions.
 */
export interface BusinessTemplate {
  id: string;
  name: string;
  category: IndustryCategory;
  tagline: string;
  description: string;
  
  // Scale & Units
  minimumViableScale: string;
  defaultScale: string;
  unit: string;
  
  // Fixed Assets breakdown
  fixedAssets: {
    equipmentCost: number;
    infrastructureCost: number;
    preOperativeCost: number;
    totalFixedAssets: number;
  };

  // Detailed Equipment list
  equipment: Array<{
    name: string;
    spec: string;
    approxCost: number;
  }>;

  // Infrastructure / Shed / Civil requirement
  infrastructure: {
    spaceRequiredSqFt: number;
    shedType: string;
    powerHpRequired: number;
    waterRequirement: string;
  };

  // Working Capital Cycle
  workingCapital: {
    cycleMonths: number; // e.g. 1.5 to 2 months
    rawMaterialReserve: number;
    cashContingency: number;
    totalWorkingCapital: number;
  };

  // Operating Costs (Monthly)
  operatingCosts: {
    rawMaterialsMonthly: number;
    laborAndWagesMonthly: number;
    utilitiesAndPowerMonthly: number;
    repairAndMaintenanceMonthly: number;
    freightAndLogisticsMonthly: number;
    totalMonthlyOpex: number;
  };

  // Output & Revenue Assumptions
  expectedOutputMonthly: number; // in unit
  priceAssumptions: {
    unitSellingPrice: number; // in INR
    unitRawMaterialCost: number;
  };
  revenueAssumptions: {
    expectedMonthlyRevenue: number;
    capacityUtilizationPercent: number;
    assumedMarginBasis: string;
  };

  // Qualitative / Viability tags
  gestationPeriodMonths: number;
  typicalRiskLevel: 'low' | 'moderate' | 'high';
  keyRawMaterials: string[];
  eligibleSchemes: string[];
}

/**
 * Computed financial discovery result for an individual business
 * dynamically calculated against the user's availableCapital.
 */
export interface CalculatedBusinessPlan {
  business: BusinessTemplate;

  // Core calculated metrics
  projectCost: number;
  workingCapital: number;
  availableCapital: number;
  financingGap: number;
  promoterEquityPercent: number;

  // Monthly financials
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  netMargin: number; // percentage (e.g. 18.5)

  // Returns & Amortization
  roi: number; // annualized return on investment (%)
  paybackYears: number; // years to recoup project cost
  breakEvenPercent: number; // % capacity utilization
  monthlyEmi: number; // EMI if financing gap > 0
  dscr: number | null; // Debt Service Coverage Ratio

  // Affordability Classification
  affordabilityTier: AffordabilityTier;
  affordabilityReason: string;

  // Phase 4: Business Scaling & Multi-Scenario Projections
  scaling?: ScalingRecommendation;
  scenarios?: MultiScenarioProjections;

  // Phase 5: Location Intelligence & GIS Fit Assessment
  locationFit?: LocationFitAssessment;
}

export interface BudgetDiscoveryResult {
  availableCapital: number;
  totalAnalyzed: number;
  fitsBudget: CalculatedBusinessPlan[];
  limitedFinancing: CalculatedBusinessPlan[];
  higherInvestment: CalculatedBusinessPlan[];
  activeSort: DiscoverySortOption;
  location?: GisLocationQuery;
  counts: {
    fitsBudget: number;
    limitedFinancing: number;
    higherInvestment: number;
  };
  config: {
    maxLeverageMultiple: number;
    maxManageableDebt: number;
    interestRatePercent: number;
    loanTenureMonths: number;
    minPromoterEquityPercent?: number;
    minViableDscr?: number;
  };
}

// Backward compatibility with Phase 1 types
export type EnterpriseIdea = BusinessTemplate & {
  minCapitalRequired: number;
  recommendedCapital: number;
  expectedAnnualTurnover: number;
  estimatedNetMarginPercent: number;
  spaceRequiredSqFt: number;
  powerRequiredHp: number;
  suitableLocations: string[];
  keyMachinery?: string[];
};

export interface BusinessDiscoveryQuery {
  availableCapital?: number;
  capitalAvailable?: number;
  sortBy?: DiscoverySortOption;
  preferredCategory?: IndustryCategory;
  state?: string;
  district?: string;
  locationType?: 'rural' | 'semi_urban' | 'urban';
}

export interface DiscoveryResult {
  enterprises: EnterpriseIdea[];
  totalMatches: number;
  summary: {
    capitalBracket: string;
    locationContext: string;
    schemesCount: number;
  };
}
