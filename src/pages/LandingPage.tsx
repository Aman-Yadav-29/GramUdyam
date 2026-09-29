import React from 'react';
import { Navbar } from '../components/Navbar.tsx';
import { HeroSection } from '../components/HeroSection.tsx';
import { CoreQuestionCard } from '../components/CoreQuestionCard.tsx';
import { PillarsOverview } from '../components/PillarsOverview.tsx';
import { InteractiveDiscoveryPreview } from '../components/InteractiveDiscoveryPreview.tsx';
import { Footer } from '../components/Footer.tsx';
import { 
  Award, 
  BadgePercent, 
  ArrowRight, 
  Building2, 
  ShieldCheck
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAnalysis: () => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToAnalysis,
  onNavigateToLogin
}) => {
  const handleScrollToPillars = () => {
    const el = document.getElementById('pillars');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToDiscovery = () => {
    const el = document.getElementById('discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSchemes = () => {
    const el = document.getElementById('schemes');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const flagshipSchemes = [
    {
      id: 'pmegp',
      name: 'Prime Minister’s Employment Generation Programme',
      shortName: 'PMEGP',
      authority: 'Khadi & Village Industries Commission (KVIC) / DIC',
      subsidy: '15% – 35% Capital Subsidy',
      maxProject: '₹50 Lakhs (Mfg) / ₹20 Lakhs (Service)',
      promoterEquity: '5% (Special) / 10% (General)',
      description: 'Flagship central credit-linked subsidy programme to establish new micro-enterprises in rural & semi-urban manufacturing and service sectors.',
      tags: ['Manufacturing', 'Rural Units', 'Credit-Linked Subsidy']
    },
    {
      id: 'pmfme',
      name: 'PM Formalisation of Micro food processing Enterprises',
      shortName: 'PMFME',
      authority: 'Ministry of Food Processing Industries (MoFPI)',
      subsidy: '35% Capital Subsidy (up to ₹10 Lakhs)',
      maxProject: 'Based on eligible machinery CAPEX',
      promoterEquity: '10% minimum contribution',
      description: 'Specialized scheme for individual micro food processing units, farmer producer organizations (FPOs), and SHGs, prioritized around One District One Product (ODOP).',
      tags: ['Food Processing', 'Agro-Allied', 'ODOP Priority']
    },
    {
      id: 'mudra',
      name: 'Pradhan Mantri MUDRA Yojana',
      shortName: 'PMMY (Mudra)',
      authority: 'National Credit Guarantee Trustee Company (NCGTC)',
      subsidy: 'Collateral-Free Credit Guarantee',
      maxProject: 'Up to ₹10 Lakhs (Shishu / Kishore / Tarun)',
      promoterEquity: 'Zero to minimal margin required',
      description: 'Institutional micro-credit for non-corporate, non-farm small/micro enterprises across public sector banks, RRBs, and micro-finance institutions.',
      tags: ['Collateral-Free', 'Micro Credit', 'Working Capital']
    },
    {
      id: 'aif',
      name: 'Agriculture Infrastructure Fund',
      shortName: 'AIF',
      authority: 'Department of Agriculture & Farmers Welfare',
      subsidy: '3% Interest Subvention (up to 7 yrs)',
      maxProject: 'Term loan up to ₹2 Crore per project',
      promoterEquity: '10% – 15% contribution',
      description: 'Medium-to-long term debt financing facility for post-harvest management infrastructure, cold chains, primary processing, and sorting hubs.',
      tags: ['Post-Harvest', 'Interest Subvention', 'Agri-Infrastructure']
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* User-Facing Navigation */}
      <Navbar
        onNavigateToLogin={onNavigateToLogin}
        onScrollToPillars={handleScrollToPillars}
        onScrollToDiscovery={handleScrollToDiscovery}
        onScrollToSchemes={handleScrollToSchemes}
      />

      {/* Hero Section */}
      <HeroSection
        onStartAnalysis={onNavigateToAnalysis}
      />

      {/* Core Question Highlight Section */}
      <CoreQuestionCard onTriggerAnalysis={handleScrollToDiscovery} />

      {/* Interactive Discovery Sandbox Preview */}
      <InteractiveDiscoveryPreview onFullAnalysis={onNavigateToAnalysis} />

      {/* The 7 Core Pillars Overview */}
      <PillarsOverview onSelectPillar={() => handleScrollToDiscovery()} />

      {/* Government Schemes Showcase Section */}
      <section id="schemes" className="py-16 sm:py-24 bg-white border-b border-stone-200 scroll-mt-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800 mb-2">
                <Award className="h-3.5 w-3.5 text-purple-700" />
                <span>Credit-Linked Government Assistance</span>
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-stone-900 tracking-tight">
                Government Schemes & Capital Subsidies
              </h2>
              <p className="mt-2 text-sm text-stone-600 max-w-2xl leading-relaxed">
                GramUdyam integrates verified central and state credit schemes. Discover your exact eligibility, capital subsidy ceilings, and bank loan structures in minutes.
              </p>
            </div>

            <button
              onClick={onNavigateToAnalysis}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition cursor-pointer self-start md:self-auto shrink-0"
            >
              <span>Check Eligibility For My Project</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flagshipSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="rounded-2xl border border-stone-200 bg-stone-50/40 p-6 sm:p-7 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="font-heading text-lg font-bold text-stone-900">
                      {scheme.shortName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                      <BadgePercent className="h-3.5 w-3.5 text-emerald-700" />
                      <span>{scheme.subsidy}</span>
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-stone-700 mb-1">
                    {scheme.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-2xs text-stone-500 mb-3">
                    <Building2 className="h-3.5 w-3.5 text-stone-400" />
                    <span>{scheme.authority}</span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {scheme.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-2xs bg-white p-3 rounded-xl border border-stone-200/80 mb-4">
                    <div>
                      <span className="text-stone-400 block">Maximum Project Scale:</span>
                      <strong className="text-stone-800 font-semibold">{scheme.maxProject}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Promoter Margin:</span>
                      <strong className="text-emerald-800 font-semibold">{scheme.promoterEquity}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200/70 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.tags.map((tag, idx) => (
                      <span key={idx} className="rounded-md bg-stone-100 px-2 py-0.5 text-3xs font-medium text-stone-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={onNavigateToAnalysis}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition cursor-pointer shrink-0 ml-2"
                  >
                    <span>Analyze Fit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Banner */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Instant Subsidy Evaluation</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold">
                Unsure which subsidy applies to your location and category?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-2xl">
                Our rule engine automatically cross-references your district, enterprise category, and capital to match the highest eligible subsidy.
              </p>
            </div>

            <button
              onClick={onNavigateToAnalysis}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-md hover:bg-emerald-50 transition cursor-pointer shrink-0"
            >
              <span>Start Your Business Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
