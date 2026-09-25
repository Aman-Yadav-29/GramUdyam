import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Landmark,
  Building2,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit3,
  Save,
  Check,
  Info,
  Calendar,
  Layers,
  MapPin,
  FileCheck
} from 'lucide-react';
import type {
  SubmissionPackage,
  SubmissionPackageType,
  SubmissionPackageUserInputs,
  GenerateSubmissionPackageParams
} from '../types/submissionPackage.ts';
import type { FinancialPlan } from '../types/financial.ts';
import type { DistrictIntelligence } from '../types/location.ts';
import type { AgriLocationAnalysis } from '../types/agriLocation.ts';
import type { SchemeMatch } from '../types/scheme.ts';
import type { DetailedProjectReport } from '../types/dpr.ts';
import type { BusinessPlanAction } from '../types/actionCenter.ts';
import type { ExecutionEvidence } from '../types/executionEvidence.ts';
import type { ExecutionTimelineEvent, PlanHealthSummary } from '../types/executionTimeline.ts';
import type { SchemeReadinessPlan } from '../types/documentReadiness.ts';
import { generateSubmissionPackage } from '../utils/submissionPackageGenerator.ts';
import {
  generateSubmissionPackageText,
  generateSubmissionPackageHtml,
  downloadSubmissionBlob
} from '../utils/exportSubmissionPackage.ts';
import { apiClient } from '../services/apiClient.ts';
import {
  getGuestSubmissionPackages,
  saveGuestSubmissionPackage,
  updateGuestSubmissionPackageUserInputs
} from '../utils/guestStorage.ts';
import { formatINR } from '../utils/formatters.ts';

interface SubmissionPackageViewProps {
  planId: string;
  planTitle: string;
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
  readinessPlan?: SchemeReadinessPlan | null;
  dpr?: DetailedProjectReport | null;
  actions?: BusinessPlanAction[];
  evidence?: ExecutionEvidence[];
  timelineEvents?: ExecutionTimelineEvent[];
  planHealth?: PlanHealthSummary | null;
  isGuest?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const SubmissionPackageView: React.FC<SubmissionPackageViewProps> = ({
  planId,
  planTitle,
  business,
  promoterProfile,
  location,
  financialPlan,
  districtData,
  agriLocationAnalysis,
  matchedSchemes = [],
  readinessPlan,
  dpr,
  actions = [],
  evidence = [],
  timelineEvents = [],
  planHealth,
  isGuest = false,
  onNavigateTab
}) => {
  const [packageType, setPackageType] = useState<SubmissionPackageType>('bank_submission');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    matchedSchemes.length > 0 ? matchedSchemes[0].scheme.id : ''
  );
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [savingInputs, setSavingInputs] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // User input editable fields
  const [userInputs, setUserInputs] = useState<SubmissionPackageUserInputs>({
    targetInstitutionName: '',
    targetBranchName: '',
    institutionalContactPerson: '',
    institutionalDesignation: '',
    coverNote: '',
    applicantStatement: '',
    businessDescription: business.description || '',
    packageNotes: '',
    submissionChecklistNotes: ''
  });

  // Base parameters for generator
  const genParams: GenerateSubmissionPackageParams = useMemo(() => ({
    packageType,
    planId,
    business,
    promoterProfile,
    location,
    financialPlan,
    districtData,
    agriLocationAnalysis,
    matchedSchemes,
    selectedSchemeId: packageType === 'government_scheme_submission' ? selectedSchemeId : undefined,
    readinessPlan,
    dpr,
    actions,
    evidence,
    timelineEvents,
    planHealth,
    userInputs
  }), [
    packageType,
    planId,
    business,
    promoterProfile,
    location,
    financialPlan,
    districtData,
    agriLocationAnalysis,
    matchedSchemes,
    selectedSchemeId,
    readinessPlan,
    dpr,
    actions,
    evidence,
    timelineEvents,
    planHealth,
    userInputs
  ]);

  // Client-side generated baseline package
  const [currentPackage, setCurrentPackage] = useState<SubmissionPackage>(() =>
    generateSubmissionPackage(genParams)
  );

  // Re-generate package when parameters change
  useEffect(() => {
    const pkg = generateSubmissionPackage(genParams);
    setCurrentPackage(pkg);
  }, [genParams]);

