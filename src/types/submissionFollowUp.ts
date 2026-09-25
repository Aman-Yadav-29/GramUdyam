/**
 * Phase 16: Submission Tracking & Institutional Follow-Up Types
 * 
 * Strict architectural boundaries:
 * - Factual promoter-tracking ledger for actions/responses after preparing/submitting packages.
 * - Sourced strictly from promoter-recorded entries.
 * - Clearly distinguishes:
 *     A) USER-RECORDED EVENTS
 *     B) SYSTEM-GENERATED DATE REMINDERS
 *     C) ACTUAL INSTITUTIONAL DECISIONS (never claimed by GramUdyam)
 * - ZERO approval/sanction/subsidy prediction or probability.
 * - ZERO credit scoring, lender ranking, or scheme preference.
 * - Preserves Phase 4 financial invariance, Phase 7 scheme invariance, Phase 8 document invariance, Phase 13 evidence semantics, Phase 15 package immutability.
 */

import type { SubmissionPackageType } from './submissionPackage.ts';

export type InstitutionalType =
  | 'bank'
  | 'government_department'
  | 'district_office'
  | 'scheme_authority'
  | 'development_agency'
  | 'other';

export type SubmissionChannel =
  | 'online'
  | 'branch_visit'
  | 'office_visit'
  | 'email'
  | 'postal'
  | 'portal'
  | 'other';

export type InteractionType =
  | 'submission'
  | 'acknowledgement'
  | 'phone_call'
  | 'office_visit'
  | 'email'
  | 'portal_update'
  | 'document_request'
  | 'clarification'
  | 'follow_up'
  | 'response'
  | 'other';

export type FollowUpPromoterStatus =
  | 'planned'
  | 'submitted'
  | 'acknowledgement_recorded'
  | 'follow_up_due'
  | 'follow_up_recorded'
  | 'response_recorded'
  | 'awaiting_response'
  | 'promoter_closed'
  | 'needs_verification';

export interface FollowUpInteractionRecord {
  id: string;
  interactionDate: string; // ISO date YYYY-MM-DD
  interactionType: InteractionType;
  summary: string;
  contactPerson?: string;
  nextStep?: string;
  notes?: string;
  recordedAt: string;
}

export interface SubmissionFollowUpRecord {
  id: string;
  planId: string;
  submissionPackageId?: string;
  packageType?: SubmissionPackageType;
  institutionName: string;
  institutionType: InstitutionalType;
  branchOrOfficeName?: string;
  contactPerson?: string;
  contactDesignation?: string;
  submissionDate?: string; // ISO date YYYY-MM-DD (cannot be future)
  submissionChannel?: SubmissionChannel;
  applicationReference?: string;
  acknowledgementReference?: string;
  acknowledgementDate?: string; // ISO date YYYY-MM-DD (cannot be future)
  followUpDate?: string; // ISO date YYYY-MM-DD (can be future)
  interactionDate?: string; // ISO date YYYY-MM-DD (cannot be future)
  interactionType?: InteractionType;
  responseSummary?: string;
  nextStep?: string;
  promoterStatus: FollowUpPromoterStatus;
  notes?: string;
  linkedEvidenceIds?: string[];
  interactions?: FollowUpInteractionRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionFollowUpInput {
  planId: string;
  submissionPackageId?: string;
  packageType?: SubmissionPackageType;
  institutionName: string;
  institutionType: InstitutionalType;
  branchOrOfficeName?: string;
  contactPerson?: string;
  contactDesignation?: string;
  submissionDate?: string;
  submissionChannel?: SubmissionChannel;
  applicationReference?: string;
  acknowledgementReference?: string;
  acknowledgementDate?: string;
  followUpDate?: string;
  interactionDate?: string;
  interactionType?: InteractionType;
  responseSummary?: string;
  nextStep?: string;
  promoterStatus?: FollowUpPromoterStatus;
  notes?: string;
  linkedEvidenceIds?: string[];
}

export interface UpdateSubmissionFollowUpInput {
  institutionName?: string;
  institutionType?: InstitutionalType;
  branchOrOfficeName?: string;
  contactPerson?: string;
  contactDesignation?: string;
  submissionDate?: string;
  submissionChannel?: SubmissionChannel;
  applicationReference?: string;
  acknowledgementReference?: string;
  acknowledgementDate?: string;
  followUpDate?: string;
  interactionDate?: string;
  interactionType?: InteractionType;
  responseSummary?: string;
  nextStep?: string;
  promoterStatus?: FollowUpPromoterStatus;
  notes?: string;
  linkedEvidenceIds?: string[];
}

export interface SubmissionFollowUpDisclaimer {
  id: string;
  title: string;
  text: string;
}

export const SUBMISSION_FOLLOW_UP_DISCLAIMERS: SubmissionFollowUpDisclaimer[] = [
  {
    id: 'disc_promoter_recorded_followup',
    title: 'Promoter-Recorded Ledger',
    text: 'All submission and follow-up entries are recorded solely by the promoter for organizational tracking. GramUdyam does not independently verify institutional receipt, acknowledgement, processing stage, or response.'
  },
  {
    id: 'disc_no_institutional_approval',
    title: 'Non-Assertion of Official Sanction',
    text: 'Recording an acknowledgement, reference number, or response does not constitute official institutional sanction, credit approval, loan disbursal, or subsidy release.'
  },
  {
    id: 'disc_discretionary_authority',
    title: 'Institutional Discretion',
    text: 'Financial institutions, district industries centres (DIC), and government departments exercise sovereign, independent underwriting and appraisal discretion. GramUdyam has no standing with or representation from any financial institution or government body.'
  },
  {
    id: 'disc_evidence_declaration',
    title: 'Supporting Evidence Status',
    text: 'Referenced evidence files remain promoter-uploaded declarations under Phase 13 semantics (user_recorded). Referencing them does not elevate their legal or verified status.'
  }
];

export interface FollowUpDateReminder {
  recordId: string;
  institutionName: string;
  followUpDate: string;
  status: 'upcoming' | 'due_today' | 'overdue';
  daysDifference: number; // positive = days overdue, negative = days until due
  factualNotice: string;
}
