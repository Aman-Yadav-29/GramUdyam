/**
 * Phase 9: Business & Financing Plan Types
 * 
 * Strict architectural rules:
 * - Pure consolidation / orchestration layer.
 * - Zero recalculation of Phase 4 financial metrics (project cost, gap, DSCR, EMI, profit).
 * - Zero aggregate scoring (no "plan score", "business score", "approval probability").
 * - Clear segregation between source-derived immutable figures and user-editable narrative.
 */

import { FinancialPlan, FinancialScenarioType } from './financial.ts';
import { SchemeMatch } from './scheme.ts';
import { AgriLocationAnalysis } from './agriLocation.ts';
import { DistrictIntelligence } from './location.ts';
import { SchemeReadinessPlan } from './documentReadiness.ts';

export interface PlanAssumption {
  category: 'financial' | 'location' | 'scheme' | 'operational';
  title: string;
  description: string;
  sourceOfTruth: string;
}

export interface PlanDisclosure {
  id: 'financial' | 'scheme' | 'location' | 'documents' | 'agriculture' | 'plan';
  title: string;
  text: string;
  mandatory: boolean;
}

export interface BusinessPlanBusinessSection {
  businessId: string;
  businessName: string;
  businessCategory: string;
  businessType: string;
  proposedScale: string;
  unit: string;
  availableCapital: number;
  selectedLocation: string;
  factualDescription: string;
  primaryInputs: string[];
  primaryOutput: string;
  majorEquipment: string[];
  infrastructureRequirements: string;
  workingCapitalRequirement: number;
  fixedAssetsCost: number;
}

export interface EntrepreneurPlanSection {
  age?: number;
  gender?: string;
  socialCategory?: string;
  isFarmer?: boolean;
  isRural?: boolean;
  isNewBusiness?: boolean;
  hasDeclaredDetails: boolean;
}

export interface BusinessPlanLocationSection {
  state: string;
  district: string;
  subDistrictOrBlock?: string;
  villageOrTown?: string;
  locationType: 'rural' | 'semi_urban' | 'urban';
  resolution: string;
  marketCatchmentInfo?: string;
  powerAvailabilityHours?: number;
  roadConnectivityRating?: string;
  benchmarkDisclosure: string;
  isCalibratedDistrict: boolean;
}

export interface BusinessPlanAgricultureSection {
  applicable: boolean;
  businessKind?: string;
  whyMaySuit: string[];
  whyMayNotSuit: string[];
  unknownFactors: string[];
  priorityVerificationSteps: string[];
  scoreDisclosure: string;
}

export interface BusinessPlanFinancialSection {
  totalProjectCost: number;
  fixedAssetsCost: number;
  workingCapitalRequirement: number;
  workingCapital?: number;
  availableCapital: number;
  promoterContribution: number;
  financingGap: number;
  bankTermLoanRequired: number;
  bankTermLoan?: number;
  workingCapitalBankLoan: number;
  monthlyRevenue: number;
  annualRevenueYear1: number;
  monthlyOpex: number;
  annualOperatingCostYear1: number;
  monthlyNetProfit: number;
  annualNetProfitYear1: number;
  estimatedMonthlyEmi: number | null;
  monthlyEmi?: number | null;
  debtServiceCoverageRatio: number | null;
  breakEvenCapacityPercent: number | null;
  affordabilityClassification: string;
  affordabilityReason?: string;
  paybackYears: number;
  netMarginPercent: number;
  plainLanguageInterpretation: string;
}

export interface BusinessPlanScenarioSection {
  scenario: FinancialScenarioType;
  label: string;
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  estimatedEmi: number | null;
  assumptions: string;
}

export interface BusinessPlanProjectionsSection {
  cashFlow12Months: Array<{
    month: number;
    inflow: number;
    outflow: number;
    netCashFlow: number;
    cumulativeCash: number;
  }>;
  threeYearSummary: Array<{
    year: number;
    annualRevenue: number;
    annualOpex: number;
    annualNetProfit: number;
  }>;
}

export interface PotentialFinancingOption {
  schemeOrLoanName: string;
  authorityOrBank: string;
  type: 'subsidy' | 'bank_loan' | 'mixed_support';
  maxDocumentedLimit?: number | null;
  interestRateOrSubsidy?: string;
  statusNote: string;
  officialUrl?: string | null;
}

export interface BusinessPlanFinancingSection {
  totalProjectCost: number;
  availableCapital: number;
  financingGap: number;
  formulaText: string;
  advisoryNote: string;
  potentialOptions: PotentialFinancingOption[];
}

export interface BusinessPlanSchemeSection {
  schemeId: string;
  schemeName: string;
  administeringAuthority: string;
  eligibilityStatus: 'eligible' | 'potentially_eligible' | 'not_eligible' | 'needs_verification';
  whyMatched: string[];
  unmetConditions: string[];
  unknownConditions: string[];
  financialSupportDescription: string;
  officialInformationUrl: string;
  officialApplicationUrl?: string | null;
}

export interface BusinessPlanDocumentSection {
  selectedSchemeId?: string;
  selectedSchemeName?: string;
  summary: {
    totalRequired: number;
    markedAvailable: number;
    needToPrepare: number;
    needVerification: number;
  };
  documents: Array<{
    id: string;
    name: string;
    category: string;
    mandatory: boolean;
    userStatus: string;
    reason: string;
    verificationNote?: string;
  }>;
  checklistLinkText: string;
}

export type ImplementationStepCategory =
  | 'planning_guidance'
  | 'site_operational'
  | 'scheme_documented_process';

export interface ImplementationStep {
  stepNumber: number;
  title: string;
  category: ImplementationStepCategory;
  categoryLabel: string;
  evidenceSource: string;
  description: string;
  actionItem: string;
  ownerOrAgency: string;
}

export interface ImplementationPlanSection {
  steps: ImplementationStep[];
  disclaimer: string;
}

export interface BusinessPlanNarrativeSection {
  businessObjectives?: string;
  targetCustomersAndMarket?: string;
  operationalNotes?: string;
  promoterRemarks?: string;
  lastEditedAt?: string;
}

export interface BusinessPlan {
  id: string;
  version: string;
  generatedAt: string;
  business: BusinessPlanBusinessSection;
  entrepreneur?: EntrepreneurPlanSection;
  location?: BusinessPlanLocationSection;
  agricultureAnalysis?: BusinessPlanAgricultureSection;
  financials: BusinessPlanFinancialSection;
  scenarios?: BusinessPlanScenarioSection[];
  projections?: BusinessPlanProjectionsSection;
  financing: BusinessPlanFinancingSection;
  schemes?: BusinessPlanSchemeSection[];
  documentReadiness?: BusinessPlanDocumentSection;
  implementationPlan: ImplementationPlanSection;
  narrative?: BusinessPlanNarrativeSection;
  assumptions: PlanAssumption[];
  disclosures: PlanDisclosure[];
}

export interface SavedBusinessPlanRecord {
  id: string;
  userId?: string;
  isGuest: boolean;
  businessId: string;
  businessName: string;
  projectCost: number;
  availableCapital: number;
  financingGap: number;
  state: string;
  district: string;
  plan: BusinessPlan;
  createdAt: string;
  updatedAt: string;
  title?: string;
  status?: 'active' | 'archived';
  planVersion?: string;
  narrativeEditable?: boolean;
  shareSettings?: {
    isShared: boolean;
    shareToken?: string;
    sharedAt?: string;
  };
}
