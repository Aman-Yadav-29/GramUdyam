import { GeographicResolution } from './location.ts';

export type AgriFactorStatus = 'supportive' | 'mixed' | 'concern' | 'unknown';

export type AgriDataLevel = 
  | 'district_benchmark' 
  | 'state_benchmark' 
  | 'local_survey' 
  | 'not_available';

export type AgriVerificationPriority = 'high' | 'medium' | 'routine';

export type AgriBusinessKind =
  | 'dairy'
  | 'poultry'
  | 'goat_farming'
  | 'fish_farming'
  | 'mushroom_farming'
  | 'vegetable_cultivation'
  | 'fruit_cultivation'
  | 'floriculture'
  | 'beekeeping'
  | 'vermicomposting'
  | 'other_agri';

export type AgriFactorType =
  // Livestock & Dairy
  | 'livestock_ecosystem'
  | 'livestock_market'
  | 'feed_fodder'
  | 'milk_market'
  | 'collection_network'
  | 'poultry_ecosystem'
  | 'feed_grain'
  // Common Natural Resources
  | 'water'
  | 'groundwater'
  | 'electricity'
  | 'climate'
  | 'temperature'
  | 'rainfall'
  | 'soil'
  | 'irrigation'
  | 'cropping_pattern'
  | 'agri_activity'
  | 'floral_sources'
  | 'aquaculture_suitability'
  | 'substrate_feedstock'
  // Commerce & Logistics
  | 'buyer_market'
  | 'fish_market'
  | 'mandi_access'
  | 'transport'
  | 'storage'
  | 'seasonality';

export interface AgriEvidenceItem {
  label: string;
  value: string | number;
  source: string;
  date: string;
  geographicLevel: GeographicResolution;
  hasCitation: boolean;
}

export interface AgriFactorEvaluation {
  factor: AgriFactorType;
  factorLabel: string;
  status: AgriFactorStatus;
  dataLevel: AgriDataLevel;
  finding: string;
  evidence: AgriEvidenceItem[];
  screeningBasis: string;
  verifyLocally: string;
}

export interface AgriLocalVerificationItem {
  priority: AgriVerificationPriority;
  factor: AgriFactorType;
  factorLabel: string;
  instruction: string;
  practicalAction: string;
}

/**
 * Phase 6 Agriculture-Specific Location Analysis Output.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * - NO numeric aggregate score (no agriScore, agricultureScore, suitabilityScore, agriIndex).
 * - Factor-by-factor, transparent, explainable output.
 * - Missing data results strictly in 'unknown' (unknown !== concern).
 * - Explicit data provenance with geographic resolution ('district').
 * - Financial independence: Does not alter project cost, gap, EMI, or DSCR.
 */
export interface AgriLocationAnalysis {
  isAgriBusiness: boolean;
  businessId: string;
  businessName: string;
  agriBusinessKind: AgriBusinessKind;
  location: {
    state: string;
    district: string;
    subDistrictOrBlock?: string;
    villageOrTown?: string;
  };
  analysisResolution: 'district';
  resolutionDisclosure: string;
  scoreDisclosure: string;
  factors: AgriFactorEvaluation[];
  whyMaySuit: string[];
  whyMayNotSuit: string[];
  whatToVerifyLocally: AgriLocalVerificationItem[];
}
