import { LoanProduct } from './loans.ts';

export type DscrComfortBand = 'comfortable' | 'marginal' | 'high_risk' | 'no_debt';

export interface PromoterMarginAssessment {
  requiredMarginPercent: number;
  requiredMarginAmount: number;
  actualPromoterContribution: number;
  actualMarginPercent: number;
  isCompliant: boolean;
  shortfallAmount: number;
  governingNorm: string;
  complianceNote: string;
}

export interface CreditGuaranteeAssessment {
  schemeName: 'CGFMU' | 'CGTMSE' | 'NCGTC Stand-Up India' | 'None';
  isCollateralFreeEligible: boolean;
  maxEligibleCoveragePercent: number;
  guaranteeFeeBenchmark: string;
  statutoryReference: string;
  coverageCondition: string;
}

export interface BankMatchedLoan {
  product: LoanProduct;
  category: string;
  suggestedLoanAmount: number;
  estimatedMonthlyEmi: number;
  indicativeTenureMonths: number;
  moratoriumMonths: number;
  interestRateRange: string;
  fitRationale: string;
}

export interface BankBranchInterviewPrompt {
  topic: string;
  question: string;
  recommendedResponse: string;
  riskMitigationContext: string;
}

export interface StatutoryClearanceItem {
  id: string;
  name: string;
  authority: string;
  stage: 'pre_sanction' | 'pre_disbursement' | 'post_commercial';
  mandatory: boolean;
  portalUrl?: string;
  citation: string;
  applicabilityNote: string;
}

export interface DisbursementMilestone {
  stageNumber: number;
  milestoneName: string;
  description: string;
  promoterEquitySharePercent: number;
  termLoanSharePercent: number;
  estimatedTrancheAmount: number;
  verificationRequired: string;
}

export interface BankAppraisalDossier {
  id: string;
  generatedAt: string;
  enterpriseId: string;
  enterpriseName: string;
  enterpriseCategory: string;
  location: {
    state: string;
    district: string;
    locationType: 'rural' | 'semi_urban' | 'urban';
  };
  totalProjectCost: number;
  fixedAssetsCost: number;
  workingCapitalRequirement: number;
  availableCapital: number;
  promoterContribution: number;
  bankTermLoanRequired: number;
  financingGap: number;
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  debtServiceCoverageRatio: number | null;
  dscrComfortBand: DscrComfortBand;
  dscrAnalysis: string;
  marginAssessment: PromoterMarginAssessment;
  creditGuarantee: CreditGuaranteeAssessment;
  matchedLoans: BankMatchedLoan[];
  statutoryClearances: StatutoryClearanceItem[];
  interviewPrompts: BankBranchInterviewPrompt[];
  disbursementMilestones: DisbursementMilestone[];
  statutoryDisclaimer: string;
}

export interface BankAppraisalRequest {
  enterpriseId: string;
  enterpriseName: string;
  enterpriseCategory: string;
  totalProjectCost: number;
  fixedAssetsCost: number;
  workingCapitalRequirement: number;
  availableCapital: number;
  promoterContribution: number;
  bankTermLoanRequired: number;
  financingGap: number;
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  debtServiceCoverageRatio: number | null;
  estimatedMonthlyEmi: number;
  breakEvenCapacityPercent: number | null;
  paybackYears: number;
  state: string;
  district: string;
  locationType?: 'rural' | 'semi_urban' | 'urban';
  isWomanOrSpecialCategory?: boolean;
  groundwaterConcern?: boolean;
}
