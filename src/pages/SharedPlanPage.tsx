import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  Printer,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Lock,
  Share2,
  ExternalLink,
  Building2,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { BusinessPlan } from '../types/businessPlan.ts';
import { BusinessPlanView } from '../components/BusinessPlanView.tsx';
import { downloadPlanAsHtml, downloadPlanAsText } from '../utils/exportPlan.ts';

interface SharedPlanPageProps {
  shareToken: string;
  onNavigateHome: () => void;
  onNavigateToAnalysis: () => void;
}

export const SharedPlanPage: React.FC<SharedPlanPageProps> = ({
  shareToken,
  onNavigateHome,
  onNavigateToAnalysis
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedPlanData, setSharedPlanData] = useState<{
    title: string;
    createdAt: string;
    updatedAt: string;
    plan: BusinessPlan;
    shareToken: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSharedPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getSharedPlan(shareToken);
        if (isMounted) {
          setSharedPlanData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.message ||
              'This shared business plan is unavailable, expired, or the link has been revoked by the owner.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (shareToken) {
      loadSharedPlan();
    } else {
      setError('Invalid or missing share token.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [shareToken]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xs max-w-sm w-full">
          <Loader2 className="h-8 w-8 text-emerald-700 animate-spin mx-auto mb-3" />
          <h2 className="font-heading text-sm font-bold text-stone-900 mb-1">
            Loading Shared Business Plan
          </h2>
          <p className="text-xs text-stone-500">
            Fetching verified financial feasibility and DPR data...
          </p>
        </div>
      </div>
    );
  }

  // Error State (Revoked, Invalid, or Not Found)
  if (error || !sharedPlanData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm max-w-md w-full">
          <div className="rounded-full bg-rose-100 p-3 w-12 h-12 flex items-center justify-center text-rose-700 mx-auto mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-base font-bold text-stone-900 mb-2">
            Shared Plan Unavailable
          </h2>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            {error || 'This link may have expired, or the plan owner has revoked public access.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go to GramUdyam Home</span>
            </button>
            <button
              onClick={onNavigateToAnalysis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
            >
              <span>Build Your Own Plan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { plan, title } = sharedPlanData;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 print:hidden">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-heading font-bold text-stone-900">GramUdyam</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-2xs font-bold text-blue-900 border border-blue-200">
              <Share2 className="h-3 w-3 text-blue-700" />
              <span>Public Shared Plan (Read-Only)</span>
            </span>

            <button
              onClick={onNavigateToAnalysis}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs hidden sm:inline-flex"
            >
              <span>Build Your Own Plan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Read-Only Banner */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-800 shrink-0 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">
                Shared DPR Feasibility Assessment
              </div>
              <p className="text-2xs text-blue-800 mt-0.5 max-w-2xl">
                This Detailed Project Report was shared for bank appraisal, partner evaluation, or business planning.
                All calculations are grounded in official scheme and district benchmarks. Editing is disabled.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadPlanAsHtml(plan, title)}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-700" />
              <span>Download HTML</span>
            </button>
            <button
              onClick={() => downloadPlanAsText(plan)}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-blue-700" />
              <span>Download Text</span>
            </button>
          </div>
        </div>

        {/* Render Business Plan in strictly Read-Only Mode */}
        <BusinessPlanView
          plan={plan}
          isReadOnly={true}
        />
      </main>
    </div>
  );
};
