export type SchemeLevel = 'central' | 'state' | 'joint';

export interface GovernmentScheme {
  id: string;
  code: string; // e.g. "PMEGP", "PMFME", "MUDRA", "AIF", "STANDUP_INDIA"
  name: string;
  ministry: string;
  schemeLevel: SchemeLevel;
  maxProjectCost: number; // in INR
  maxSubsidyAmount: number;
  subsidyPercentGeneralRural: number;
  subsidyPercentGeneralUrban: number;
  subsidyPercentSpecialRural: number;
  subsidyPercentSpecialUrban: number;
  beneficiaryContributionPercentGeneral: number;
  beneficiaryContributionPercentSpecial: number;
  eligibleActivities: string[];
  ineligibleActivities: string[];
  keyEligibilityCriteria: string[];
  portalUrl: string;
  nodalAgency: string;
  description: string;
}

export interface SchemeCalculationRequest {
  schemeCode: string;
  projectCost: number;
  promoterCategory: 'general' | 'special';
  locationType: 'rural' | 'urban';
  activityType: 'manufacturing' | 'service' | 'trading' | 'food_processing';
}

export interface SchemeCalculationResult {
  scheme: GovernmentScheme;
  eligible: boolean;
  ineligibilityReasons?: string[];
  projectCostConsidered: number;
  promoterContributionAmount: number;
  promoterContributionPercent: number;
  subsidyAmount: number;
  subsidyPercent: number;
  bankLoanAmount: number;
  effectiveSubsidyType: 'credit_linked_back_ended' | 'front_ended' | 'interest_subvention';
}