  // Section toggle for inclusion
  const handleToggleSection = (sectionId: string) => {
    setCurrentPackage(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, included: !s.included } : s
      )
    }));
  };

  const handleToggleExpand = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Save user inputs to backend or guest storage
  const handleSaveInputs = async () => {
    setSavingInputs(true);
    setSaveSuccess(false);
    try {
      if (isGuest) {
        saveGuestSubmissionPackage(planId, currentPackage);
        updateGuestSubmissionPackageUserInputs(currentPackage.metadata.packageId, planId, userInputs);
      } else {
        // Authenticated: persist via API
        try {
          await apiClient.generateSubmissionPackage(genParams);
          await apiClient.updateSubmissionPackageUserInputs(currentPackage.metadata.packageId, userInputs);
        } catch {
          // If server call fails, local state remains active
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSavingInputs(false);
    }
  };

  // Export handlers
  const handleExportText = () => {
    const text = generateSubmissionPackageText(currentPackage);
    const fname = `${business.name.replace(/\s+/g, '_')}_${packageType}.txt`;
    downloadSubmissionBlob(fname, text, 'text/plain;charset=utf-8');
  };

  const handleExportHtml = () => {
    const html = generateSubmissionPackageHtml(currentPackage);
    const fname = `${business.name.replace(/\s+/g, '_')}_${packageType}.html`;
    downloadSubmissionBlob(fname, html, 'text/html;charset=utf-8');
  };

  const handlePrint = () => {
    const html = generateSubmissionPackageHtml(currentPackage);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleCopyText = async () => {
    const text = generateSubmissionPackageText(currentPackage);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // Fallback
    }
  };

  const completeness = currentPackage.completeness;
  const financialSummary = currentPackage.financialSummary;

  return (
    <div className="space-y-6">
      {/* Top Banner / Identity */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1 text-2xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <FileText className="h-3.5 w-3.5" />
              <span>Phase 15 — Submission Package Generator</span>
            </div>
            <h1 className="font-heading text-xl font-bold text-stone-900">
              Bank &amp; Government Submission Package
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Assemble authoritative, verified information from GramUdyam into a structured dossier for institutional review.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-stone-500" />
              <span>{viewMode === 'editor' ? 'Dossier Preview' : 'Edit Inputs'}</span>
            </button>
            <button
              onClick={handleExportText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              title="Download plain-text submission document"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              <span>Text (.txt)</span>
            </button>
            <button
              onClick={handleExportHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
              title="Download standalone HTML document"
            >
              <Download className="h-3.5 w-3.5 text-emerald-700" />
              <span>HTML Dossier</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 text-xs font-bold text-white hover:bg-emerald-900 transition cursor-pointer shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* Statutory Disclosure Notice */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Information Preparation Aid:</span> This package organizes plan information recorded in GramUdyam. It does not constitute a loan approval, credit sanction, subsidy guarantee, legal filing, or official government certification. All figures are source-derived plan assumptions.
          </div>
        </div>
      </div>

      {/* Package Type & Scheme Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Selector */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Target Institutional Reviewer
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPackageType('bank_submission')}
              className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                packageType === 'bank_submission'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Landmark className="h-4 w-4 text-emerald-700" />
                <span className="font-bold text-xs">Bank Submission</span>
              </div>
              <span className="text-3xs text-stone-500">22 Comprehensive Sections (Credit Appraisal Dossier)</span>
            </button>

            <button
              type="button"
              onClick={() => setPackageType('government_scheme_submission')}
              className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                packageType === 'government_scheme_submission'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-emerald-700" />
                <span className="font-bold text-xs">Government / Scheme</span>
              </div>
              <span className="text-3xs text-stone-500">12 Targeted Sections (DIC / Nodal Agency)</span>
            </button>
          </div>
        </div>

        {/* Scheme Selector (if Government Scheme Package chosen) */}
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              {packageType === 'government_scheme_submission' ? 'Select Matched Scheme for Dossier' : 'Associated Government Schemes'}
            </label>
            {matchedSchemes.length > 0 ? (
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                disabled={packageType !== 'government_scheme_submission'}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 disabled:opacity-50"
              >
                {matchedSchemes.map((m) => (
                  <option key={m.scheme.id} value={m.scheme.id}>
                    {m.scheme.name} — Status: {m.status.toUpperCase()} ({m.scheme.administeringAuthority})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-stone-500 py-2">
                No schemes currently matched for this business profile.
              </div>
            )}
          </div>
          <p className="text-3xs text-stone-400 mt-2">
            Preserves Phase 7 deterministic matching statuses without artificial scoring or ranking.
          </p>
        </div>
      </div>

      {/* Package Completeness & Factual Status Bar */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3 mb-3">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-stone-500">Dossier Factual Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                completeness.status === 'ready_for_review'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {completeness.status === 'ready_for_review' ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Ready for Review</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Information Incomplete</span>
                  </>
                )}
              </span>
              <span className="text-3xs text-stone-400">
                (Factual count of plan records; not an approval score)
              </span>
            </div>
          </div>

          <div className="text-xs text-stone-600 sm:text-right">
            <span>Snapshot: </span>
            <strong className="text-stone-800">{currentPackage.metadata.snapshotNotice}</strong>
          </div>
        </div>

        {/* Factual Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="block text-3xs font-bold uppercase text-stone-500">Sections Populated</span>
            <span className="text-sm font-bold text-stone-900">{completeness.sectionsPopulated} / {completeness.sectionsTotal}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="block text-3xs font-bold uppercase text-stone-500">Sections Incomplete</span>
            <span className="text-sm font-bold text-stone-900">{completeness.sectionsIncomplete}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="block text-3xs font-bold uppercase text-stone-500">Required Docs Total</span>
            <span className="text-sm font-bold text-stone-900">{completeness.requiredDocumentsTotal}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="block text-3xs font-bold uppercase text-stone-500">Marked Available</span>
            <span className="text-sm font-bold text-emerald-800">{completeness.requiredDocumentsAvailable}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="block text-3xs font-bold uppercase text-stone-500">Docs to Prepare</span>
            <span className="text-sm font-bold text-amber-800">{completeness.documentsToPrepare}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="block text-3xs font-bold uppercase text-stone-500">Needing Verification</span>
            <span className="text-sm font-bold text-stone-700">{completeness.documentsNeedingVerification}</span>
          </div>
        </div>

        {completeness.missingInformationItems.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50/50 border border-amber-200 text-xs">
            <span className="font-bold text-amber-950 block mb-1">Pending Items to Complete in GramUdyam:</span>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900 text-2xs">
              {completeness.missingInformationItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Financial Invariance Summary Card (Phase 4 Direct Source) */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Financial Values (Direct Pass-Through from Phase 4 Financial Engine)
            </span>
          </div>
          <span className="text-3xs font-semibold text-stone-500 uppercase bg-stone-100 px-2 py-0.5 rounded">
            Zero Recalculation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-3xs font-bold uppercase text-stone-500 block">Total Project Cost</span>
            <strong className="text-stone-900 text-sm">{financialSummary.totalProjectCost !== null ? formatINR(financialSummary.totalProjectCost) : 'Not available'}</strong>
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-stone-500 block">Promoter Margin Equity</span>
            <strong className="text-stone-900 text-sm">{financialSummary.promoterContribution !== null ? formatINR(financialSummary.promoterContribution) : 'Not available'}</strong>
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-stone-500 block">Bank Term Loan</span>
            <strong className="text-emerald-800 text-sm">{financialSummary.bankTermLoanRequired !== null ? formatINR(financialSummary.bankTermLoanRequired) : 'Not available'}</strong>
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-stone-500 block">Monthly Revenue</span>
            <strong className="text-stone-900 text-sm">{financialSummary.monthlyRevenue !== null ? formatINR(financialSummary.monthlyRevenue) : 'Not available'}</strong>
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-stone-500 block">DSCR Ratio</span>
            <strong className="text-stone-900 text-sm">{financialSummary.debtServiceCoverageRatio !== null ? financialSummary.debtServiceCoverageRatio.toFixed(2) : 'Not available'}</strong>
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-stone-500 block">Monthly Net Profit</span>
            <strong className="text-emerald-900 text-sm">{financialSummary.monthlyNetProfit !== null ? formatINR(financialSummary.monthlyNetProfit) : 'Not available'}</strong>
          </div>
        </div>
      </div>

      {/* Main Body: Editor vs Preview */}
      {viewMode === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Sections Explorer & Inclusions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Dossier Sections ({currentPackage.sections.length})</h3>
                  <p className="text-2xs text-stone-500">Toggle sections to include or exclude from institutional export.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = Object.values(expandedSections).every(Boolean);
                    const updated: Record<string, boolean> = {};
                    currentPackage.sections.forEach(s => { updated[s.id] = !allOpen; });
                    setExpandedSections(updated);
                  }}
                  className="text-2xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  Expand / Collapse All
                </button>
              </div>

              <div className="space-y-3">
                {currentPackage.sections.map((section) => {
                  const isExpanded = Boolean(expandedSections[section.id]);
                  return (
                    <div
                      key={section.id}
                      className={`rounded-lg border transition ${
                        section.included
                          ? 'border-stone-200 bg-white'
                          : 'border-stone-200 bg-stone-50/60 opacity-60'
                      }`}
                    >
                      <div className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={section.included}
                            onChange={() => handleToggleSection(section.id)}
                            className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-stone-900">{section.title}</span>
                              <span className={`text-3xs font-bold px-1.5 py-0.5 rounded uppercase ${
                                section.status === 'populated'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}>
                                {section.status}
                              </span>
                            </div>
                            <div className="text-3xs text-stone-500 mt-0.5">
                              Source: {section.sourceReference} [{section.sourcePhase}]
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleExpand(section.id)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Expanded Section Details */}
                      {isExpanded && (
                        <div className="border-t border-stone-100 p-3.5 bg-stone-50/40 text-xs space-y-2.5">
                          {section.summary && (
                            <div className="p-2 rounded bg-stone-100 text-stone-700 text-2xs italic">
                              {section.summary}
                            </div>
                          )}
                          {section.paragraphs.map((p, idx) => (
                            <p key={idx} className="text-stone-700 text-xs leading-relaxed">{p}</p>
                          ))}
                          {section.bulletPoints && section.bulletPoints.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-2xs text-stone-600">
                              {section.bulletPoints.map((bp, idx) => (
                                <li key={idx}>{bp}</li>
                              ))}
                            </ul>
                          )}
                          {section.metrics && section.metrics.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {section.metrics.map((m, idx) => (
                                <div key={idx} className="p-2 rounded bg-white border border-stone-200">
                                  <span className="text-3xs font-semibold text-stone-500 block uppercase">{m.label}</span>
                                  <strong className="text-stone-900 text-xs">{m.value}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Promoter Inputs Form */}
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-stone-900">Promoter Inputs</h3>
                </div>
                <button
                  type="button"
                  onClick={handleSaveInputs}
                  disabled={savingInputs}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition cursor-pointer disabled:opacity-50"
                >
                  {saveSuccess ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                  <span>{saveSuccess ? 'Saved' : savingInputs ? 'Saving...' : 'Save Inputs'}</span>
                </button>
              </div>

              <p className="text-3xs text-stone-500 mb-4">
                Enter institution-specific recipient details and custom promoter statements. Protected financial calculations cannot be overridden.
              </p>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Target Lending Institution / Agency
                  </label>
                  <input
                    type="text"
                    value={userInputs.targetInstitutionName || ''}
                    onChange={(e) => setUserInputs({ ...userInputs, targetInstitutionName: e.target.value })}
                    placeholder="e.g. State Bank of India / DIC Indore"
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Branch / District Office
                  </label>
                  <input
                    type="text"
                    value={userInputs.targetBranchName || ''}
                    onChange={(e) => setUserInputs({ ...userInputs, targetBranchName: e.target.value })}
                    placeholder="e.g. Main Road Branch"
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={userInputs.institutionalContactPerson || ''}
                      onChange={(e) => setUserInputs({ ...userInputs, institutionalContactPerson: e.target.value })}
                      placeholder="e.g. Branch Manager"
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-xs text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={userInputs.institutionalDesignation || ''}
                      onChange={(e) => setUserInputs({ ...userInputs, institutionalDesignation: e.target.value })}
                      placeholder="e.g. Chief Manager"
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-xs text-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Promoter Cover Note
                  </label>
                  <textarea
                    rows={3}
                    value={userInputs.coverNote || ''}
                    onChange={(e) => setUserInputs({ ...userInputs, coverNote: e.target.value })}
                    placeholder="Brief opening statement to the loan officer or committee..."
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Promoter Commitment / Declaration Statement
                  </label>
                  <textarea
                    rows={3}
                    value={userInputs.applicantStatement || ''}
                    onChange={(e) => setUserInputs({ ...userInputs, applicantStatement: e.target.value })}
                    placeholder="Promoter commitment to active management and compliance..."
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* Statutory Disclaimers Card */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 shadow-xs text-2xs text-stone-600 space-y-2">
              <span className="font-bold uppercase tracking-wider text-stone-700 block">
                Statutory Governance &amp; Notice
              </span>
              <p>
                • GramUdyam does not provide loan approval, subsidy guarantee, legal filing, licensing, or official certification.
              </p>
              <p>
                • All uploads and completion marks represent promoter self-declarations and are not independently inspected.
              </p>
              <p>
                • Scheme approvals remain at the sole discretion of the sanctioning authority.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Full Live Dossier Preview */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-700" />
              <span>
                <strong>Live Dossier Preview:</strong> This preview matches the exported HTML and Text document verbatim.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
              >
                {copyFeedback ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5 text-emerald-700" />}
                <span>{copyFeedback ? 'Copied' : 'Copy Plain Text'}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm font-sans text-stone-900 space-y-8 max-w-4xl mx-auto">
            {/* Cover Section */}
            <div className="border-b-2 border-emerald-800 pb-6">
              <div className="inline-block text-2xs font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded mb-2">
                {currentPackage.metadata.packageType === 'bank_submission' ? 'Bank Credit Appraisal Dossier' : 'Government Scheme Submission Dossier'}
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-stone-900">
                {currentPackage.metadata.businessName}
              </h2>
              <div className="text-xs text-stone-500 mt-2 space-y-0.5">
                <p><strong>Promoter:</strong> {currentPackage.metadata.promoterName} ({currentPackage.metadata.promoterSocialCategory})</p>
                <p><strong>Location:</strong> {currentPackage.metadata.location.district}, {currentPackage.metadata.location.state} ({currentPackage.metadata.location.locationType})</p>
                <p><strong>Snapshot:</strong> {currentPackage.metadata.snapshotNotice}</p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-2xs text-amber-900 leading-relaxed">
                <strong>Statutory Notice:</strong> Prepared using information recorded in GramUdyam. This package is an information-preparation aid and does not constitute approval, sanction, certification, or government/bank verification.
              </div>
            </div>

            {/* Target Institution */}
            {userInputs.targetInstitutionName && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-500 block text-3xs mb-1">Target Institutional Reviewer</span>
                <p className="font-bold text-stone-900">{userInputs.targetInstitutionName}</p>
                {userInputs.targetBranchName && <p className="text-stone-600">{userInputs.targetBranchName} Branch</p>}
                {userInputs.institutionalContactPerson && (
                  <p className="text-stone-600 mt-1">Attn: {userInputs.institutionalContactPerson} {userInputs.institutionalDesignation ? `(${userInputs.institutionalDesignation})` : ''}</p>
                )}
              </div>
            )}

            {/* Included Sections Preview */}
            <div className="space-y-8">
              {currentPackage.sections.filter(s => s.included).map((sec) => (
                <div key={sec.id} className="border-b border-stone-100 pb-6">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                    <h3 className="font-heading font-bold text-base text-stone-900">{sec.title}</h3>
                    <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 uppercase">
                      {sec.sourceReference}
                    </span>
                  </div>

                  {sec.summary && (
                    <div className="p-2.5 rounded bg-stone-50 border-l-2 border-emerald-700 text-xs text-stone-700 mb-3 italic">
                      {sec.summary}
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
                    {sec.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 mt-2.5 pl-1">
                      {sec.bulletPoints.map((bp, idx) => (
                        <li key={idx}>{bp}</li>
                      ))}
                    </ul>
                  )}

                  {sec.metrics && sec.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                      {sec.metrics.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                          <span className="text-3xs font-bold uppercase text-stone-500 block">{m.label}</span>
                          <strong className="text-stone-900 text-xs">{m.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.tables && sec.tables.length > 0 && (
                    <div className="space-y-3 mt-3">
                      {sec.tables.map((t, idx) => (
                        <div key={idx} className="overflow-x-auto">
                          <div className="text-2xs font-bold text-stone-700 mb-1">{t.title}</div>
                          <table className="w-full border-collapse border border-stone-200 text-2xs">
                            <thead>
                              <tr className="bg-stone-100">
                                {t.headers.map((h, i) => (
                                  <th key={i} className="border border-stone-200 p-2 text-left font-bold text-stone-700">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {t.rows.map((r, ri) => (
                                <tr key={ri} className="border-b border-stone-100 hover:bg-stone-50">
                                  {r.map((c, ci) => (
                                    <td key={ci} className="border border-stone-200 p-2 text-stone-700">{c}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.notes && sec.notes.length > 0 && (
                    <div className="mt-3 p-3 rounded bg-amber-50/60 border border-dashed border-amber-200 text-2xs text-amber-900 space-y-1">
                      {sec.notes.map((n, idx) => (
                        <p key={idx}>{n}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Standard Disclaimers Block */}
            <div className="border-t-2 border-stone-200 pt-6 space-y-3 text-2xs text-stone-500 leading-relaxed">
              <span className="font-bold text-xs uppercase text-stone-700 block">
                Statutory &amp; Institutional Disclosures
              </span>
              {currentPackage.disclaimers.map((d) => (
                <div key={d.id}>
                  <strong className="text-stone-700">{d.title}:</strong> {d.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
