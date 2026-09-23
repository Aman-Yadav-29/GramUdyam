import React from 'react';
import { ArrowRight, UserCheck, ShieldCheck, Sparkles, CheckCircle, IndianRupee, MapPin, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth.ts';

interface HeroSectionProps {
  onStartAnalysis: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onContinueGuest: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartAnalysis,
  onOpenAuth,
  onContinueGuest
}) => {
  const { isGuest, user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100/60 via-stone-50 to-stone-50 pt-12 pb-16 md:pt-20 md:pb-24 border-b border-stone-200/60">
      {/* Subtle architectural backdrop */}
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

          {/* Headline - Exact required text */}
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

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            {/* Primary CTA - Exact required text */}
            <button
              id="hero-primary-cta"
              onClick={onStartAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-emerald-700/35 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <span>Start Your Business Analysis</span>
              <ArrowRight className="h-5 w-5 stroke-[2.3]" />
            </button>

            {/* Login / Create Account / Guest buttons */}
            <div className="flex w-full sm:w-auto items-center justify-center gap-2 pt-2 sm:pt-0">
              <button
                id="hero-continue-guest-button"
                onClick={onContinueGuest}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3.5 text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 hover:border-stone-400 transition cursor-pointer"
                title="No login required to evaluate business ideas"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>Continue as Guest</span>
              </button>

              <button
                id="hero-login-button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-100 px-4 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
              >
                <span>Login</span>
              </button>

              <button
                id="hero-create-account-button"
                onClick={() => onOpenAuth('register')}
                className="hidden lg:inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-100 px-4 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
              >
                <span>Create Account</span>
              </button>
            </div>
          </motion.div>

          {/* Friction-Free Assurance note */}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs font-medium text-stone-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>Login Not Mandatory</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>PMEGP & PMFME Subsidies Included</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>RBI & DIC Guideline Compliant</span>
            </span>
          </div>
        </div>

        {/* Quick Stats Metric strip (anti-slop: clean, meaningful, direct) */}
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
