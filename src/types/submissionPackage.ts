/**
 * Phase 15: Submission Package Generator Types
 * 
 * Strict architectural boundaries:
 * - Information / document preparation tool for bank and government scheme submissions.
 * - Sourced strictly from audited Phase 3-14 outputs.
 * - Zero recalculation of financial metrics, eligibility statuses, or verification states.
 * - Zero artificial scoring (no completenessScore, readinessScore, approvalScore, etc.).
 * - Clearly disclaims approval, sanction, certification, and verification.
 */

import type { FinancialPlan } from './financial.ts';
import type { SchemeMatch } from './scheme.ts';
import type { DistrictIntelligence } from './location.ts';
import type { AgriLocationAnalysis } from './agriLocation.ts';
import type { SchemeReadinessPlan } from './documentReadiness.ts';
import type { DetailedProjectReport } from './dpr.ts';
import type { BusinessPlanAction } from './actionCenter.ts';
import type { ExecutionEvidence } from './executionEvidence.ts';
import type { ExecutionTimelineEvent, PlanHealthSummary } from './executionTimeline.ts';

export type SubmissionPackageType = 'bank_submission' | 'government_scheme_submission';

export type SubmissionPackageStatus =
  | 'draft'
  | 'information_incomplete'
  | 'ready_for_review'
  | 'exported';

export type SubmissionPackageSectionStatus =
  | 'populated'
  | 'incomplete'
  | 'not_applicable';

export type SubmissionPackageSectionSourcePhase =
  | 'phase_3'
  | 'phase_4'
  | 'phase_5'
  | 'phase_6'
  | 'phase_7'
  | 'phase_8'
  | 'phase_9'
  | 'phase_10'
  | 'phase_11'
  | 'phase_12'
  | 'phase_13'
  | 'phase_14'
  | 'user_input';

export interface SubmissionPackageMetric {
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  source?: string;
}

export interface SubmissionPackageTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface SubmissionPackageSection {
  id: string;
  sectionNumber: number;
  title: string;
  subtitle?: string;
  sourcePhase: SubmissionPackageSectionSourcePhase;
  sourceReference: string;
  status: SubmissionPackageSectionStatus;
  included: boolean;
  summary?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  metrics?: SubmissionPackageMetric[];
  tables?: SubmissionPackageTable[];
  notes?: string[];
}

export interface SubmissionPackageCompleteness {
  sectionsTotal: number;
  sectionsPopulated: number;
  sectionsIncomplete: number;
  requiredDocumentsTotal: number;
  requiredDocumentsAvailable: number;
  documentsToPrepare: number;
  documentsNeedingVerification: number;
  missingInformationItems: string[];
  status: SubmissionPackageStatus;
}

export interface SubmissionPackageMetadata {
  packageId: string;
  planId: string;
  packageType: SubmissionPackageType;
  businessId: string;
  businessName: string;
  enterpriseCategory: string;
  promoterName: string;
  promoterSocialCategory: string;
  location: {
    state: string;
    district: string;
    subDistrictOrBlock?: string;
    villageOrTown?: string;
    locationType: 'rural' | 'semi_urban' | 'urban';
  };
  selectedSchemeId?: string;
  selectedSchemeName?: string;
  generatedAt: string;
  snapshotNotice: string;
  version: string;
}

export interface SubmissionPackageFinancialSummary {
  totalProjectCost: number | null;
  fixedAssetsCost: number | null;
  workingCapitalRequirement: number | null;
  availableCapital: number | null;
  financingGap: number | null;
  promoterContribution: number | null;
  bankTermLoanRequired: number | null;
  monthlyRevenue: number | null;
  monthlyOperatingExpenses: number | null;
  monthlyNetProfit: number | null;
  estimatedMonthlyEmi: number | null;
  debtServiceCoverageRatio: number | null;
  breakEvenSalesPercent: number | null;
  paybackPeriodYears: number | null;
}

export interface SubmissionPackageUserInputs {
  applicantStatement?: string;
  businessDescription?: string;
  coverNote?: string;
  targetInstitutionName?: string;
  targetBranchName?: string;
  institutionalContactPerson?: string;
  institutionalDesignation?: string;
  packageNotes?: string;
  submissionChecklistNotes?: string;
}

export interface SubmissionPackageDisclaimer {
  id: string;
  title: string;
  text: string;
}

export interface SubmissionPackage {
  metadata: SubmissionPackageMetadata;
  status: SubmissionPackageStatus;
  completeness: SubmissionPackageCompleteness;
  financialSummary: SubmissionPackageFinancialSummary;
  userInputs: SubmissionPackageUserInputs;
  sections: SubmissionPackageSection[];
  disclaimers: SubmissionPackageDisclaimer[];
}

export interface GenerateSubmissionPackageParams {
  packageType: SubmissionPackageType;
  planId: string;
  business: {
    id: string;
    name: string;
    category: string;
    description?: string;
    defaultScale?: string;
    unit?: string;
  };
  promoterProfile: {
    name: string;
    socialCategory: string;
    isRural: boolean;
  };
  location: {
    state: string;
    district: string;
    subDistrictOrBlock?: string;
    villageOrTown?: string;
    locationType: 'rural' | 'semi_urban' | 'urban';
  };
  financialPlan?: FinancialPlan | null;
  districtData?: DistrictIntelligence | null;
  agriLocationAnalysis?: AgriLocationAnalysis | null;
  matchedSchemes?: SchemeMatch[];
  selectedSchemeId?: string;
  readinessPlan?: SchemeReadinessPlan | null;
  dpr?: DetailedProjectReport | null;
  actions?: BusinessPlanAction[];
  evidence?: ExecutionEvidence[];
  timelineEvents?: ExecutionTimelineEvent[];
  planHealth?: PlanHealthSummary | null;
  userInputs?: SubmissionPackageUserInputs;
}

export const SUBMISSION_PACKAGE_DISCLAIMERS: SubmissionPackageDisclaimer[] = [
  {
    id: 'disc_information_nature',
    title: 'Informational Preparation Aid',
    text: 'This submission package is an informational preparation tool compiled using data recorded in GramUdyam. It does not constitute a loan approval, credit sanction, subsidy guarantee, legal filing, government certification, or statutory compliance verification.'
  },
  {
    id: 'disc_promoter_evidence',
    title: 'User-Recorded Information & Evidence',
    text: 'All promoter declarations, documents checklist markings, and execution evidence records are user-recorded inputs. GramUdyam has not performed independent KYC verification, site inspection, supplier confirmation, or legal verification.'
  },
  {
    id: 'disc_scheme_matching',
    title: 'Scheme Applicability & Decision Discretion',
    text: 'Scheme matching is based on published policy guidelines and indicative eligibility criteria. Institutional sanctioning authorities (including DIC, KVIC, NABARD, and designated commercial/cooperative banks) retain sole and unfettered discretion over scheme approvals and subsidy disbursements.'
  },
  {
    id: 'disc_financial_assumptions',
    title: 'Financial Projections & Market Risk',
    text: 'Financial calculations and projections reflect deterministic project models and planning assumptions. Actual operational revenue, expenditure, debt serviceability, and working capital needs are subject to local market dynamics, supply fluctuations, and commercial risks.'
  },
  {
    id: 'disc_authority_verification',
    title: 'Requirement to Confirm with Official Portals & Lenders',
    text: 'Entrepreneurs must verify current guidelines, required formats, interest subvention norms, and physical documentation requirements directly with the designated lending institution, district industry centre, or official government portal prior to formal submission.'
  }
];
