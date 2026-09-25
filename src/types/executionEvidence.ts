/**
 * Phase 13: Execution Evidence & Progress Record Types
 * 
 * Strict architectural boundaries:
 * - ADDITIVE ONLY to Action Center & Business Plan monitoring.
 * - Factual execution record-keeping and progress tracking.
 * - Explicit non-verification: User-recorded evidence is NEVER treated as
 *   official government, bank, statutory, or third-party verification.
 * - Does NOT alter upstream calculation formulas, scheme eligibility, or financial models.
 */

export type EvidenceType =
  | 'note'
  | 'quotation'
  | 'application_reference'
  | 'meeting_record'
  | 'site_verification'
  | 'document_submission'
  | 'purchase_record'
  | 'inspection_record'
  | 'photo_reference'
  | 'other';

export type EvidenceSource =
  | 'user_recorded'
  | 'system_generated';

export type EvidenceVerificationStatus =
  | 'user_recorded'
  | 'needs_official_verification';

export interface ExecutionEvidence {
  id: string;
  actionId: string;
  planId: string;

  type: EvidenceType;
  title: string;
  description: string;

  referenceNumber?: string;
  eventDate?: string;

  source: EvidenceSource;
  verificationStatus: EvidenceVerificationStatus;
  disclaimer: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateEvidenceInput {
  actionId: string;
  planId: string;
  type: EvidenceType;
  title: string;
  description: string;
  referenceNumber?: string;
  eventDate?: string;
}

export interface UpdateEvidenceInput {
  type?: EvidenceType;
  title?: string;
  description?: string;
  referenceNumber?: string;
  eventDate?: string;
}

export const EVIDENCE_USER_DISCLAIMER =
  'User-recorded evidence — not independently verified. This record does not constitute government, bank, statutory, or third-party verification.';

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  note: 'General Note',
  quotation: 'Quotation / Estimate',
  application_reference: 'Application Reference',
  meeting_record: 'Meeting Record',
  site_verification: 'Site Verification',
  document_submission: 'Document Submission',
  purchase_record: 'Purchase Record',
  inspection_record: 'Inspection Record',
  photo_reference: 'Photo Reference',
  other: 'Other Record'
};

export const EVIDENCE_TYPE_DESCRIPTIONS: Record<EvidenceType, string> = {
  note: 'General execution update or administrative progress note.',
  quotation: 'Supplier quotation or equipment price estimate received.',
  application_reference: 'Official portal application or acknowledgement number.',
  meeting_record: 'Discussion record with bank, DIC, local authority, or vendor.',
  site_verification: 'Factual record of physical premises or utility inspection.',
  document_submission: 'Record of statutory or bank document submission.',
  purchase_record: 'Record of equipment or raw material purchase order.',
  inspection_record: 'Official inspection visit or utility officer field visit.',
  photo_reference: 'Reference to site, machinery, or document photographs.',
  other: 'Other factual execution update or progress notation.'
};
