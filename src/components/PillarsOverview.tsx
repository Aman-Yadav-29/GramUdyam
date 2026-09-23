import React from 'react';
import { 
  Compass, 
  WalletCards, 
  MapPin, 
  LineChart, 
  Award, 
  BadgePercent, 
  FileCheck2,
  Check,
  ChevronRight
} from 'lucide-react';

interface PillarsOverviewProps {
  onSelectPillar: (pillarKey: string) => void;
}

export const PillarsOverview: React.FC<PillarsOverviewProps> = ({ onSelectPillar }) => {
  const pillars = [
    {
      id: 'business_discovery',
      title: '1. Business Discovery',
      subtitle: 'Capital-to-Idea Matching',
      icon: Compass,
      color: 'emerald',
      description: 'Discovers high-probability micro and small enterprises achievable within your real pocket equity. Filters out non-viable projects before capital is wasted.',
      features: [
        'Matches equity with bank debt capacity (1:4 to 1:9 leverage)',
        'Classifies manufacturing, food processing & rural services',
        'Benchmarks typical gestation and break-even periods'
      ]
    },
    {
      id: 'budget_analysis',
      title: '2. Budget Analysis',
      subtitle: 'Transparent CAPEX & OPEX',
      icon: WalletCards,
      color: 'blue',
      description: 'Breaks down every rupee into capital expenditure (plant, machinery, civil works) versus rolling operating capital (raw materials, wages, power, transport).',
      features: [
        'Machinery & electrification cost allocations',
        '30-to-90 day working capital cycle estimation',
        'Contingency reserves for pre-operative trials'
      ]
    },
    {
      id: 'location_intelligence',
      title: '3. Location Intelligence',
      subtitle: 'GIS Catchment & Resource Matching',
      icon: MapPin,
      color: 'amber',
      description: 'Synthesizes district-level agro-climatic zones, crop surpluses, power reliability, transport arteries, and DIC industrial infrastructure.',
      features: [
        'Identifies raw material surplus in your district',
        'Evaluates power & water availability indices',
        'Maps Lead District Bank and DIC nodal offices'
      ]
    },
    {
      id: 'financial_planning',
      title: '4. Financial Planning',
      subtitle: 'Bank-Grade Projections',
      icon: LineChart,
      color: 'indigo',
      description: 'Generates bankable financial models including 1-year P&L, Debt Service Coverage Ratio (DSCR > 1.5), Break-Even Analysis, and Payback Timeline.',
      features: [
        'Strict DSCR modeling for bank loan sanctioning',
        'Break-even sales threshold calculations',
        'Return on Investment (ROI) and payback periods'
      ]
    },
    {
      id: 'government_schemes',
      title: '5. Government Schemes',
      subtitle: 'Subsidy Maximization Engine',
      icon: Award,
      color: 'purple',
      description: 'Automatically calculates eligible central and state subsidies under PMEGP (15% - 35%), PMFME (35% food processing), AIF, and Stand-Up India.',
      features: [
        'Differential rural vs urban subsidy percentages',
        'Special category concessions (SC/ST/Women/OBC)',
        'Credit-linked capital subsidy ceilings'
      ]
    },
    {
      id: 'loan_options',
      title: '6. Loan Options',
      subtitle: 'Institutional Credit Sizing',
      icon: BadgePercent,
      color: 'teal',
      description: 'Compares real loan products from Public Sector Banks, Regional Rural Banks (RRB), and MUDRA (Shishu, Kishore, Tarun) with exact monthly EMI schedules.',
      features: [
        'Collateral-free credit under CGFMU & CGTMSE',
        'Tenure options up to 84 months with moratorium',
        'Prescribed document checklist for branch managers'
      ]
    },
    {
      id: 'business_planning',
      title: '7. Business Planning & DPR',
      subtitle: 'Structured Bankable Execution',
      icon: FileCheck2,
      color: 'stone',
      description: 'Compiles technical parameters, promoter background, and financial statements into a formal Detailed Project Report (DPR) format ready for DIC submission.',
      features: [
        'Chronological roadmap: Udyam to loan disbursement',
        'Structured DPR chapters compliant with DIC norms',
        'Extensible for AI-guided advisory and saved plans'
      ]
    }
  ];

  return (
    <section id="pillars" className="py-16 sm:py-24 bg-stone-50 border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            System Architecture & Core Capabilities
          </h2>
          <p className="mt-2 font-heading text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            The 7 Pillars of GramUdyam
          </p>
          <p className="mt-4 text-base text-stone-600 leading-relaxed">
            Every module in GramUdyam functions as an interconnected decision engine, transforming fragmented schemes and vague budgets into an airtight enterprise proposition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                id={`pillar-card-${pillar.id}`}
                className="group relative rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-900 group-hover:bg-emerald-700 group-hover:text-white transition">
                      <Icon className="h-6 w-6 stroke-[2]" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
                      {pillar.subtitle}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition">
                    {pillar.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-stone-600 leading-relaxed">
                    {pillar.description}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-stone-100 pt-4">
                    {pillar.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectPillar(pillar.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition cursor-pointer"
                  >
                    <span>Test in Sandbox</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
