import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Building2,
  Calendar,
  Landmark,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';
import { SchemeMatch } from '../types/scheme.ts';
import { formatINR } from '../utils/formatters.ts';

interface GovernmentSchemeCardProps {
  match: SchemeMatch;
  onSelectForReadiness?: (schemeId: string) => void;
}

export const GovernmentSchemeCard: React.FC<GovernmentSchemeCardProps> = ({ match, onSelectForReadiness }) => {
  const [showDocuments, setShowDocuments] = useState(false);
  const [showVerificationSteps, setShowVerificationSteps] = useState(false);

  const { scheme, status, statusCategory, matchedConditions, unmetConditions, unknownConditions, whyMatched, whyNotMatched, missingInformation, financialFit } = match;

  // Status badge styling & text
  const getStatusBadge = () => {
    switch (statusCategory) {
      case 'eligible':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'Eligibility Conditions Met'
        };
      case 'potentially_eligible':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-600',
          label: 'Potentially Compatible (Verify Specifics)'
        };
      case 'needs_verification':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: 'Needs More Information / Verification'
        };
      case 'not_eligible':
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-300',
          dot: 'bg-stone-500',
          label: 'Not Eligible (Mandatory Criteria Unmet)'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Top Header */}
      <div className="p-5 sm:p-6 border-b border-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
              <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              {scheme.level === 'central' ? 'Central Scheme' : `State Scheme (${scheme.state})`}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-2xs font-semibold bg-stone-50 text-stone-600 border border-stone-200 capitalize">
              Type: {scheme.schemeType.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center text-3xs text-stone-500 gap-1">
            <Calendar className="h-3 w-3" />
            <span>Verified: {match.lastVerifiedDate}</span>
          </div>
        </div>

        <h3 className="font-heading text-lg font-bold text-stone-900 leading-snug">
          {scheme.name} {scheme.shortName && <span className="text-stone-500 font-normal">({scheme.shortName})</span>}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-stone-400" />
            <span>{scheme.administeringAuthority}</span>
          </div>
          {scheme.ministry && (
            <div className="flex items-center gap-1 text-stone-500">
              <Landmark className="h-3.5 w-3.5 text-stone-400" />
              <span>{scheme.ministry}</span>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-stone-600 leading-relaxed">
          {scheme.description}
        </p>
      </div>

      {/* Financial Support Details */}
      <div className="bg-stone-50/60 p-5 sm:p-6 border-b border-stone-100">
        <h4 className="text-2xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
          <IndianRupee className="h-3.5 w-3.5 text-stone-600" />
          Documented Financial Support & Limits
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-3xs text-stone-500 block">Max Documented Loan</span>
            <strong className="text-stone-900 font-bold text-sm block mt-0.5">
              {scheme.financialSupport.maximumLoan !== null && scheme.financialSupport.maximumLoan !== undefined
                ? formatINR(scheme.financialSupport.maximumLoan)
                : 'Needs Verification'}
            </strong>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-3xs text-stone-500 block">Capital Subsidy / Grant</span>
            <strong className="text-emerald-800 font-bold text-sm block mt-0.5">
              {scheme.financialSupport.subsidyPercentage !== null && scheme.financialSupport.subsidyPercentage !== undefined
                ? `${scheme.financialSupport.subsidyPercentage}%`
                : scheme.financialSupport.subsidyAmount !== null && scheme.financialSupport.subsidyAmount !== undefined
                  ? formatINR(scheme.financialSupport.subsidyAmount)
                  : 'N/A (Interest/Credit only)'}
            </strong>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-3xs text-stone-500 block">Interest Subvention / Rate</span>
            <strong className="text-stone-900 font-bold text-sm block mt-0.5">
              {scheme.financialSupport.interestSubventionPercent
                ? `${scheme.financialSupport.interestSubventionPercent}% Subvention`
                : scheme.financialSupport.interestRate
                  ? `${scheme.financialSupport.interestRate}% p.a.`
                  : 'Bank Commercial MCLR'}
            </strong>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-3xs text-stone-500 block">Promoter Margin Required</span>
            <strong className="text-stone-900 font-bold text-sm block mt-0.5">
              {scheme.financialSupport.beneficiaryContributionGeneralPercent !== null && scheme.financialSupport.beneficiaryContributionGeneralPercent !== undefined
                ? `${scheme.financialSupport.beneficiaryContributionGeneralPercent}%${scheme.financialSupport.beneficiaryContributionSpecialPercent ? ` (${scheme.financialSupport.beneficiaryContributionSpecialPercent}% Spl)` : ''}`
                : 'Needs Verification'}
            </strong>
          </div>
        </div>

        {/* Financial fit evaluation on this plan */}
        <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
          financialFit.fitsDocumentedRange === true
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : financialFit.fitsDocumentedRange === false
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          {financialFit.fitsDocumentedRange === true ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : financialFit.fitsDocumentedRange === false ? (
            <XCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
          ) : (
            <HelpCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          )}
          <div className="leading-snug">
            <span className="font-bold">Project Financial Alignment: </span>
            {financialFit.explanation}
          </div>
        </div>
      </div>

      {/* Why Matched / Evaluation Reasons */}
      <div className="p-5 sm:p-6 space-y-4">
        {whyMatched.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              Why This Scheme May Apply
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700 pl-5 list-disc marker:text-emerald-700">
              {whyMatched.map((reason, idx) => (
                <li key={idx} className="leading-relaxed">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {whyNotMatched.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-rose-700" />
              Eligibility Constraints / Why Not Matched
            </h4>
            <ul className="space-y-1.5 text-xs text-rose-900 pl-5 list-disc marker:text-rose-700">
              {whyNotMatched.map((reason, idx) => (
                <li key={idx} className="leading-relaxed">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {missingInformation.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-amber-700 shrink-0" />
              Missing Profile Information Needed to Confirm Eligibility:
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-stone-700 mt-1">
              {missingInformation.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Collapsible Document Checklist */}
        <div className="border-t border-stone-100 pt-4">
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="w-full flex items-center justify-between text-xs font-bold text-stone-800 py-1 hover:text-stone-900"
          >
            <span className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-stone-600" />
              Scheme-Specific Required Documents ({scheme.requiredDocuments.length})
            </span>
            {showDocuments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDocuments && (
            <div className="mt-3 bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 text-xs">
              <p className="text-3xs text-stone-500 mb-2 font-medium">
                Mandatory documents specified in official operational guidelines for this scheme:
              </p>
              <ul className="space-y-1.5 text-stone-700">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-stone-400 font-bold text-3xs mt-0.5">[{idx + 1}]</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Collapsible Verification Checklist */}
        <div className="border-t border-stone-100 pt-3">
          <button
            onClick={() => setShowVerificationSteps(!showVerificationSteps)}
            className="w-full flex items-center justify-between text-xs font-bold text-stone-800 py-1 hover:text-stone-900"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-stone-600" />
              Field Verification Steps Before Applying ({match.verificationSteps.length})
            </span>
            {showVerificationSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showVerificationSteps && (
            <div className="mt-3 bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 text-xs">
              <ul className="space-y-1.5 text-stone-700">
                {match.verificationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 shrink-0 mt-1.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Official External Links & Application Action */}
      <div className="bg-stone-50 p-4 sm:p-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {match.officialInformationUrl && (
            <a
              href={match.officialInformationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 underline decoration-stone-300 underline-offset-4"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Official Portal Information
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSelectForReadiness && (
            <button
              onClick={() => onSelectForReadiness(match.scheme.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-800 bg-white border border-stone-300 hover:bg-stone-100 transition-colors shadow-2xs"
            >
              <ClipboardList className="h-3.5 w-3.5 text-stone-600" />
              <span>Prepare Documents & Checklist</span>
            </button>
          )}

          {match.officialApplicationUrl ? (
            <a
              href={match.officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors shadow-xs"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 bg-stone-200/60 px-3 py-1.5 rounded-xl font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-stone-400" />
              Application link: Needs current verification on department portal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
