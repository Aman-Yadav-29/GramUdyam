/**
 * Phase 8: Document Readiness & Application Workflow Data Types
 *
 * Rules:
 * - Readiness assistant, NOT a document verification/KYC system.
 * - No claims of official document verification or approval.
 * - Consumes Phase 7 scheme data without inventing requirements.
 * - Counts only, no approval probability or composite scores.
 */

import type { SchemeEligibilityStatus } from './scheme.ts';

export type DocumentStatus =
  | 'required'
  | 'available'
  | 'missing'
  | 'to_prepare'
  | 'conditional'
  | 'needs_verification'
  | 'not_applicable';

export type UserDocumentDeclaration = 'available' | 'to_prepare' | 'needs_verification';

export type DocumentCategory =
  | 'identity'
  | 'business'
  | 'financial'
  | 'project'
  | 'eligibility'
  | 'property_location'
  | 'other';

export interface DocumentRequirement {
  id: string;
  schemeId: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  initialStatus: 'required' | 'conditional';
  userStatus: DocumentStatus;
  mandatory: boolean;
  reason: string;
  schemeSpecific: boolean;
  officialSource?: string;
  verificationNote?: string;
  preparationSteps?: string[];
}

export interface DocumentReadinessSummary {
  totalRequired: number;
  markedAvailable: number;
  needToPrepare: number;
  needVerification: number;
}

export interface DprFinancialSummary {
  businessName: string;
  businessCategory?: string;
  totalProjectCost: number;
  availableCapital: number;
  financingGap: number;
  fixedAssetsEstimate?: number;
  workingCapitalEstimate?: number;
  monthlyRevenueEstimate?: number;
  monthlyOpexEstimate?: number;
  monthlyNetProfitEstimate?: number;
  estimatedEmi?: number;
  dscr?: number;
  repaymentPeriodMonths?: number;
  formattedText: string;
}

export interface SchemeReadinessPlan {
  schemeId: string;
  schemeName: string;
  shortName?: string;
  administeringAuthority: string;
  ministry?: string;
  level: 'central' | 'state';
  state?: string;
  eligibilityStatus: SchemeEligibilityStatus;
  documents: DocumentRequirement[];
  userDeclarations: Record<string, UserDocumentDeclaration>;
  summary: DocumentReadinessSummary;
  applicationSteps: string[];
  officialInformationUrl: string;
  officialApplicationUrl?: string | null;
  dprFinancialSummary?: DprFinancialSummary;
  lastUpdated: string;
  disclaimer: string;
}

export interface SaveReadinessRequest {
  schemeId: string;
  declarations: Record<string, UserDocumentDeclaration>;
}

export interface SaveReadinessResponse {
  success: boolean;
  schemeId: string;
  summary: DocumentReadinessSummary;
  savedAt: string;
  isGuest: boolean;
}
