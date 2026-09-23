import React from 'react';
import { HelpCircle, IndianRupee, MapPin, Calculator, Landmark, FileText, ArrowRightCircle } from 'lucide-react';

interface CoreQuestionCardProps {
  onTriggerAnalysis: () => void;
}

export const CoreQuestionCard: React.FC<CoreQuestionCardProps> = ({ onTriggerAnalysis }) => {
  return (
    <section className="py-12 bg-stone-900 text-stone-100 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-800/60 mb-4">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>The Core Question GramUdyam Solves</span>
              </div>

              {/* Exact quote from user prompt */}
              <blockquote className="font-heading text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-white leading-snug">
                “Given my <span className="text-emerald-400 font-semibold underline decoration-emerald-500/50 underline-offset-4">available capital</span> and <span className="text-emerald-400 font-semibold underline decoration-emerald-500/50 underline-offset-4">location</span>, what businesses can I realistically start, what will they cost, what financing might I need, what government schemes/loans may be relevant, and what should I do next?”
              </blockquote>

              <p className="mt-4 text-sm text-stone-400 leading-relaxed">
                Most rural entrepreneurs get stranded between informal advice and confusing banking jargon. GramUdyam bridges this gap with algorithmic precision: matching viable agro/manufacturing enterprises, calculating capital margins, and drafting actionable credit steps.
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                id="core-question-cta"
                onClick={onTriggerAnalysis}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-stone-950 hover:bg-emerald-400 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>Answer This For My Location</span>
                <ArrowRightCircle className="h-4 w-4" />
              </button>
              <div className="text-xs text-stone-500 text-center sm:text-left lg:text-center">
                Instant calculations • Zero fees
              </div>
            </div>
          </div>

          {/* Breakdown checklist showing how GramUdyam answers each clause */}
          <div className="mt-8 pt-8 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-emerald-400 text-xs font-bold">
                1
              </div>
              <div>
                <div className="text-xs font-semibold text-white">What can I start?</div>
                <div className="text-xs text-stone-400 mt-0.5">Enterprise feasibility based on your capital equity.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-emerald-400 text-xs font-bold">
                2
              </div>
              <div>
                <div className="text-xs font-semibold text-white">What will it cost?</div>
                <div className="text-xs text-stone-400 mt-0.5">Transparent CAPEX, machinery, and monthly OPEX.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-emerald-400 text-xs font-bold">
                3
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Financing required?</div>
                <div className="text-xs text-stone-400 mt-0.5">Term loan & Cash Credit sizing with bank EMI.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-emerald-400 text-xs font-bold">
                4
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Relevant subsidies?</div>
                <div className="text-xs text-stone-400 mt-0.5">PMEGP (up to 35%), PMFME, and Mudra coverage.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-emerald-400 text-xs font-bold">
                5
              </div>
              <div>
                <div className="text-xs font-semibold text-white">What next?</div>
                <div className="text-xs text-stone-400 mt-0.5">DIC portal registration, Udyam, & bank branch steps.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
