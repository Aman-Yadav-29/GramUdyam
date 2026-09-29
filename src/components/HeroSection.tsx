import React from 'react';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onStartAnalysis: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAnalysis
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/60 via-stone-50 to-stone-50 pt-12 pb-16 md:pt-20 md:pb-24 border-b border-stone-200/60">
      {/* Subtle backdrop grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-600/30 mb-6 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>National MSME & Rural Enterprise Intelligence Engine</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12]"
          >
            Turn Your Business Idea <br className="hidden sm:inline" />
            <span className="text-emerald-800">Into a Practical Plan.</span>
          </motion.h1>

          {/* Supporting message explicitly covering all 7 pillars */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-stone-700 leading-relaxed max-w-3xl mx-auto font-normal"
          >
            GramUdyam gives rural and semi-urban entrepreneurs an end-to-end roadmap by uniting{' '}
            <strong className="font-semibold text-stone-900">business discovery</strong>, rigorous{' '}
            <strong className="font-semibold text-stone-900">budget analysis</strong>, district-level{' '}
            <strong className="font-semibold text-stone-900">location intelligence</strong>, bankable{' '}
            <strong className="font-semibold text-stone-900">financial planning</strong>, verified{' '}
            <strong className="font-semibold text-stone-900">government schemes</strong>, tailored{' '}
            <strong className="font-semibold text-stone-900">loan options</strong>, and structured{' '}
            <strong className="font-semibold text-stone-900">business planning</strong>.
          </motion.p>

          {/* Action CTA - Single dominant primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-9 flex items-center justify-center"
          >
            <button
              id="hero-primary-cta"
              onClick={onStartAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-emerald-700/35 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <span>Start Your Business Analysis</span>
              <ArrowRight className="h-5 w-5 stroke-[2.3]" />
            </button>
          </motion.div>

          {/* Assurance note */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-stone-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>Instant Feasibility Calculations</span>
            </span>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>PMEGP & PMFME Subsidies Included</span>
            </span>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>RBI & DIC Guideline Compliant</span>
            </span>
          </div>
        </div>

        {/* Quick Stats Metric strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Coverage
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-stone-900">
              All Indian Districts
            </div>
            <p className="mt-0.5 text-xs text-stone-500">Geo & raw-material intelligence</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Government Schemes
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-emerald-700">
              Up to 35% Subsidy
            </div>
            <p className="mt-0.5 text-xs text-stone-500">PMEGP, PMFME, AIF & Mudra</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Financing Scale
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-stone-900">
              ₹50,000 to ₹50 Lakh+
            </div>
            <p className="mt-0.5 text-xs text-stone-500">Collateral-free credit options</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Analysis Speed
            </div>
            <div className="mt-1 font-heading text-xl font-bold text-stone-900">
              Instant Bankable DPR
            </div>
            <p className="mt-0.5 text-xs text-stone-500">CAPEX, OPEX, DSCR, EMI</p>
          </div>
        </div>
      </div>
    </section>
  );
};
