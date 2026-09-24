import React, { useState } from 'react';
import {
  BankAppraisalDossier
} from '../types/bankAppraisal.ts';
import {
  generateBankDossierPlainText
} from '../utils/bankAppraisalEngine.ts';
import {
  formatINR,
  formatINRLakhs
} from '../utils/formatters.ts';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Copy,
  Check,
  Landmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  Layers,
  Building,
  Scale,
  Award
} from 'lucide-react';

interface BankAppraisalCardProps {
  dossier: BankAppraisalDossier;
}

export const BankAppraisalCard: React.FC<BankAppraisalCardProps> = ({ dossier }) => {
  const [copied, setCopied] = useState(false);
  const [expandedInterview, setExpandedInterview] = useState<number | null>(0);

  const handleCopy = () => {
    const text = generateBankDossierPlainText(dossier);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getDscrBadgeColor = (band: string) => {
    switch (band) {
      case 'comfortable':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'marginal':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'high_risk':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  const getDscrLabel = (band: string) => {
    switch (band) {
      case 'comfortable':
        return 'Comfortably Serviceable (≥ 1.50x)';
      case 'marginal':
        return 'Marginal / Scrutiny (1.25x - 1.49x)';
      case 'high_risk':
        return 'High Credit Risk (< 1.25x)';
      default:
        return '100% Equity (Zero Bank Debt)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-emerald-800">
                <Landmark className="h-3 w-3" />
                RBI & CGTMSE Bank Appraisal Norms
              </span>
              <span className="text-2xs text-stone-500 font-mono">
                {dossier.location.district}, {dossier.location.state}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-stone-900 mt-1.5">
              Bank Credit Appraisal & Due Diligence Dossier
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Indicative desk review prepared for commercial bank credit officers and District Industries Centre (DIC) evaluators.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Dossier' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition cursor-pointer shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>

        {/* 4 Core Banking KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* 1. Capital & Debt Outlay */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-2xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Proposed Loan Outlay</span>
              <Building className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <div className="font-heading text-lg font-extrabold text-stone-900 mt-1">
              {formatINR(dossier.bankTermLoanRequired)}
            </div>
            <div className="text-2xs text-stone-600 mt-1">
              Project Outlay: <strong>{formatINRLakhs(dossier.totalProjectCost)}</strong>
              <br />
              Promoter Equity: <strong>{formatINRLakhs(dossier.promoterContribution)}</strong>
            </div>
          </div>

          {/* 2. Margin Compliance */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-2xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Promoter Margin</span>
              <Scale className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-heading text-lg font-extrabold text-stone-900">
                {dossier.marginAssessment.actualMarginPercent}%
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-3xs font-black uppercase border ${
                  dossier.marginAssessment.isCompliant
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}
              >
                {dossier.marginAssessment.isCompliant ? 'Compliant' : 'Shortfall'}
              </span>
            </div>
            <div className="text-2xs text-stone-600 mt-1">
              Mandatory: <strong>{dossier.marginAssessment.requiredMarginPercent}%</strong> ({formatINR(dossier.marginAssessment.requiredMarginAmount)})
              {dossier.marginAssessment.shortfallAmount > 0 && (
                <div className="text-red-700 font-bold mt-0.5">
                  Shortfall: {formatINR(dossier.marginAssessment.shortfallAmount)}
                </div>
              )}
            </div>
          </div>

          {/* 3. DSCR Bankability Band */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-2xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>DSCR Coverage</span>
              <Award className="h-3.5 w-3.5 text-stone-400" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-heading text-lg font-extrabold text-stone-900">
                {dossier.debtServiceCoverageRatio !== null ? `${dossier.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-3xs font-black uppercase border ${getDscrBadgeColor(dossier.dscrComfortBand)}`}>
                {dossier.dscrComfortBand}
              </span>
            </div>
            <div className="text-2xs text-stone-600 mt-1 leading-tight">
              {getDscrLabel(dossier.dscrComfortBand)}
            </div>
          </div>

          {/* 4. Credit Guarantee */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-2xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
              <span>Credit Guarantee</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-heading text-lg font-extrabold text-emerald-900">
                {dossier.creditGuarantee.schemeName}
              </span>
              {dossier.creditGuarantee.isCollateralFreeEligible && (
                <span className="rounded bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 text-3xs font-black uppercase">
                  Collateral-Free
                </span>
              )}
            </div>
            <div className="text-2xs text-stone-600 mt-1">
              Guarantee Cover: <strong>{dossier.creditGuarantee.maxEligibleCoveragePercent}%</strong>
              <br />
              Fee: <span className="font-mono text-3xs">{dossier.creditGuarantee.guaranteeFeeBenchmark}</span>
            </div>
          </div>
        </div>

        {/* Detailed Assessment Notes */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-stone-200 bg-white p-3.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Promoter Margin Appraisal Context</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-2xs">
              {dossier.marginAssessment.complianceNote}
            </p>
            <div className="text-3xs text-stone-500 font-mono mt-2 pt-2 border-t border-stone-100">
              {dossier.marginAssessment.governingNorm}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
              <Landmark className="h-4 w-4 text-emerald-700" />
              <span>Debt Servicing Resilience (DSCR)</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-2xs">
              {dossier.dscrAnalysis}
            </p>
            <div className="text-3xs text-stone-500 font-mono mt-2 pt-2 border-t border-stone-100">
              Statutory Basis: {dossier.creditGuarantee.statutoryReference}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Matched Credit Lines */}
      {dossier.matchedLoans.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-heading text-base font-bold text-stone-900">
              Matched Commercial & Rural Credit Facilities
            </h3>
            <p className="text-xs text-stone-500">
              Institutional credit facilities matching the proposed loan quantum of {formatINR(dossier.bankTermLoanRequired)}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossier.matchedLoans.map((facility, idx) => (
              <div key={idx} className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                      {facility.product.lenderType.replace('_', ' ')}
                    </span>
                    <h4 className="font-heading text-sm font-bold text-stone-900 mt-1">
                      {facility.product.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-3xs text-stone-500 block uppercase">Estimated EMI</span>
                    <span className="font-heading text-sm font-extrabold text-stone-900">
                      {formatINR(facility.estimatedMonthlyEmi)}/mo
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs text-stone-700 pt-2 border-t border-stone-200">
                  <div>
                    <span className="text-stone-500">Interest Spread:</span>{' '}
                    <strong>{facility.interestRateRange}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Max Tenure:</span>{' '}
                    <strong>{facility.indicativeTenureMonths} mo ({facility.moratoriumMonths} mo moratorium)</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-500">Guarantee:</span>{' '}
                    <strong>{facility.product.creditGuaranteeCover}</strong>
                  </div>
                </div>

                <div className="text-2xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200 italic">
                  "{facility.fitRationale}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Phased Disbursement & Capital Drawdown Schedule */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-stone-900">
            Phased Capital Drawdown & Milestone Disbursement Schedule
          </h3>
          <p className="text-xs text-stone-500">
            Standard 4-stage disbursement schedule verifying that tranche amounts sum strictly to the total project outlay of {formatINR(dossier.totalProjectCost)}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold">
                <th className="py-2.5 pr-3">Stage</th>
                <th className="py-2.5 px-3">Milestone & Work Scope</th>
                <th className="py-2.5 px-3">Tranche Amount</th>
                <th className="py-2.5 px-3">Cost Sharing (Equity / Debt)</th>
                <th className="py-2.5 pl-3">Field Inspection Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dossier.disbursementMilestones.map((m) => (
                <tr key={m.stageNumber} className="hover:bg-stone-50/50">
                  <td className="py-3 pr-3 font-bold text-stone-900 align-top">
                    Stage {m.stageNumber}
                  </td>
                  <td className="py-3 px-3 align-top max-w-xs">
                    <div className="font-bold text-stone-900">{m.milestoneName}</div>
                    <div className="text-2xs text-stone-600 mt-0.5">{m.description}</div>
                  </td>
                  <td className="py-3 px-3 align-top font-bold text-stone-900 whitespace-nowrap">
                    {formatINR(m.estimatedTrancheAmount)}
                  </td>
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <div className="text-2xs">
                      <span className="font-bold text-emerald-800">{m.promoterEquitySharePercent}% Equity</span>
                      {' / '}
                      <span className="font-bold text-stone-700">{m.termLoanSharePercent}% Loan</span>
                    </div>
                  </td>
                  <td className="py-3 pl-3 align-top text-2xs text-stone-700">
                    {m.verificationRequired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Statutory Pre-Sanction & Pre-Disbursement Clearances */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-stone-900">
            Statutory & Regulatory Clearances Checklist
          </h3>
          <p className="text-xs text-stone-500">
            Clearances and registrations required by bank circulars prior to loan sanction and fund disbursement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {dossier.statutoryClearances.map((c) => (
            <div key={c.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-3xs font-extrabold uppercase ${
                      c.stage === 'pre_sanction'
                        ? 'bg-blue-100 text-blue-900'
                        : c.stage === 'pre_disbursement'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {c.stage.replace('_', ' ')}
                  </span>
                  <div className="font-bold text-stone-900 mt-1">{c.name}</div>
                  <div className="text-2xs text-stone-500">{c.authority}</div>
                </div>
                {c.portalUrl && (
                  <a
                    href={c.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0"
                  >
                    Official Portal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-2xs text-stone-700 leading-relaxed">
                {c.applicabilityNote}
              </p>
              <div className="text-3xs text-stone-400 font-mono pt-1.5 border-t border-stone-200">
                {c.citation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Bank Branch Interview Preparation Prompts */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading text-base font-bold text-stone-900">
            Bank Branch Interview & Due Diligence Preparation
          </h3>
          <p className="text-xs text-stone-500">
            Typical queries posed by credit officers during physical site inspection and promoter interviews.
          </p>
        </div>

        <div className="space-y-3">
          {dossier.interviewPrompts.map((p, idx) => {
            const isOpen = expandedInterview === idx;
            return (
              <div key={idx} className="rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setExpandedInterview(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100/80 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-white text-2xs font-bold shrink-0">
                      Q{idx + 1}
                    </span>
                    <div>
                      <span className="text-3xs font-extrabold uppercase text-stone-500 block">
                        {p.topic}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {p.question}
                      </span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-stone-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-500 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white border-t border-stone-200 space-y-2 text-xs">
                    <div>
                      <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider block">
                        Credit Appraisal Focus
                      </span>
                      <p className="text-stone-700 text-2xs mt-0.5">
                        {p.riskMitigationContext}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider block">
                        Recommended Evidence / Response
                      </span>
                      <p className="text-stone-800 text-2xs mt-0.5 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200">
                        {p.recommendedResponse}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statutory Regulatory Disclaimer */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-2xs text-stone-600 space-y-1.5">
        <div className="font-bold text-stone-900 flex items-center gap-1.5 uppercase tracking-wider text-3xs">
          <ShieldCheck className="h-4 w-4 text-stone-700" />
          <span>Statutory Regulatory & Banking Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          {dossier.statutoryDisclaimer}
        </p>
      </div>
    </div>
  );
};
