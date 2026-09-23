/**
 * Phase 7: Government Scheme & Loan Matching Data Types
 * Strict constraints:
 * - NO single aggregate scheme score / ranking
 * - Explicit evidence provenance
 * - Explicit eligibility conditions (met, unmet, unknown)
 * - Transparent financial fit against documented limits
 */

export type SchemeLevel = 'central' | 'state';

export type SchemeType =
  | 'loan'
  | 'subsidy'
  | 'credit_guarantee'
  | 'grant'
  | 'interest_subvention'
  | 'mixed_support'
  | 'other';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'needs_verification';

export type SchemeEligibilityStatus =
  | 'eligible'
  | 'potentially_eligible'
  | 'not_eligible'
  | 'needs_verification';

export interface SchemeEvidence {
  field: string;
  value: string | number | boolean | null;
  sourceName: string;
  sourceUrl: string;
  accessedDate: string;
  geographicLevel: 'central' | 'state';
}

export interface SchemeEligibilityCriteria {
  minimumAge?: number | null;
  maximumAge?: number | null;
  gender?: ('female' | 'male' | 'other' | string)[] | null;
  socialCategory?: ('general' | 'obc' | 'sc' | 'st' | 'minority' | string)[] | null;
  ruralRequirement?: boolean | null; // true = strictly rural, false = strictly urban, null = both eligible
  urbanRequirement?: boolean | null;
  incomeLimit?: number | null; // INR per annum
  incomeLimitDescription?: string | null;
  businessStage?: ('new' | 'existing')[] | null;
  educationalRequirement?: string | null;
  requiresFarmerStatus?: boolean | null;
  stateResidencyRequired?: boolean | null;
  otherConditions: string[];
}

export interface SchemeFinancialSupport {
  minimumLoan?: number | null;
  maximumLoan?: number | null;
  subsidyPercentage?: number | null;
  subsidyAmount?: number | null;
  interestRate?: number | null; // e.g. 7.5 (%)
  interestSubventionPercent?: number | null; // e.g. 3 (%)
  beneficiaryContributionGeneralPercent?: number | null;
  beneficiaryContributionSpecialPercent?: number | null;
  repaymentPeriodMonths?: number | null;
  moratoriumMonths?: number | null;
  guaranteeCoverage?: string | null;
  description: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  shortName?: string;
  code?: string;
  level: SchemeLevel;
  state?: string; // Applicable state name if level === 'state'
  schemeType: SchemeType;
  administeringAuthority: string;
  ministry?: string;
  description: string;

  // Applicability
  applicableBusinessIds: string[]; // List of business template IDs, or ['all'] for general
  applicableBusinessCategories?: string[]; // e.g. ['Manufacturing', 'Food Processing', 'Agriculture & Farming']
  targetBeneficiaryCategories?: string[]; // e.g. ['Women Entrepreneurs', 'SC/ST', 'Rural Youth', 'Farmers']

  eligibility: SchemeEligibilityCriteria;
  financialSupport: SchemeFinancialSupport;
  requiredDocuments: string[];
  applicationProcess: string[];

  // Verified Sources & URLs
  officialInformationUrl: string;
  officialApplicationUrl?: string | null;
  evidence: SchemeEvidence[];
  verificationStatus: VerificationStatus;
  lastVerifiedDate: string;
}

// -----------------------------------------------------------------------------
// USER INPUT PROFILE
// -----------------------------------------------------------------------------

export interface EntrepreneurProfile {
  age?: number;
  gender?: 'female' | 'male' | 'other' | string;
  socialCategory?: 'general' | 'obc' | 'sc' | 'st' | 'minority' | string;
  annualIncome?: number;
  educationLevel?: 'below_8th' | '8th_pass' | '10th_pass' | '12th_pass' | 'graduate_plus' | string;
  isNewBusiness?: boolean;
  isExistingBusiness?: boolean;
  isFarmer?: boolean;
  isWomanEntrepreneur?: boolean;
  isYouth?: boolean;
  isRuralEntrepreneur?: boolean;
}

export interface SchemeMatchingInput {
  businessId: string;
  availableCapital: number;
  projectCost: number;
  financingGap: number;
  location: {
    state: string;
    district?: string;
    ruralUrban?: 'rural' | 'semi_urban' | 'urban';
  };
  entrepreneurProfile?: EntrepreneurProfile;
}

// -----------------------------------------------------------------------------
// MATCH RESULT TYPES
// -----------------------------------------------------------------------------

export interface SchemeFinancialFit {
  projectCost: number;
  availableCapital: number;
  financingGap: number;
  documentedMinimumLoan?: number | null;
  documentedMaximumLoan?: number | null;
  fitsDocumentedRange: boolean | null; // null if limit unknown / needs verification
  explanation: string;
}

export interface SchemeMatch {
  scheme: GovernmentScheme;
  status: SchemeEligibilityStatus;
  statusCategory:
    | 'eligible'
    | 'potentially_eligible'
    | 'needs_verification'
    | 'not_eligible';

  matchedConditions: string[];
  unmetConditions: string[];
  unknownConditions: string[];

  whyMatched: string[];
  whyNotMatched: string[];
  missingInformation: string[];

  financialFit: SchemeFinancialFit;
  requiredDocuments: string[];
  verificationSteps: string[];

  officialInformationUrl: string;
  officialApplicationUrl?: string | null;
  lastVerifiedDate: string;
}

export interface SchemeMatchingResult {
  businessId: string;
  businessName: string;
  financingRequirement: {
    projectCost: number;
    availableCapital: number;
    financingGap: number;
  };
  location: {
    state: string;
    district?: string;
    ruralUrban?: 'rural' | 'semi_urban' | 'urban';
  };
  entrepreneurProfile: EntrepreneurProfile;
  totalEvaluated: number;
  matches: SchemeMatch[];
  categorized: {
    eligible: SchemeMatch[];
    potentiallyEligible: SchemeMatch[];
    needsVerification: SchemeMatch[];
    notEligible: SchemeMatch[];
  };
  disclosure: string;
}
