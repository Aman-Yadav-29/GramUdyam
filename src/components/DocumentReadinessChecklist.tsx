import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Printer,
  Copy,
  Check,
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  DocumentCategory,
  DocumentRequirement,
  SchemeReadinessPlan,
  UserDocumentDeclaration
} from '../types/documentReadiness.ts';
import { formatINR } from '../utils/formatters.ts';
import { ApplicationPreparationModal } from './ApplicationPreparationModal.tsx';

interface DocumentReadinessChecklistProps {
  plan: SchemeReadinessPlan;
  businessName: string;
  projectCost: number;
  availableCapital: number;
  financingGap: number;
  onDeclarationChange: (docId: string, status: UserDocumentDeclaration) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const DocumentReadinessChecklist: React.FC<DocumentReadinessChecklistProps> = ({
  plan,
  businessName,
  projectCost,
  availableCapital,
  financingGap,
  onDeclarationChange,
  onSave,
  isSaving = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedGuidance, setExpandedGuidance] = useState<Record<string, boolean>>({});
  const [copiedDpr, setCopiedDpr] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Toggle accordion for preparation steps
  const toggleGuidance = (docId: string) => {
    setExpandedGuidance((prev) => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // Copy DPR Financial Summary to clipboard
  const handleCopyDpr = () => {
    if (plan.dprFinancialSummary?.formattedText) {
      navigator.clipboard.writeText(plan.dprFinancialSummary.formattedText);
      setCopiedDpr(true);
      setTimeout(() => setCopiedDpr(false), 2500);
    }
  };

  // Trigger Save with feedback
  const handleSaveClick = async () => {
    if (onSave) {
      await onSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Filter documents by category
  const filteredDocuments = useMemo(() => {
    if (activeCategory === 'all') return plan.documents;
    return plan.documents.filter((d) => d.category === activeCategory);
  }, [plan.documents, activeCategory]);

  // Documents still needing attention
  const stillNeeded = useMemo(() => {
    return plan.documents.filter((d) => d.userStatus === 'to_prepare' || d.userStatus === 'missing');
  }, [plan.documents]);

  const needingVerification = useMemo(() => {
    return plan.documents.filter((d) => d.userStatus === 'needs_verification' || d.userStatus === 'required');
  }, [plan.documents]);

  // Categories present in this scheme
  const availableCategories = useMemo(() => {
    const cats = new Set<DocumentCategory>();
    plan.documents.forEach((d) => cats.add(d.category));
    return Array.from(cats);
  }, [plan.documents]);

  const isNotEligible = plan.eligibilityStatus === 'not_eligible';

  return (
    <div className="space-y-6">
      {/* 1. Header & Eligibility Context */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              <Building className="h-4 w-4 text-stone-600" />
              <span>Phase 8: Application Readiness & Document Preparation</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-stone-900">
              {plan.schemeName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-600">
              <span>Administered by: <strong>{plan.administeringAuthority}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{plan.level === 'state' ? `State Scheme (${plan.state})` : 'Central Scheme'}</span>
            </div>
          </div>

          {/* Actions: Print Summary & Save */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-stone-600" />
              <span>Export Summary</span>
            </button>

            {onSave && (
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs disabled:opacity-50"
              >
                {saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
                <span>{saveSuccess ? 'Checklist Saved!' : isSaving ? 'Saving...' : 'Save Checklist'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Prominent Eligibility Banner */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          {isNotEligible ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-rose-900 block">
                  Eligibility Status: Currently Not Eligible
                </strong>
                <p className="text-2xs text-rose-800 mt-1 leading-relaxed">
                  Based on known documented conditions, this scheme is currently not applicable for your enterprise or location.
                  You may still review the official document requirements below for your information, but application is not recommended.
                </p>
              </div>
            </div>
          ) : plan.eligibilityStatus === 'eligible' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-emerald-900 block">
                  Eligibility Status: Conditions Met
                </strong>
                <p className="text-2xs text-emerald-800 mt-1 leading-relaxed">
                  Your business model, location, and known profile satisfy documented guidelines. Organize the required paperwork below prior to portal submission.
                </p>
              </div>
            </div>
          ) : plan.eligibilityStatus === 'potentially_eligible' ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-blue-900 block">
                  Eligibility Status: Potentially Compatible
                </strong>
                <p className="text-2xs text-blue-800 mt-1 leading-relaxed">
                  Your enterprise fits general activity and budget limits. Confirm specific borrower category conditions during document preparation.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-amber-900 block">
                  Eligibility Status: Needs Verification
                </strong>
                <p className="text-2xs text-amber-800 mt-1 leading-relaxed">
                  Some applicant profile attributes (e.g. age, promoter category, or local authority quota) require field verification to confirm entitlement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Readiness Summary Metric Strip (Counts Only, No Scores) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-stone-200 bg-white">
          <span className="text-3xs font-bold text-stone-500 uppercase tracking-wider block">Total Required</span>
          <strong className="text-lg font-black text-stone-900 block mt-1">{plan.summary.totalRequired}</strong>
          <span className="text-3xs text-stone-500 block mt-0.5">Scheme Document Requirements</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-3xs font-bold text-emerald-700 uppercase tracking-wider block">Marked Available</span>
          <strong className="text-lg font-black text-emerald-900 block mt-1">{plan.summary.markedAvailable}</strong>
          <span className="text-3xs text-emerald-700 block mt-0.5">Declared ready by you</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-3xs font-bold text-amber-800 uppercase tracking-wider block">Need to Prepare</span>
          <strong className="text-lg font-black text-amber-900 block mt-1">{plan.summary.needToPrepare}</strong>
          <span className="text-3xs text-amber-700 block mt-0.5">To obtain from authorities/vendors</span>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
          <span className="text-3xs font-bold text-stone-600 uppercase tracking-wider block">Needs Verification</span>
          <strong className="text-lg font-black text-stone-800 block mt-1">{plan.summary.needVerification}</strong>
          <span className="text-3xs text-stone-500 block mt-0.5">Format/validity to confirm</span>
        </div>
      </div>

      {/* 3. Detailed Project Report (DPR) Financial Integration Card */}
      {plan.dprFinancialSummary && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 uppercase tracking-wider">
                <FileText className="h-4 w-4 text-stone-700" />
                <span>Detailed Project Report (DPR) Financial Summary</span>
              </div>
              <p className="text-2xs text-stone-600 mt-0.5">
                Deterministic financial estimates derived from Phase 4 planning, ready for bank project report dossiers.
              </p>
            </div>

            <button
              onClick={handleCopyDpr}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-800 bg-white border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
            >
              {copiedDpr ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedDpr ? 'Copied DPR Summary!' : 'Copy Financial Summary for DPR'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-2xs">
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Project Cost</span>
              <strong className="text-stone-900 font-bold block">{formatINR(plan.dprFinancialSummary.totalProjectCost)}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Promoter Margin</span>
              <strong className="text-stone-700 font-bold block">{formatINR(plan.dprFinancialSummary.availableCapital)}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Term Loan Requirement</span>
              <strong className="text-amber-900 font-bold block">{formatINR(plan.dprFinancialSummary.financingGap)}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Est. Monthly Revenue</span>
              <strong className="text-stone-900 font-bold block">
                {plan.dprFinancialSummary.monthlyRevenueEstimate ? formatINR(plan.dprFinancialSummary.monthlyRevenueEstimate) : 'Calculated in Plan'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 4. Document Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-stone-900 text-white font-bold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Documents ({plan.documents.length})
          </button>

          {availableCategories.map((cat) => {
            const count = plan.documents.filter((d) => d.category === cat).length;
            const labelMap: Record<DocumentCategory, string> = {
              identity: 'Identity Proofs',
              business: 'Business KYC',
              financial: 'Financial & Quotes',
              project: 'Project Report / DPR',
              eligibility: 'Eligibility Proofs',
              property_location: 'Land & Premises',
              other: 'Other Documents'
            };

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-stone-900 text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {labelMap[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Document Checklist Items */}
        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const isGuidanceOpen = !!expandedGuidance[doc.id];
            const isDprDoc = doc.category === 'project';

            return (
              <div
                key={doc.id}
                className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 transition-shadow hover:shadow-2xs space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Document Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-3xs font-bold uppercase tracking-wider text-stone-500">
                        {doc.category.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className={`text-3xs font-bold uppercase ${doc.mandatory ? 'text-amber-800' : 'text-stone-500'}`}>
                        {doc.mandatory ? 'Mandatory' : 'Conditional / If Applicable'}
                      </span>
                      {doc.schemeSpecific && (
                        <>
                          <span aria-hidden="true" className="text-stone-300">·</span>
                          <span className="text-3xs font-bold text-stone-600">Scheme-Specific</span>
                        </>
                      )}
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm leading-snug">
                      {doc.name}
                    </h4>

                    <p className="text-2xs text-stone-600 leading-relaxed">
                      {doc.reason}
                    </p>
                  </div>

                  {/* Right Column: User Declaration Selector */}
                  <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
                    <span className="text-3xs text-stone-500 uppercase font-semibold">
                      Your Status Declaration:
                    </span>

                    <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200/80">
                      <button
                        onClick={() => onDeclarationChange(doc.id, 'available')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          doc.userStatus === 'available'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                        title="Mark document as in your possession"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>I Have It</span>
                      </button>

                      <button
                        onClick={() => onDeclarationChange(doc.id, 'to_prepare')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          doc.userStatus === 'to_prepare' || doc.userStatus === 'missing'
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                        title="Mark document as needing to be prepared or obtained"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Need to Prepare</span>
                      </button>

                      <button
                        onClick={() => onDeclarationChange(doc.id, 'needs_verification')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          doc.userStatus === 'needs_verification' || doc.userStatus === 'required'
                            ? 'bg-stone-800 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                        title="Mark document as uncertain or needing authority clarification"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Not Sure</span>
                      </button>
                    </div>

                    <span className="text-3xs text-stone-500 italic">
                      {doc.userStatus === 'available'
                        ? 'Declared available; ensure it meets official specs'
                        : doc.userStatus === 'to_prepare' || doc.userStatus === 'missing'
                        ? 'Pending acquisition before portal filing'
                        : 'Unverified; check with local bank/office'}
                    </span>
                  </div>
                </div>

                {/* Additional Guidance Toggle */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => toggleGuidance(doc.id)}
                    className="inline-flex items-center gap-1 text-2xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    <span>{isGuidanceOpen ? 'Hide Preparation Guidance' : 'View Preparation Steps & Guidance'}</span>
                    {isGuidanceOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {isDprDoc && (
                    <button
                      onClick={handleCopyDpr}
                      className="inline-flex items-center gap-1 text-2xs font-bold text-stone-800 hover:text-stone-950 underline decoration-stone-300"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Phase 4 DPR Figures</span>
                    </button>
                  )}
                </div>

                {/* Collapsible Preparation Steps */}
                {isGuidanceOpen && (
                  <div className="mt-2 p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-2xs space-y-2">
                    {doc.verificationNote && (
                      <div className="text-stone-700">
                        <strong className="text-stone-900">Verification Advisory: </strong>
                        <span>{doc.verificationNote}</span>
                      </div>
                    )}

                    {doc.preparationSteps && doc.preparationSteps.length > 0 && (
                      <div>
                        <strong className="text-stone-900 block mb-1">Recommended Preparation Steps:</strong>
                        <ul className="space-y-1 pl-4 list-disc text-stone-600">
                          {doc.preparationSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. What You Still Need To Prepare Section */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h3 className="font-heading text-base font-bold text-stone-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <span>Actionable Preparation Checklist</span>
          </h3>
          <p className="text-2xs text-stone-600 mt-0.5">
            Documents marked as needing preparation or verification before initiating your application.
          </p>
        </div>

        {stillNeeded.length === 0 && needingVerification.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>All scheme documents have been marked as available by you. Review application steps below.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {stillNeeded.map((d) => (
              <div key={d.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-900">{d.name}</strong>
                    <span className="text-3xs text-amber-800 uppercase font-bold">Needs Preparation</span>
                  </div>
                  <p className="text-2xs text-stone-600 mt-0.5">{d.reason}</p>
                </div>
              </div>
            ))}

            {needingVerification.map((d) => (
              <div key={d.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-3">
                <HelpCircle className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-900">{d.name}</strong>
                    <span className="text-3xs text-stone-500 uppercase font-bold">Status Unspecified</span>
                  </div>
                  <p className="text-2xs text-stone-500 mt-0.5">
                    {d.verificationNote || 'Verify with your local District Industries Centre (DIC) or nodal branch.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Documented Application Steps */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="border-b border-stone-200 pb-3">
          <h3 className="font-heading text-base font-bold text-stone-900 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-stone-700" />
            <span>Documented Application Workflow</span>
          </h3>
          <p className="text-2xs text-stone-600 mt-0.5">
            Official sequence of submission, scrutiny, and bank sanction per scheme operational guidelines.
          </p>
        </div>

        <ol className="space-y-3 text-xs">
          {plan.applicationSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="h-5 w-5 rounded-full bg-stone-900 text-white text-3xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-stone-800 leading-relaxed font-medium">
                  {step}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 7. Official Portal Channels */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-stone-900 text-sm">Official Government Portals</h4>
          <p className="text-2xs text-stone-600 mt-0.5">
            Only apply through verified government domains or designated public sector bank branches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {plan.officialInformationUrl && (
            <a
              href={plan.officialInformationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Official Information Portal</span>
            </a>
          )}

          {plan.officialApplicationUrl ? (
            <a
              href={plan.officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors shadow-xs ${
                isNotEligible
                  ? 'bg-stone-500 hover:bg-stone-600'
                  : 'bg-stone-900 hover:bg-stone-800'
              }`}
            >
              <span>{isNotEligible ? 'View Application Portal' : 'Apply on Official Portal'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 bg-stone-200/60 px-3 py-2 rounded-xl font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-stone-400" />
              <span>Official application link needs verification</span>
            </span>
          )}
        </div>
      </div>

      {/* 8. Mandatory Legal Disclosure */}
      <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="text-3xs text-stone-500 leading-relaxed">
          <strong>Mandatory Disclosure:</strong> {plan.disclaimer}
        </p>
      </div>

      {/* Printable Modal */}
      {showModal && (
        <ApplicationPreparationModal
          plan={plan}
          businessName={businessName}
          projectCost={projectCost}
          availableCapital={availableCapital}
          financingGap={financingGap}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
