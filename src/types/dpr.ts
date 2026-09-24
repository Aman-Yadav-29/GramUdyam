/**
 * DPR (Detailed Project Report) & Comprehensive Business Plan Types
 * 
 * Strict architectural guidelines:
 * - 25 Standardized DPR Sections required for bank credit appraisal and government scheme filings.
 * - ALL financial numbers must come from the deterministic financial engine (Phase 4).
 * - Zero independently invented financial figures.
 * - Suitable for structured on-screen viewing, tabbed navigation, and future exports (HTML, Text, Print/PDF).
 */

export type DprSectionKey =
  | 'executiveSummary'
  | 'businessIdea'
  | 'location'
  | 'localMarketAnalysis'
  | 'businessModel'
  | 'productsServices'
  | 'infrastructure'
  | 'equipment'
  | 'rawMaterials'
  | 'labour'
  | 'startupCost'
  | 'workingCapital'
  | 'monthlyExpenses'
  | 'revenueProjection'
  | 'profitProjection'
  | 'breakEven'
  | 'financingRequirement'
  | 'governmentSchemes'
  | 'loanOptions'
  | 'eligibility'
  | 'documents'
  | 'risks'
  | 'mitigation'
  | 'timeline'
  | 'nextSteps';

export type DprSectionCategory =
  | 'executive'
  | 'strategy'
  | 'location'
  | 'technical'
  | 'financial'
  | 'financing'
  | 'compliance'
  | 'risk'
  | 'execution';

export interface DprMetric {
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  highlight?: boolean;
  source?: string;
}

export interface DprTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  columnAlignments?: ('left' | 'right' | 'center')[];
  footers?: (string | number)[];
  notes?: string;
}

export interface DprSectionItem {
  sectionNumber: number; // 1 to 25
  key: DprSectionKey;
  id: string;
  title: string;        // e.g. "1. Executive Summary"
  shortTitle: string;   // e.g. "Executive Summary"
  category: DprSectionCategory;
  categoryLabel: string;
  subtitle: string;
  summary: string;
  paragraphs: string[];
  bulletPoints?: string[];
  metrics?: DprMetric[];
  tables?: DprTable[];
  notes?: string[];
  sourceOfTruth: string;
}

export interface DprMetadata {
  reportId: string;
  projectTitle: string;
  enterpriseId: string;
  enterpriseCategory: string;
  scale: string;
  unit: string;
  promoterName: string;
  promoterCategory: string;
  location: {
    state: string;
    district: string;
    subDistrictOrBlock?: string;
    villageOrTown?: string;
    locationType: 'rural' | 'semi_urban' | 'urban';
  };
  generatedAt: string;
  version: string;
}

export interface DprFinancialSummary {
  totalProjectCost: number;
  fixedAssetsCost: number;
  workingCapitalRequirement: number;
  availableCapital: number;
  promoterContribution: number;
  promoterContributionPercent: number;
  financingGap: number;
  bankTermLoanRequired: number;
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
  annualTurnoverYear1: number;
  annualNetProfitYear1: number;
  debtServiceCoverageRatio: number | null;
  breakEvenCapacityPercent: number | null;
  breakEvenMonthlyRevenue: number | null;
  paybackYears: number;
  netMarginPercent: number;
  returnOnInvestmentPercent: number;
  estimatedMonthlyEmi: number | null;
}

export interface DetailedProjectReport {
  id: string;
  version: string;
  generatedAt: string;
  metadata: DprMetadata;
  financialSummary: DprFinancialSummary;
  sections: DprSectionItem[]; // Ordered 1 to 25
  sectionMap: Record<DprSectionKey, DprSectionItem>;
  disclosures: Array<{
    id: string;
    title: string;
    text: string;
  }>;
}

// Backward compatibility alias
export type DprSection = DprSectionItem;
