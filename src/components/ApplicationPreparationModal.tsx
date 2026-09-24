import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileText, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { SchemeReadinessPlan } from '../types/documentReadiness.ts';
import { formatINR } from '../utils/formatters.ts';

interface ApplicationPreparationModalProps {
  plan: SchemeReadinessPlan;
  businessName: string;
  projectCost: number;
  availableCapital: number;
  financingGap: number;
  onClose: () => void;
}

export const ApplicationPreparationModal: React.FC<ApplicationPreparationModalProps> = ({
  plan,
  businessName,
  projectCost,
  availableCapital,
  financingGap,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const availableDocs = plan.documents.filter((d) => d.userStatus === 'available');
  const toPrepareDocs = plan.documents.filter((d) => d.userStatus === 'to_prepare' || d.userStatus === 'missing');
  const pendingDocs = plan.documents.filter((d) => d.userStatus === 'needs_verification' || d.userStatus === 'required');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textLines = [
      `GRAMUDYAM — APPLICATION PREPARATION SUMMARY`,
      `Document Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `=============================================================`,
      `ENTERPRISE DETAILS:`,
      `• Business Name: ${businessName}`,
      `• Total Project Cost: ${formatINR(projectCost)}`,
      `• Available Capital: ${formatINR(availableCapital)}`,
      `• Financing Gap / Loan Required: ${formatINR(financingGap)}`,
      ``,
      `TARGET GOVERNMENT SCHEME:`,
      `• Scheme: ${plan.schemeName} (${plan.level === 'state' ? `State Scheme: ${plan.state}` : 'Central Scheme'})`,
      `• Administering Authority: ${plan.administeringAuthority}`,
      `• Eligibility Status: ${plan.eligibilityStatus.toUpperCase()}`,
      ``,
      `DOCUMENT READINESS SUMMARY:`,
      `• Total Requirements: ${plan.summary.totalRequired}`,
      `• Marked Available: ${plan.summary.markedAvailable}`,
      `• Need to Prepare: ${plan.summary.needToPrepare}`,
      `• Needs Verification: ${plan.summary.needVerification}`,
      ``,
      `DOCUMENTS MARKED AVAILABLE BY YOU:`,
      availableDocs.length > 0
        ? availableDocs.map((d, i) => `  ${i + 1}. [Available] ${d.name} (${d.category})`).join('\n')
        : '  (None marked available yet)',
      ``,
      `DOCUMENTS STILL NEEDED / TO PREPARE:`,
      toPrepareDocs.length > 0
        ? toPrepareDocs.map((d, i) => `  ${i + 1}. [To Prepare] ${d.name} (${d.category}) - ${d.reason}`).join('\n')
        : '  (None in to-prepare list)',
      ``,
      `DOCUMENTS NEEDING FIELD / AUTHORITY VERIFICATION:`,
      pendingDocs.length > 0
        ? pendingDocs.map((d, i) => `  ${i + 1}. [Verify] ${d.name} - ${d.verificationNote || 'Verify with authority'}`).join('\n')
        : '  (None in verification list)',
      ``,
      `OFFICIAL APPLICATION PROCESS STEPS:`,
      plan.applicationSteps.map((step, i) => `  Step ${i + 1}: ${step}`).join('\n'),
      ``,
      `OFFICIAL PORTALS:`,
      `• Information: ${plan.officialInformationUrl}`,
      `• Application: ${plan.officialApplicationUrl || 'Needs field verification on department portal'}`,
      ``,
      `=============================================================`,
      `DISCLAIMER: This document is an organizational preparation summary`,
      `for personal record keeping. It is NOT an official government application`,
      `form or guarantee of scheme sanction or subsidy release.`
    ].join('\n');

    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50 print:bg-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <FileText className="h-4 w-4 text-stone-600" />
              <span>Application Preparation Dossier</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              {plan.schemeName}
            </h2>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Summary' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-800">
          {/* Important Notice */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-stone-600 shrink-0 mt-0.5" />
            <div className="text-2xs text-stone-600 leading-relaxed">
              <strong>Personal Planning Summary:</strong> This dossier is an organizational tool to help you gather required paperwork before visiting a bank branch or logging into the government portal. It does not replace official submission forms.
            </div>
          </div>

          {/* Financial Architecture Overview */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-stone-200 bg-stone-50 text-center">
            <div>
              <span className="text-3xs text-stone-500 uppercase block font-semibold">Total Project Cost</span>
              <strong className="text-sm text-stone-900 font-bold block">{formatINR(projectCost)}</strong>
            </div>
            <div className="border-x border-stone-200">
              <span className="text-3xs text-stone-500 uppercase block font-semibold">Promoter Equity</span>
              <strong className="text-sm text-stone-700 font-bold block">{formatINR(availableCapital)}</strong>
            </div>
            <div>
              <span className="text-3xs text-stone-500 uppercase block font-semibold">Financing Gap / Debt</span>
              <strong className="text-sm text-amber-900 font-black block">{formatINR(financingGap)}</strong>
            </div>
          </div>

          {/* Document Breakdown */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1.5">
              1. Document Checklist Status
            </h3>

            {/* Available */}
            <div>
              <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                <span>Marked Available by You ({availableDocs.length})</span>
              </h4>
              {availableDocs.length > 0 ? (
                <ul className="space-y-1.5">
                  {availableDocs.map((d) => (
                    <li key={d.id} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start justify-between gap-2">
                      <span className="font-medium text-stone-900">{d.name}</span>
                      <span className="text-3xs text-emerald-700 uppercase font-bold shrink-0">{d.category}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500 italic">No documents marked available yet.</p>
              )}
            </div>

            {/* To Prepare */}
            <div>
              <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <span>Need to Prepare / Obtain ({toPrepareDocs.length})</span>
              </h4>
              {toPrepareDocs.length > 0 ? (
                <ul className="space-y-2">
                  {toPrepareDocs.map((d) => (
                    <li key={d.id} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-stone-900">{d.name}</span>
                        <span className="text-3xs text-amber-800 uppercase font-bold shrink-0">{d.category}</span>
                      </div>
                      <p className="text-stone-600 text-2xs">{d.reason}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500 italic">No documents currently pending preparation.</p>
              )}
            </div>

            {/* Needs Verification */}
            <div>
              <h4 className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                <span>Needs Verification / Unspecified ({pendingDocs.length})</span>
              </h4>
              {pendingDocs.length > 0 ? (
                <ul className="space-y-1.5">
                  {pendingDocs.map((d) => (
                    <li key={d.id} className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-start justify-between gap-2">
                      <span className="font-medium text-stone-800">{d.name}</span>
                      <span className="text-3xs text-stone-500 uppercase font-bold shrink-0">{d.category}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500 italic">All requirements reviewed.</p>
              )}
            </div>
          </div>

          {/* Application Steps */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1.5">
              2. Documented Application Steps
            </h3>
            <ol className="space-y-2 list-decimal list-inside">
              {plan.applicationSteps.map((step, idx) => (
                <li key={idx} className="text-stone-700 leading-relaxed">
                  <span className="font-medium text-stone-900">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Official URLs */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <h3 className="font-bold text-stone-900 text-xs">Official Portal Links</h3>
            <div className="space-y-1">
              <div>
                <span className="text-stone-500">Official Information: </span>
                <a
                  href={plan.officialInformationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-stone-900 underline inline-flex items-center gap-1"
                >
                  <span>{plan.officialInformationUrl}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {plan.officialApplicationUrl ? (
                <div>
                  <span className="text-stone-500">Official Application: </span>
                  <a
                    href={plan.officialApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-stone-900 underline inline-flex items-center gap-1"
                  >
                    <span>{plan.officialApplicationUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <p className="text-stone-500 italic">Official application link needs field verification on department portal.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between print:hidden">
          <span className="text-3xs text-stone-500">
            GramUdyam Phase 8 Application Readiness Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
