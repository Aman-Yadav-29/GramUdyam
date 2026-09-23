import { AffordabilityTier } from './business.ts';

export interface CapexBreakdown {
  landAndSiteDevelopment: number;
  buildingAndCivilWorks: number;
  plantAndMachinery: number;
  electrificationAndUtilities: number;
  preOperativeExpenses: number;
  contingencies: number;
  totalCapex: number;
}

export interface OpexMonthlyBreakdown {
  rawMaterials: number;
  laborAndWages: number;
  utilitiesAndPower: number;
  packagingAndTransport: number;
  marketingAndAdmin: number;
  totalMonthlyOpex: number;
}

export type FinancialScenarioType = 'conservative' | 'base' | 'optimistic';

export interface ScenarioProjection {
  scenario: FinancialScenarioType;
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  netMarginPercent: number;
  annualRevenue: number;
  annualOpex: number;
  annualNetProfit: number;
  annualNetCashFlow: number;
  roiPercent: number;
  paybackPeriodYears: number;
  breakEvenSalesPercent: number;
  breakEvenMonthlyRevenue: number;
  debtServiceCoverageRatio: number | null;
  monthlyEmi: number;
}

export interface MultiScenarioProjections {
  conservative: ScenarioProjection;
  base: ScenarioProjection;
  optimistic: ScenarioProjection;
}

export interface MonthlyCashFlowPoint {
  month: number;
  grossRevenue: number;
  operatingExpenses: number;
  operatingCashFlow: number;
  debtServiceEmi: number;
  netCashSurplus: number;
  cumulativeCashBalance: number;
}

export interface AnnualCashFlowPoint {
  year: number;
  grossRevenue: number;
  operatingExpenses: number;
  depreciation: number;
  interest: number;
  netProfit: number;
  operatingCashFlow: number;
  debtService: number;
  netSurplus: number;
  cumulativeCashBalance: number;
}

export interface CashFlowProjection {
  year1Monthly: MonthlyCashFlowPoint[];
  threeYearAnnual: AnnualCashFlowPoint[];
}

export interface ScalingRecommendation {
  isScalable: boolean;
  canScaleToBudget: boolean;
  unitName: string;
  standardScaleUnits: number;
  standardScaleLabel: string;
  suggestedScaleUnits: number;
  suggestedScaleLabel: string;
  stepUnits: number;
  minViableUnits: number;
  minViableScaleLabel: string;
  
  // Costs at suggested scale
  estimatedFixedAssets: number;
  estimatedWorkingCapital: number;
  estimatedTotalProjectCost: number; // CapEx + Working Capital Requirement
  
  // Affordability metrics at suggested scale
  availableCapital: number;
  financingGap: number; // estimatedTotalProjectCost - availableCapital
  affordabilityTier: AffordabilityTier;
  affordabilityReason: string;
  
  // Operational output at suggested scale
  monthlyRevenue: number;
  monthlyNetProfit: number;
  scalingRatio: number; // suggestedUnits / standardUnits
}

export interface FinancialPlan {
  // Core project costs
  startupCost: number; // Pre-operative & launch expenses
  fixedAssetsCost: number; // Total CapEx
  workingCapitalRequirement: number; // Total working capital
  totalProjectCost: number; // CapEx + Working Capital Requirement
  
  // Financing & Gap
  availableCapital: number;
  promoterContribution: number; // Equity margin
  promoterContributionPercent: number;
  financingGap: number; // Total Project Cost - Available Capital
  eligibleSubsidyEstimate: number; // From PMEGP, PMFME, etc.
  bankTermLoanRequired: number;
  workingCapitalBankLoan: number;
  
  // Monthly Operational Figures
  monthlyRevenue: number;
  monthlyOperatingExpenses: number;
  monthlyOpexBreakdown: OpexMonthlyBreakdown;
  monthlyDepreciation: number;
  monthlyInterest: number;
  monthlyEmi: number;
  monthlyNetProfit: number;
  netMarginPercent: number;
  
  // Annualized Metrics
  annualTurnoverYear1: number;
  annualOperatingCostYear1: number;
  annualEbitda: number;
  interestExpenseYear1: number;
  depreciationYear1: number;
  profitBeforeTax: number;
  taxEstimate: number;
  profitAfterTax: number;
  
  // Solvency & Feasibility Ratios
  debtServiceCoverageRatio: number; // DSCR
  breakEvenSalesPercent: number; // % capacity utilization
  breakEvenMonthlyRevenue: number;
  paybackPeriodYears: number;
  returnOnInvestmentPercent: number;
  
  // Cash Flow & Scenarios
  cashFlow: CashFlowProjection;
  scenarios: MultiScenarioProjections;
  scaling?: ScalingRecommendation;
}

export interface FinancialPlanInput {
  enterpriseId: string;
  capitalAvailable: number;
  promoterCategory: 'general' | 'special'; // Special = SC/ST/OBC/Women/NER/Border
  locationType: 'rural' | 'urban';
  state: string;
  district: string;
  scenario?: FinancialScenarioType;
  customScaleUnits?: number;
}
