import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  Save,
  FileText,
  Building2,
  MapPin,
  Sprout,
  Calculator,
  Landmark,
  FileCheck,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Edit3,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  Share2,
  Download,
  ChevronRight,
  CheckSquare
} from 'lucide-react';

import { BusinessPlan, BusinessPlanNarrativeSection } from '../types/businessPlan.ts';
import { formatINR, formatINRLakhs, formatPercent, formatRatio } from '../utils/formatters.ts';
import { SharePlanModal } from './SharePlanModal.tsx';
import { downloadPlanAsHtml, downloadPlanAsText } from '../utils/exportPlan.ts';

interface BusinessPlanViewProps {
  plan: BusinessPlan;
  onNavigateTab?: (tab: string) => void;
  onSavePlan?: (plan: BusinessPlan) => Promise<void>;
  onUpdateNarrative?: (narrative: BusinessPlanNarrativeSection) => Promise<void>;
  isSaving?: boolean;
  isReadOnly?: boolean;
  shareSettings?: {
    isShared: boolean;
    shareToken?: string;
  };
}

export const BusinessPlanView: React.FC<BusinessPlanViewProps> = ({
  plan,
  onNavigateTab,
  onSavePlan,
  onUpdateNarrative,
  isSaving = false,
  isReadOnly = false,
  shareSettings
}) => {
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showProjections, setShowProjections] = useState(false);
  const [isEditingNarrative, setIsEditingNarrative] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Editable narrative local state
  const [narrativeState, setNarrativeState] = useState<BusinessPlanNarrativeSection>({
    businessObjectives: plan.narrative?.businessObjectives || '',
    targetCustomersAndMarket: plan.narrative?.targetCustomersAndMarket || '',
    operationalNotes: plan.narrative?.operationalNotes || '',
    promoterRemarks: plan.narrative?.promoterRemarks || ''
  });

  const handleCopySummary = async () => {
    try {
      const summaryText = [
        `GRAMUDYAM BUSINESS & FINANCING PLAN: ${plan.business.businessName}`,
        `Location: ${plan.business.selectedLocation}`,
        `Scale: ${plan.business.proposedScale}`,
        `--------------------------------------------------`,
        `Total Project Cost: ${formatINR(plan.financials.totalProjectCost)}`,
        `Available Capital: ${formatINR(plan.financials.availableCapital)}`,
        `Financing Gap: ${formatINR(plan.financials.financingGap)}`,
        `Monthly Revenue: ${formatINR(plan.financials.monthlyRevenue)}`,
        `Monthly Net Profit: ${formatINR(plan.financials.monthlyNetProfit)}`,
        `DSCR: ${plan.financials.debtServiceCoverageRatio ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}`,
        `Classification: ${plan.financials.affordabilityClassification}`,
        `--------------------------------------------------`,
        `Matched Schemes: ${plan.schemes?.map((s) => `${s.schemeName} (${s.eligibilityStatus})`).join(', ') || 'None'}`,
        `Document Readiness: ${plan.documentReadiness ? `${plan.documentReadiness.summary.markedAvailable}/${plan.documentReadiness.summary.totalRequired} Available` : 'N/A'}`,
        `--------------------------------------------------`,
        `Generated via GramUdyam for planning and preparation.`
      ].join('\n');

      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSave = async () => {
    if (onSavePlan) {
      await onSavePlan(plan);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleSaveNarrative = async () => {
    if (onUpdateNarrative) {
      await onUpdateNarrative(narrativeState);
    }
    setIsEditingNarrative(false);
  };

  const handleOpenShareModal = async () => {
    if (onSavePlan) {
      try {
        await onSavePlan(plan);
      } catch {
        // Continue even if save errored, modal will show appropriate feedback
      }
    }
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-6">
      {/* 1. Header & Action Ribbon */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-200 pb-6 print:pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-emerald-950">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
                Comprehensive Business & Financing Plan
              </span>
              <span className="text-3xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Version {plan.version}
              </span>
              <span className="text-3xs text-stone-400">
                Generated: {new Date(plan.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
              {plan.business.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-800">{plan.business.businessCategory}</span>
              <span className="text-stone-300">•</span>
              <span>Scale: <strong className="text-emerald-900">{plan.business.proposedScale}</strong></span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1 text-stone-600">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                {plan.business.selectedLocation}
              </span>
            </p>
          </div>

          {/* Action Ribbon (Hidden when printing) */}
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Print Plan or Save as PDF"
            >
              <Printer className="h-4 w-4 text-stone-600" />
              <span>Print Plan</span>
            </button>

            {/* Export HTML / Text */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                title="Export complete plan"
              >
                <Download className="h-4 w-4 text-stone-600" />
                <span>Export Plan</span>
                <ChevronDown className="h-3 w-3 text-stone-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg z-20 text-xs">
                  <button
                    onClick={() => {
                      downloadPlanAsHtml(plan);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition cursor-pointer"
                  >
                    Offline HTML (.html)
                  </button>
                  <button
                    onClick={() => {
                      downloadPlanAsText(plan);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition cursor-pointer"
                  >
                    Structured Text (.txt)
                  </button>
                </div>
              )}
            </div>

            {/* Share Plan */}
            {!isReadOnly && (
              <button
                onClick={handleOpenShareModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                title="Share read-only plan link"
              >
                <Share2 className="h-4 w-4 text-emerald-700" />
                <span>Share Plan</span>
              </button>
            )}

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('dpr')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                title="View Complete 25-Section Detailed Project Report"
              >
                <FileText className="h-4 w-4 text-emerald-800" />
                <span>25-Section DPR</span>
              </button>
            )}

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('loans')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                title="View Bank Credit Appraisal & Lending Feasibility Dossier"
              >
                <Landmark className="h-4 w-4 text-emerald-800" />
                <span>Bank Appraisal</span>
              </button>
            )}

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('roadmap')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                title="View Action Center & Execution Monitoring"
              >
                <CheckSquare className="h-4 w-4 text-emerald-800" />
                <span>Action Center</span>
              </button>
            )}

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-stone-600" />}
              <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
            </button>


            {!isReadOnly && onSavePlan && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span>{saveSuccess ? 'Plan Saved' : isSaving ? 'Saving...' : 'Save Plan'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Jump Navigation (Hidden in print) */}
        {onNavigateTab && (
          <div className="pt-4 flex items-center gap-2 overflow-x-auto text-2xs print:hidden">
            <span className="text-stone-400 font-bold uppercase shrink-0">Jump to section:</span>
            <button
              onClick={() => onNavigateTab('discovery')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer shrink-0"
            >
              Edit Business / Scale
            </button>
            <button
              onClick={() => onNavigateTab('financials')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer shrink-0"
            >
              Financial Engine
            </button>
            <button
              onClick={() => onNavigateTab('location')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer shrink-0"
            >
              Location Analysis
            </button>
            <button
              onClick={() => onNavigateTab('schemes')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer shrink-0"
            >
              Government Schemes
            </button>
            <button
              onClick={() => onNavigateTab('documents')}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition cursor-pointer shrink-0"
            >
              Documents Checklist
            </button>
            <button
              onClick={() => onNavigateTab('loans')}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Landmark className="h-3 w-3" />
              <span>Bank Appraisal Dossier</span>
            </button>

          </div>
        )}
      </div>

      {/* 2. Executive Financial Summary Cards (Phase 4 Invariant Source of Truth) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-3xs font-bold uppercase tracking-wider text-stone-400">Total Project Outlay</span>
          <div className="text-lg sm:text-xl font-extrabold text-stone-900 mt-1">
            {formatINR(plan.financials.totalProjectCost)}
          </div>
          <div className="text-3xs text-stone-500 mt-0.5">CapEx + Working Capital</div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800">Available Equity</span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-950 mt-1">
            {formatINR(plan.financials.availableCapital)}
          </div>
          <div className="text-3xs text-emerald-700 mt-0.5">Promoter Contribution</div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-3xs font-bold uppercase tracking-wider text-amber-800">Financing Gap</span>
          <div className="text-lg sm:text-xl font-extrabold text-amber-950 mt-1">
            {formatINR(plan.financials.financingGap)}
          </div>
          <div className="text-3xs text-stone-500 mt-0.5">Required Loan / Subsidy</div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-3xs font-bold uppercase tracking-wider text-stone-400">Est. Monthly Net Profit</span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
            {formatINR(plan.financials.monthlyNetProfit)}
          </div>
          <div className="text-3xs text-stone-500 mt-0.5">
            Margin: {plan.financials.netMarginPercent.toFixed(1)}% | DSCR: {plan.financials.debtServiceCoverageRatio ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}
          </div>
        </div>
      </div>

      {/* 3. Section 1: Business Overview & Factual Description */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <Building2 className="h-5 w-5 text-emerald-800" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            1. Business Overview & Factual Activity
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Enterprise Classification</span>
              <p className="font-semibold text-stone-900 mt-0.5">{plan.business.businessName} ({plan.business.businessType})</p>
            </div>

            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Operating Scale</span>
              <p className="font-semibold text-stone-900 mt-0.5">{plan.business.proposedScale} ({plan.business.unit})</p>
            </div>

            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Primary Commercial Output</span>
              <p className="text-stone-700 mt-0.5">{plan.business.primaryOutput}</p>
            </div>

            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Primary Raw Material Inputs</span>
              <ul className="list-disc list-inside text-stone-700 mt-0.5 space-y-0.5">
                {plan.business.primaryInputs.map((input, idx) => (
                  <li key={idx}>{input}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Major Plant Machinery & Equipment</span>
              <ul className="list-disc list-inside text-stone-700 mt-0.5 space-y-0.5">
                {plan.business.majorEquipment.map((eq, idx) => (
                  <li key={idx}>{eq}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Infrastructure & Utilities</span>
              <p className="text-stone-700 mt-0.5">{plan.business.infrastructureRequirements}</p>
            </div>

            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Initial Working Capital Requirement</span>
              <p className="font-semibold text-stone-900 mt-0.5">{formatINR(plan.business.workingCapitalRequirement)} (Cycle provision)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 2: Entrepreneur Profile (User-declared only) */}
      {plan.entrepreneur?.hasDeclaredDetails && (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Award className="h-5 w-5 text-emerald-800" />
            <h2 className="font-heading text-lg font-bold text-stone-900">
              2. Entrepreneur Profile & Declared Criteria
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {plan.entrepreneur.age && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-3xs font-bold text-stone-400 uppercase">Age</span>
                <p className="font-bold text-stone-800 mt-0.5">{plan.entrepreneur.age} Years</p>
              </div>
            )}
            {plan.entrepreneur.gender && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-3xs font-bold text-stone-400 uppercase">Gender</span>
                <p className="font-bold text-stone-800 mt-0.5 capitalize">{plan.entrepreneur.gender}</p>
              </div>
            )}
            {plan.entrepreneur.socialCategory && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-3xs font-bold text-stone-400 uppercase">Social Category</span>
                <p className="font-bold text-stone-800 mt-0.5 uppercase">{plan.entrepreneur.socialCategory}</p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-3xs font-bold text-stone-400 uppercase">Location Designation</span>
              <p className="font-bold text-stone-800 mt-0.5 capitalize">{plan.entrepreneur.isRural ? 'Rural Area' : 'Urban Area'}</p>
            </div>
          </div>
          <p className="text-3xs text-stone-400">
            Note: Only applicant details explicitly provided are reflected above; no demographic assumptions are inferred.
          </p>
        </section>
      )}

      {/* 5. Section 3: Location Context & Catchment (Phase 5) */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <MapPin className="h-5 w-5 text-emerald-800" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            3. Proposed Location Context & Commercial Catchment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Administrative Location</span>
              <p className="font-semibold text-stone-900 mt-0.5">
                {plan.location?.villageOrTown ? `${plan.location.villageOrTown}, ` : ''}
                {plan.location?.subDistrictOrBlock ? `Block: ${plan.location.subDistrictOrBlock}, ` : ''}
                {plan.location?.district}, {plan.location?.state}
              </p>
            </div>

            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Catchment & Trading Mandis</span>
              <p className="text-stone-700 mt-0.5">{plan.location?.marketCatchmentInfo}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-stone-400 font-bold uppercase text-3xs">Infrastructure Ground Realities</span>
              <p className="text-stone-700 mt-0.5">
                Daily 3-Phase Power: <strong>{plan.location?.powerAvailabilityHours || '16-18'} hrs/day</strong> | Road Connectivity: <strong>{plan.location?.roadConnectivityRating || 'National / State Highway accessible'}</strong>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-3xs text-stone-600">
              <strong className="text-stone-800 block mb-0.5">Resolution & Benchmark Disclosure:</strong>
              {plan.location?.benchmarkDisclosure}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 4: Agriculture Analysis (Phase 6, only for applicable businesses) */}
      {plan.agricultureAnalysis?.applicable && (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Sprout className="h-5 w-5 text-emerald-800" />
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold text-stone-900">
                4. Agriculture Location Suitability & Ground Realities
              </h2>
              <p className="text-2xs text-stone-500">
                Evaluated for: <strong className="capitalize">{plan.agricultureAnalysis.businessKind?.replace('_', ' ')}</strong> in {plan.location?.district}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Supportive factors */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                Why Location May Suit
              </span>
              <ul className="space-y-1 text-emerald-900 list-disc list-inside">
                {plan.agricultureAnalysis.whyMaySuit.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>

            {/* Concerns / Mixed */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                Risk Factors & Management Needed
              </span>
              <ul className="space-y-1 text-amber-900 list-disc list-inside">
                {plan.agricultureAnalysis.whyMayNotSuit.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Local verification steps */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2 text-xs">
            <span className="font-bold text-stone-900 block">
              Prioritized Local Ground Verification Steps:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-stone-700">
              {plan.agricultureAnalysis.priorityVerificationSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
            <p className="text-3xs text-stone-500 pt-2 border-t border-stone-200">
              {plan.agricultureAnalysis.scoreDisclosure}
            </p>
          </div>
        </section>
      )}

      {/* 7. Section 5: Project Cost & Capital Architecture (Phase 4) */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <Calculator className="h-5 w-5 text-emerald-800" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            5. Project Cost & Capital Architecture
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase text-3xs border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Capital Head</th>
                <th className="py-2.5 px-3">Amount (₹)</th>
                <th className="py-2.5 px-3">% of Outlay</th>
                <th className="py-2.5 px-3">Financing Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-800">Fixed Assets Investment (CapEx)</td>
                <td className="py-2.5 px-3 font-bold text-stone-900">{formatINR(plan.financials.fixedAssetsCost)}</td>
                <td className="py-2.5 px-3 text-stone-600">
                  {((plan.financials.fixedAssetsCost / plan.financials.totalProjectCost) * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 text-stone-600">Promoter Equity + Bank Term Loan</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-800">Working Capital Requirement (OpEx Provision)</td>
                <td className="py-2.5 px-3 font-bold text-stone-900">{formatINR(plan.financials.workingCapitalRequirement)}</td>
                <td className="py-2.5 px-3 text-stone-600">
                  {((plan.financials.workingCapitalRequirement / plan.financials.totalProjectCost) * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 text-stone-600">Promoter Cash Margin / Cash Credit</td>
              </tr>
              <tr className="bg-emerald-50/50 font-bold">
                <td className="py-3 px-3 text-emerald-950">TOTAL PROJECT COST</td>
                <td className="py-3 px-3 text-emerald-950 text-sm">{formatINR(plan.financials.totalProjectCost)}</td>
                <td className="py-3 px-3 text-emerald-950">100.0%</td>
                <td className="py-3 px-3 text-emerald-950">Combined Outlay</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-stone-800">Available Promoter Equity</td>
                <td className="py-2.5 px-3 font-bold text-emerald-700">{formatINR(plan.financials.availableCapital)}</td>
                <td className="py-2.5 px-3 text-stone-600">
                  {((plan.financials.availableCapital / plan.financials.totalProjectCost) * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 text-stone-600">Own Funds / Personal Savings</td>
              </tr>
              <tr className="bg-amber-50/50 font-bold">
                <td className="py-3 px-3 text-amber-950">NET FINANCING GAP (LOAN REQUIREMENT)</td>
                <td className="py-3 px-3 text-amber-950 text-sm">{formatINR(plan.financials.financingGap)}</td>
                <td className="py-3 px-3 text-amber-950">
                  {((plan.financials.financingGap / plan.financials.totalProjectCost) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-amber-950">Bank Loan & Government Scheme Subsidy</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <strong className="text-stone-900 block mb-1">Affordability Classification & Interpretation:</strong>
          <p className="text-stone-700">{plan.financials.plainLanguageInterpretation}</p>
        </div>
      </section>

      {/* 8. Section 6: Financing Plan & Gap Architecture */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <Landmark className="h-5 w-5 text-emerald-800" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            6. How the Business Can Be Financed
          </h2>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
          <div className="font-mono font-bold text-sm">{plan.financing.formulaText}</div>
          <p className="text-2xs text-emerald-800 mt-1">{plan.financing.advisoryNote}</p>
        </div>

        {plan.financing.potentialOptions.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-stone-400 font-bold uppercase text-3xs">
              Documented Scheme Limits & Financing Pathways
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {plan.financing.potentialOptions.map((opt, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-stone-900">{opt.schemeOrLoanName}</span>
                    <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600 shrink-0">
                      {opt.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-3xs text-stone-500">{opt.authorityOrBank}</div>
                  <div className="text-2xs font-semibold text-emerald-900">
                    {opt.interestRateOrSubsidy}
                    {opt.maxDocumentedLimit ? ` (Max Outlay Limit: ${formatINR(opt.maxDocumentedLimit)})` : ''}
                  </div>
                  <div className="text-3xs text-stone-600">{opt.statusNote}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {onNavigateTab && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Landmark className="h-5 w-5 text-emerald-800 shrink-0" />
              <div>
                <strong className="text-emerald-950 block">Bank Credit Appraisal & Due Diligence Dossier</strong>
                <span className="text-stone-700 text-2xs">
                  Review RBI promoter margin norms, DSCR appraisal banding, CGTMSE/CGFMU collateral-free eligibility, and branch interview preparation.
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('loans')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 text-white px-3.5 py-1.5 font-bold text-xs hover:bg-emerald-900 transition shrink-0 cursor-pointer shadow-2xs"
            >
              <span>Open Bank Appraisal</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </section>


      {/* 9. Section 7: Financial Outlook & Sensitivity Scenarios */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <Calculator className="h-5 w-5 text-emerald-800" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            7. Financial Outlook & Operational Feasibility
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold text-stone-400 uppercase">Monthly Revenue</span>
            <p className="font-bold text-stone-900 mt-0.5">{formatINR(plan.financials.monthlyRevenue)}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold text-stone-400 uppercase">Monthly OPEX</span>
            <p className="font-bold text-stone-900 mt-0.5">{formatINR(Math.round(plan.financials.monthlyOpex))}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold text-stone-400 uppercase">Monthly Loan EMI</span>
            <p className="font-bold text-stone-900 mt-0.5">
              {plan.financials.estimatedMonthlyEmi ? formatINR(plan.financials.estimatedMonthlyEmi) : '₹0'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold text-stone-400 uppercase">DSCR Bankability</span>
            <p className="font-bold text-emerald-800 mt-0.5">
              {plan.financials.debtServiceCoverageRatio ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Sensitivity Scenarios */}
        {plan.scenarios && plan.scenarios.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-stone-400 font-bold uppercase text-3xs">
              Sensitivity Scenarios (Phase 4 Source of Truth)
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 uppercase text-3xs border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Scenario</th>
                    <th className="py-2 px-3">Monthly Revenue</th>
                    <th className="py-2 px-3">Monthly OPEX</th>
                    <th className="py-2 px-3">Monthly Net Profit</th>
                    <th className="py-2 px-3">Assumptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {plan.scenarios.map((sc, idx) => (
                    <tr key={idx} className={sc.scenario === 'base' ? 'bg-emerald-50/40 font-semibold' : ''}>
                      <td className="py-2.5 px-3">{sc.label}</td>
                      <td className="py-2.5 px-3">{formatINR(sc.monthlyRevenue)}</td>
                      <td className="py-2.5 px-3">{formatINR(sc.monthlyOpex)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-950">{formatINR(sc.monthlyNetProfit)}</td>
                      <td className="py-2.5 px-3 text-3xs text-stone-500">{sc.assumptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Collapsible 12-Month & 3-Year Projections */}
        {plan.projections && (
          <div className="pt-2 border-t border-stone-200">
            <button
              onClick={() => setShowProjections(!showProjections)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
            >
              {showProjections ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span>{showProjections ? 'Hide Detailed Financial Projections' : 'Show 12-Month Cash Flow & 3-Year Projections'}</span>
            </button>

            {showProjections && (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-stone-800 block mb-2">3-Year Operational Horizon</span>
                  <div className="grid grid-cols-3 gap-3">
                    {plan.projections.threeYearSummary.map((yr) => (
                      <div key={yr.year} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                        <span className="font-bold text-emerald-900">Year {yr.year}</span>
                        <div className="text-3xs text-stone-600">Revenue: {formatINR(yr.annualRevenue)}</div>
                        <div className="text-3xs text-stone-600">OPEX: {formatINR(yr.annualOpex)}</div>
                        <div className="text-2xs font-bold text-stone-900">Net Profit: {formatINR(yr.annualNetProfit)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-800 block mb-2">Year 1 Cumulative Cash Flow (12 Months)</span>
                  <div className="overflow-x-auto max-h-48 border border-stone-200 rounded-xl">
                    <table className="w-full text-3xs text-left">
                      <thead className="bg-stone-50 sticky top-0 border-b border-stone-200">
                        <tr>
                          <th className="p-2">Month</th>
                          <th className="p-2">Inflow</th>
                          <th className="p-2">Outflow</th>
                          <th className="p-2">Net Cash</th>
                          <th className="p-2">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {plan.projections.cashFlow12Months.map((m) => (
                          <tr key={m.month}>
                            <td className="p-2 font-medium">Month {m.month}</td>
                            <td className="p-2">{formatINR(m.inflow)}</td>
                            <td className="p-2">{formatINR(m.outflow)}</td>
                            <td className="p-2 font-semibold text-emerald-700">{formatINR(m.netCashFlow)}</td>
                            <td className="p-2 font-bold text-stone-900">{formatINR(m.cumulativeCash)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 10. Section 8: Matched Government Schemes (Phase 7) */}
      {plan.schemes && plan.schemes.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Landmark className="h-5 w-5 text-emerald-800" />
            <h2 className="font-heading text-lg font-bold text-stone-900">
              8. Matched Government Schemes & Subsidies
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {plan.schemes.map((scheme) => (
              <div key={scheme.schemeId} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{scheme.schemeName}</h3>
                    <p className="text-3xs text-stone-500">{scheme.administeringAuthority}</p>
                  </div>

                  <span className={`text-3xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                    scheme.eligibilityStatus === 'eligible'
                      ? 'bg-emerald-100 text-emerald-900'
                      : scheme.eligibilityStatus === 'potentially_eligible'
                        ? 'bg-blue-100 text-blue-900'
                        : scheme.eligibilityStatus === 'needs_verification'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-200 text-stone-700'
                  }`}>
                    {scheme.eligibilityStatus.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-stone-700">
                  <strong>Support Terms:</strong> {scheme.financialSupportDescription}
                </p>

                {scheme.whyMatched.length > 0 && (
                  <div className="text-3xs text-emerald-900 space-y-0.5">
                    <strong className="block text-stone-700">Alignment Criteria:</strong>
                    <ul className="list-disc list-inside">
                      {scheme.whyMatched.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {scheme.unmetConditions.length > 0 && (
                  <div className="text-3xs text-amber-900 space-y-0.5">
                    <strong className="block text-stone-700">Outstanding Conditions:</strong>
                    <ul className="list-disc list-inside">
                      {scheme.unmetConditions.map((u, idx) => (
                        <li key={idx}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-stone-200 text-3xs">
                  <a
                    href={scheme.officialInformationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-800 font-semibold hover:underline"
                  >
                    <span>Official Guidelines</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {scheme.officialApplicationUrl ? (
                    <a
                      href={scheme.officialApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-800 font-semibold hover:underline"
                    >
                      <span>Official Application Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-stone-500">Official application link needs verification</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. Section 9: Document Readiness Dossier (Phase 8) */}
      {plan.documentReadiness && (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-800" />
              <div>
                <h2 className="font-heading text-lg font-bold text-stone-900">
                  9. Application Preparation & Document Readiness
                </h2>
                <p className="text-3xs text-stone-500">
                  Target Scheme: {plan.documentReadiness.selectedSchemeName || 'General Bank & DIC Dossier'}
                </p>
              </div>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('documents')}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
              >
                <span>{plan.documentReadiness.checklistLinkText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-3xs font-bold text-stone-400 uppercase">Total Required</span>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">{plan.documentReadiness.summary.totalRequired}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-3xs font-bold text-emerald-800 uppercase">Declared Available</span>
              <p className="text-base font-extrabold text-emerald-950 mt-0.5">{plan.documentReadiness.summary.markedAvailable}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-3xs font-bold text-amber-800 uppercase">Need Preparation</span>
              <p className="text-base font-extrabold text-amber-950 mt-0.5">{plan.documentReadiness.summary.needToPrepare}</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-3xs font-bold text-stone-400 uppercase">Need Verification</span>
              <p className="text-base font-extrabold text-stone-900 mt-0.5">{plan.documentReadiness.summary.needVerification}</p>
            </div>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <span className="text-stone-400 font-bold uppercase text-3xs">Required Documents List</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-stone-200 rounded-xl p-3 bg-stone-50/50">
              {plan.documentReadiness.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-2 text-2xs py-1 border-b border-stone-200 last:border-b-0">
                  <div>
                    <span className="font-semibold text-stone-800">{doc.name}</span>
                    <span className="text-stone-400 ml-1 text-3xs">({doc.category})</span>
                  </div>
                  <span className={`text-3xs font-semibold px-2 py-0.5 rounded capitalize ${
                    doc.userStatus === 'available'
                      ? 'bg-emerald-100 text-emerald-900'
                      : doc.userStatus === 'to_prepare'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-200 text-stone-700'
                  }`}>
                    {doc.userStatus.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. Section 10: Implementation Roadmap (7 Practical Steps) */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <Calendar className="h-5 w-5 text-emerald-800" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            10. Implementation Roadmap
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          {plan.implementationPlan.steps.map((st) => (
            <div key={st.stepNumber} className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">
                {st.stepNumber}
              </span>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-stone-900 text-xs">{st.title}</h3>
                    <span className={`text-3xs font-semibold px-2 py-0.5 rounded border ${
                      st.category === 'scheme_documented_process'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : st.category === 'site_operational'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}>
                      {st.categoryLabel}
                    </span>
                  </div>
                  <span className="text-3xs text-stone-500 font-medium">Lead: {st.ownerOrAgency}</span>
                </div>
                <p className="text-stone-600 text-2xs leading-relaxed">{st.description}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                  <div className="text-3xs font-semibold text-emerald-900">
                    Action: {st.actionItem}
                  </div>
                  <div className="text-3xs text-stone-400">
                    Source: {st.evidenceSource}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-3xs text-stone-400">
          {plan.implementationPlan.disclaimer}
        </p>
      </section>

      {/* 13. Section 11: User Narrative & Operational Strategy (Editable) */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-emerald-800" />
            <h2 className="font-heading text-lg font-bold text-stone-900">
              11. Promoter Narrative & Field Strategy
            </h2>
          </div>

          {!isReadOnly && onUpdateNarrative && (
            <button
              onClick={() => {
                if (isEditingNarrative) {
                  handleSaveNarrative();
                } else {
                  setIsEditingNarrative(true);
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer print:hidden"
            >
              <span>{isEditingNarrative ? 'Done Editing' : 'Edit Narrative'}</span>
            </button>
          )}
        </div>

        <p className="text-3xs text-stone-500">
          Note: You may customize the descriptive objectives and remarks below. Financial numbers are strictly determined by the deterministic calculation engine and cannot be manually modified.
        </p>

        {isEditingNarrative ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Business Objectives</label>
              <textarea
                rows={2}
                value={narrativeState.businessObjectives}
                onChange={(e) => setNarrativeState({ ...narrativeState, businessObjectives: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-emerald-700"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Target Customers & Market Reach</label>
              <textarea
                rows={2}
                value={narrativeState.targetCustomersAndMarket}
                onChange={(e) => setNarrativeState({ ...narrativeState, targetCustomersAndMarket: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-emerald-700"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Operational & Production Notes</label>
              <textarea
                rows={2}
                value={narrativeState.operationalNotes}
                onChange={(e) => setNarrativeState({ ...narrativeState, operationalNotes: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-emerald-700"
              />
            </div>
            <button
              onClick={handleSaveNarrative}
              className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 transition cursor-pointer"
            >
              Save Narrative Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-3xs font-bold text-stone-400 uppercase">Business Objectives</span>
              <p className="text-stone-700">{plan.narrative?.businessObjectives}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-3xs font-bold text-stone-400 uppercase">Target Customers & Catchment</span>
              <p className="text-stone-700">{plan.narrative?.targetCustomersAndMarket}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-3xs font-bold text-stone-400 uppercase">Operational Phasing</span>
              <p className="text-stone-700">{plan.narrative?.operationalNotes}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-3xs font-bold text-stone-400 uppercase">Promoter Remarks</span>
              <p className="text-stone-700">{plan.narrative?.promoterRemarks}</p>
            </div>
          </div>
        )}
      </section>

      {/* 14. Section 12: Assumptions & Mandatory Disclosures */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <Info className="h-5 w-5 text-stone-600" />
          <h2 className="font-heading text-lg font-bold text-stone-900">
            12. Planning Assumptions & Statutory Disclosures
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-stone-900 block">Baseline Methodology Assumptions</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-2xs text-stone-600">
              {plan.assumptions.map((asm, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <strong className="text-stone-800 block">{asm.title}</strong>
                  <span>{asm.description}</span>
                  <span className="block text-3xs text-stone-400 mt-1">Source: {asm.sourceOfTruth}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200">
            <span className="font-bold text-stone-900 block">Mandatory Disclosures</span>
            <div className="space-y-2">
              {plan.disclosures.map((disc) => (
                <div key={disc.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-3xs text-stone-700 leading-relaxed">
                  <strong className="text-amber-950 block text-2xs mb-0.5">{disc.title}</strong>
                  {disc.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-stone-200 text-3xs text-stone-400 font-mono">
          DISCLAIMER: Generated by GramUdyam for planning and preparation. It is not an official government application or sanction document.
        </div>
      </section>

      {/* Share Plan Modal */}
      {!isReadOnly && (
        <SharePlanModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          planId={plan.id}
          planTitle={plan.business.businessName}
          initialShareSettings={shareSettings}
        />
      )}
    </div>
  );
};
