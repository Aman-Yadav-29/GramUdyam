import React, { useState } from 'react';
import {
  Sprout,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  MapPin,
  Compass,
  FileText,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  AgriLocationAnalysis,
  AgriFactorEvaluation,
  AgriFactorStatus,
  AgriVerificationPriority
} from '../types/agriLocation.ts';

interface AgricultureLocationAnalysisCardProps {
  analysis: AgriLocationAnalysis;
  className?: string;
}

export const AgricultureLocationAnalysisCard: React.FC<AgricultureLocationAnalysisCardProps> = ({
  analysis,
  className = ''
}) => {
  const [filterStatus, setFilterStatus] = useState<AgriFactorStatus | 'all'>('all');
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const toggleFactorExpand = (factorKey: string) => {
    setExpandedFactor((prev) => (prev === factorKey ? null : factorKey));
  };

  const statusBadge = (status: AgriFactorStatus) => {
    switch (status) {
      case 'supportive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            Supportive
          </span>
        );
      case 'mixed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
            Mixed
          </span>
        );
      case 'concern':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-900 border border-rose-200">
            <AlertCircle className="h-3.5 w-3.5 text-rose-700" />
            Concern
          </span>
        );
      case 'unknown':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-700 border border-stone-200">
            <HelpCircle className="h-3.5 w-3.5 text-stone-500" />
            Unknown
          </span>
        );
    }
  };

  const priorityBadge = (priority: AgriVerificationPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-2xs font-bold text-rose-700 border border-rose-200 uppercase tracking-wider">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-2xs font-bold text-amber-800 border border-amber-200 uppercase tracking-wider">
            Medium Priority
          </span>
        );
      case 'routine':
        return (
          <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-2xs font-bold text-stone-700 border border-stone-200 uppercase tracking-wider">
            Routine Check
          </span>
        );
    }
  };

  const filteredFactors = analysis.factors.filter((f) => {
    if (filterStatus === 'all') return true;
    return f.status === filterStatus;
  });

  const supportiveCount = analysis.factors.filter((f) => f.status === 'supportive').length;
  const mixedCount = analysis.factors.filter((f) => f.status === 'mixed').length;
  const concernCount = analysis.factors.filter((f) => f.status === 'concern').length;
  const unknownCount = analysis.factors.filter((f) => f.status === 'unknown').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Header Container */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 mb-2 border border-emerald-200">
              <Sprout className="h-4 w-4 text-emerald-700" />
              <span>Agriculture-Specific Location Analysis</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
              {analysis.businessName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-stone-500" />
                <strong>{analysis.location.district}</strong>, {analysis.location.state}
                {analysis.location.subDistrictOrBlock && ` (${analysis.location.subDistrictOrBlock} Block)`}
              </span>
              <span className="text-stone-300">•</span>
              <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                <Layers className="h-3 w-3 text-stone-500" />
                Analysis based on: <strong>District-level benchmark</strong>
              </span>
            </div>
          </div>

          {/* Quick Factor Count Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <span className="font-bold">{supportiveCount}</span> Supportive
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
              <span className="font-bold">{mixedCount}</span> Mixed
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900 border border-rose-200">
              <span className="font-bold">{concernCount}</span> Concern
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 border border-stone-200">
              <span className="font-bold">{unknownCount}</span> Unknown
            </span>
          </div>
        </div>

        {/* Score Disclosure Banner */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-700 flex items-start gap-3">
          <Info className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-stone-900">{analysis.scoreDisclosure}</p>
            <p className="text-stone-500">{analysis.resolutionDisclosure}</p>
          </div>
        </div>

        {/* 2-Column Summary: Why this location may suit vs Why it may not suit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Why this location may suit */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <span>Why This Location May Suit</span>
            </div>
            {analysis.whyMaySuit.length > 0 ? (
              <ul className="space-y-2">
                {analysis.whyMaySuit.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 leading-relaxed">
                    <span className="text-emerald-700 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-500 italic">
                No specific supportive factors identified in available district records.
              </p>
            )}
          </div>

          {/* Why this location may not suit */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span>Why This Location May Not Suit / Trade-offs</span>
            </div>
            {analysis.whyMayNotSuit.length > 0 ? (
              <ul className="space-y-2">
                {analysis.whyMayNotSuit.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 leading-relaxed">
                    <span className="text-amber-700 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">
                No severe constraints or trade-offs recorded in benchmark data.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Factor-By-Factor Analysis Breakdown */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-heading text-lg font-bold text-stone-900">
              Factor-by-Factor Evaluation
            </h3>
            <p className="text-xs text-stone-500">
              Detailed findings, official benchmark sources, and specific local verification checks for {analysis.businessName}.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(['all', 'supportive', 'mixed', 'concern', 'unknown'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 text-2xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-emerald-900 shadow-2xs ring-1 ring-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Factors List */}
        <div className="space-y-3">
          {filteredFactors.map((item) => {
            const isExpanded = expandedFactor === item.factor;

            return (
              <div
                key={item.factor}
                className="rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300"
              >
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                  onClick={() => toggleFactorExpand(item.factor)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-stone-900">{item.factorLabel}</span>
                    {statusBadge(item.status)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xs text-stone-400 hidden sm:inline">
                      {isExpanded ? 'Click to collapse' : 'Click to inspect evidence'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-stone-400" />
                    )}
                  </div>
                </div>

                {/* Finding */}
                <p className="text-xs text-stone-700 mt-2 leading-relaxed">{item.finding}</p>

                {/* Expanded Details: Evidence, Screening Basis, Local Verification */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-100 space-y-3 bg-stone-50/60 -mx-4 -mb-4 p-4 rounded-b-xl">
                    {/* Screening Basis */}
                    <div>
                      <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">
                        Screening Basis:
                      </span>
                      <p className="text-xs text-stone-700 mt-0.5">{item.screeningBasis}</p>
                    </div>

                    {/* Evidence with Provenance */}
                    {item.evidence && item.evidence.length > 0 && (
                      <div>
                        <span className="text-2xs font-bold text-stone-500 uppercase tracking-wider">
                          Benchmark Evidence & Data Provenance:
                        </span>
                        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.evidence.map((ev, evIdx) => (
                            <div
                              key={evIdx}
                              className="rounded-lg border border-stone-200 bg-white p-2.5 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-2xs text-stone-500">
                                <span className="font-semibold text-stone-800">{ev.label}</span>
                                <span>{ev.geographicLevel}</span>
                              </div>
                              <div className="font-bold text-stone-900 text-sm">{ev.value}</div>
                              <div className="text-2xs text-stone-500 flex items-center justify-between pt-1 border-t border-stone-100">
                                <span>Source: {ev.source}</span>
                                <span>Year: {ev.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* What to Verify Locally */}
                    <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-2.5 text-xs text-emerald-950">
                      <span className="font-bold text-2xs text-emerald-800 uppercase tracking-wider block mb-0.5">
                        Local Verification Required:
                      </span>
                      <span>{item.verifyLocally}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prioritized What to Verify Locally Section */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <ShieldAlert className="h-5 w-5 text-emerald-700" />
          <div>
            <h3 className="font-heading text-lg font-bold text-stone-900">
              What You Should Verify Locally Before Investing
            </h3>
            <p className="text-xs text-stone-500">
              Prioritized practical checklist to validate on-site before deploying capital or acquiring land.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {analysis.whatToVerifyLocally.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">{item.factorLabel}</span>
                  {priorityBadge(item.priority)}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{item.practicalAction}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
