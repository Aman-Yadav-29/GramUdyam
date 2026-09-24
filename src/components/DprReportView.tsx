import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  Building2,
  MapPin,
  Calculator,
  Landmark,
  FileCheck,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Filter
} from 'lucide-react';
import { DetailedProjectReport, DprSectionItem, DprSectionCategory } from '../types/dpr.ts';
import { formatINR, formatPercent, formatRatio } from '../utils/formatters.ts';
import { downloadDprAsHtml, downloadDprAsText, copyDprToClipboard } from '../utils/exportDpr.ts';

interface DprReportViewProps {
  dpr: DetailedProjectReport;
  onNavigateTab?: (tab: string) => void;
}

export const DprReportView: React.FC<DprReportViewProps> = ({ dpr, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Category filter definitions
  const categories: Array<{ id: string; label: string; count: number }> = useMemo(() => {
    const counts: Record<string, number> = { all: dpr.sections.length };
    dpr.sections.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });

    return [
      { id: 'all', label: 'All 25 Sections', count: dpr.sections.length },
      { id: 'financial', label: 'Financial Engine', count: counts['financial'] || 0 },
      { id: 'technical', label: 'Technical & Equipment', count: counts['technical'] || 0 },
      { id: 'financing', label: 'Financing & Schemes', count: counts['financing'] || 0 },
      { id: 'strategy', label: 'Business & Market', count: counts['strategy'] || 0 },
      { id: 'compliance', label: 'Eligibility & Docs', count: counts['compliance'] || 0 },
      { id: 'risk', label: 'Risks & Mitigation', count: counts['risk'] || 0 },
      { id: 'execution', label: 'Timeline & Steps', count: counts['execution'] || 0 }
    ];
  }, [dpr.sections]);

  // Filtered sections
  const filteredSections = useMemo(() => {
    return dpr.sections.filter((sec) => {
      const matchesCategory = selectedCategory === 'all' || sec.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        sec.title.toLowerCase().includes(query) ||
        sec.subtitle.toLowerCase().includes(query) ||
        sec.summary.toLowerCase().includes(query) ||
        sec.paragraphs.some((p) => p.toLowerCase().includes(query))
      );
    });
  }, [dpr.sections, selectedCategory, searchQuery]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => setCollapsedSections({});
  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    dpr.sections.forEach((s) => {
      all[s.id] = true;
    });
    setCollapsedSections(all);
  };

  const handleCopy = async () => {
    const success = await copyDprToClipboard(dpr);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      {/* 1. Master Header Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs print:border-none print:p-0 print:shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-stone-200 pb-6 print:pb-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-emerald-950">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-800" />
                Detailed Project Report (DPR)
              </span>
              <span className="text-3xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                25 Standardized Bank Chapters
              </span>
              <span className="text-3xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Version {dpr.version}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
              {dpr.metadata.projectTitle}
            </h1>

            <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
              <span className="font-semibold text-stone-800 capitalize">
                {dpr.metadata.enterpriseCategory.replace('_', ' ')}
              </span>
              <span className="text-stone-300">•</span>
              <span>
                Scale: <strong className="text-emerald-900">{dpr.metadata.scale}</strong>
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                <strong>{dpr.metadata.location.district}, {dpr.metadata.location.state}</strong>
                <span className="text-3xs uppercase bg-stone-100 px-1.5 py-0.5 rounded font-bold text-stone-600">
                  {dpr.metadata.location.locationType}
                </span>
              </span>
              <span className="text-stone-300">•</span>
              <span>Promoter: <strong>{dpr.metadata.promoterName}</strong></span>
            </div>
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="flex items-center gap-2 flex-wrap print:hidden shrink-0">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Print formatted DPR or Save as PDF"
            >
              <Printer className="h-4 w-4 text-stone-600" />
              <span>Print / PDF</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              >
                <Download className="h-4 w-4 text-stone-600" />
                <span>Export DPR</span>
                <ChevronDown className="h-3 w-3 text-stone-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg z-20 text-xs">
                  <button
                    onClick={() => {
                      downloadDprAsHtml(dpr);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition cursor-pointer flex items-center justify-between"
                  >
                    <span>Printable HTML (.html)</span>
                    <span className="text-3xs text-stone-400">A4 Format</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadDprAsText(dpr);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition cursor-pointer flex items-center justify-between"
                  >
                    <span>Structured Text (.txt)</span>
                    <span className="text-3xs text-stone-400">Clean ASCII</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-stone-600" />}
              <span>{copied ? 'DPR Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* 2. Key Financial Indicators Ribbon (Phase 4 Invariants) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold uppercase tracking-wider text-stone-400">Total Project Cost</span>
            <div className="text-base sm:text-lg font-extrabold text-stone-900 mt-0.5">
              {formatINR(dpr.financialSummary.totalProjectCost)}
            </div>
            <div className="text-3xs text-stone-500">CapEx + Working Capital</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800">Promoter Equity</span>
            <div className="text-base sm:text-lg font-extrabold text-emerald-950 mt-0.5">
              {formatINR(dpr.financialSummary.promoterContribution)}
            </div>
            <div className="text-3xs text-emerald-700 font-semibold">
              {dpr.financialSummary.promoterContributionPercent}% Equity Margin
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold uppercase tracking-wider text-amber-800">Financing Gap</span>
            <div className="text-base sm:text-lg font-extrabold text-amber-950 mt-0.5">
              {formatINR(dpr.financialSummary.financingGap)}
            </div>
            <div className="text-3xs text-stone-500">Bank Loan / Subsidy</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold uppercase tracking-wider text-stone-400">Monthly Turnover</span>
            <div className="text-base sm:text-lg font-extrabold text-stone-900 mt-0.5">
              {formatINR(dpr.financialSummary.monthlyRevenue)}
            </div>
            <div className="text-3xs text-stone-500">Normal Capacity Run</div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800">Monthly PAT</span>
            <div className="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5">
              {formatINR(dpr.financialSummary.monthlyNetProfit)}
            </div>
            <div className="text-3xs text-stone-500 font-medium">
              Margin: {dpr.financialSummary.netMarginPercent.toFixed(1)}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-3xs font-bold uppercase tracking-wider text-stone-400">DSCR & Break-Even</span>
            <div className="text-base sm:text-lg font-extrabold text-emerald-900 mt-0.5">
              {dpr.financialSummary.debtServiceCoverageRatio ? `${dpr.financialSummary.debtServiceCoverageRatio.toFixed(2)}x` : 'No Debt'}
            </div>
            <div className="text-3xs text-stone-500 font-medium">
              BEP: {dpr.financialSummary.breakEvenCapacityPercent ? `${dpr.financialSummary.breakEvenCapacityPercent.toFixed(0)}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation Index (Pills 1..25) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs print:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
            <Layers className="h-4 w-4 text-emerald-800" />
            <span>25-Section DPR Navigator</span>
          </div>
          <div className="flex items-center gap-3 text-2xs">
            <button
              onClick={expandAll}
              className="text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={collapseAll}
              className="text-stone-500 hover:text-stone-700 font-semibold cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Quick jump pills grid */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {dpr.sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-3xs font-semibold text-stone-700 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 shrink-0"
              title={`${sec.title} — ${sec.subtitle}`}
            >
              <span className="font-bold text-emerald-800">{sec.sectionNumber}.</span>
              <span>{sec.shortTitle}</span>
            </button>
          ))}
        </div>

        {/* Filter bar & Search */}
        <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-2xs">
            <Filter className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-3xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search in 25 chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-2xs text-stone-800 focus:outline-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* 4. The 25 DPR Chapter Cards */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const isCollapsed = Boolean(collapsedSections[sec.id]);

          return (
            <section
              key={sec.id}
              id={sec.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs transition hover:border-stone-300 print:border-b print:border-stone-200 print:shadow-none print:p-3"
            >
              {/* Header */}
              <div
                onClick={() => toggleSection(sec.id)}
                className="flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-extrabold shadow-2xs">
                    {sec.sectionNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading text-base sm:text-lg font-bold text-stone-900">
                        {sec.title}
                      </h2>
                      <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {sec.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{sec.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1 print:hidden">
                  <span className="text-3xs text-stone-400 font-mono hidden sm:inline">
                    {sec.sourceOfTruth}
                  </span>
                  <div className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100">
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              {/* Section Body */}
              {!isCollapsed && (
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-4 text-xs text-stone-700">
                  {/* Paragraphs */}
                  <div className="space-y-2 leading-relaxed">
                    {sec.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {/* Bullet Points */}
                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 list-disc list-inside bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
                      {sec.bulletPoints.map((bp, idx) => (
                        <li key={idx} className="text-stone-800 leading-normal">
                          {bp}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Key Metrics Badges */}
                  {sec.metrics && sec.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                      {sec.metrics.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border ${
                            m.highlight
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <span className="text-3xs font-bold uppercase tracking-wider text-stone-500 block">
                            {m.label}
                          </span>
                          <div className={`text-sm font-extrabold mt-0.5 ${m.highlight ? 'text-emerald-950' : 'text-stone-900'}`}>
                            {m.value}
                          </div>
                          {m.note && <div className="text-3xs text-stone-400 mt-0.5">{m.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tables */}
                  {sec.tables && sec.tables.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {sec.tables.map((tbl, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <span className="text-2xs font-bold text-stone-800 block">
                            {tbl.title}
                          </span>
                          <div className="overflow-x-auto border border-stone-200 rounded-xl">
                            <table className="w-full text-2xs text-left">
                              <thead className="bg-stone-100/70 text-stone-700 font-bold uppercase text-3xs border-b border-stone-200">
                                <tr>
                                  {tbl.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="py-2.5 px-3">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-200">
                                {tbl.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-stone-50/60">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="py-2 px-3 text-stone-800">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                              {tbl.footers && tbl.footers.length > 0 && (
                                <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-300">
                                  <tr>
                                    {tbl.footers.map((f, fIdx) => (
                                      <td key={fIdx} className="py-2 px-3 text-stone-900">
                                        {f}
                                      </td>
                                    ))}
                                  </tr>
                                </tfoot>
                              )}
                            </table>
                          </div>
                          {tbl.notes && (
                            <div className="text-3xs text-stone-400 italic px-1">
                              Note: {tbl.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footnote Source Tag */}
                  <div className="pt-2 flex items-center justify-between text-3xs text-stone-400 border-t border-stone-100">
                    <span>Source: {sec.sourceOfTruth}</span>
                    <span className="text-emerald-800 font-semibold font-mono">
                      Invariant Financial Engine Value
                    </span>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 5. Statutory Banking Disclosures Card */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-xs space-y-3 text-xs text-amber-950">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <span>Statutory Banking &amp; Regulatory Disclosures</span>
        </div>

        <div className="space-y-2 text-3xs text-amber-900/90 leading-relaxed">
          {dpr.disclosures.map((d) => (
            <div key={d.id} className="p-2.5 rounded-lg bg-white/70 border border-amber-200">
              <strong className="block text-amber-950 mb-0.5">{d.title}</strong>
              <p>{d.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-2 text-3xs text-stone-400 font-mono">
          GramUdyam Detailed Project Report Blueprint &bull; Suitable for Bank Submission &amp; DIC Scheme Processing
        </div>
      </div>
    </div>
  );
};
