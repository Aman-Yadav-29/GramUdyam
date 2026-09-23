import React, { useState } from 'react';
import { 
  IndianRupee, 
  MapPin, 
  Sparkles, 
  Building2, 
  PieChart, 
  Award, 
  Landmark, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useBusinessAnalysis } from '../hooks/useBusinessAnalysis.ts';
import { formatINR, formatINRLakhs, formatPercent, formatRatio } from '../utils/formatters.ts';
import { apiClient } from '../services/apiClient.ts';

interface InteractiveDiscoveryPreviewProps {
  onFullAnalysis: () => void;
}

export const InteractiveDiscoveryPreview: React.FC<InteractiveDiscoveryPreviewProps> = ({ onFullAnalysis }) => {
  const {
    capitalAvailable,
    setCapitalAvailable,
    state,
    setState,
    district,
    setDistrict,
    locationType,
    setLocationType,
    promoterCategory,
    setPromoterCategory,
    availableStates,
    loading,
    discoveryResult,
    selectedEnterprise,
    selectEnterprise,
    districtData,
    financialPlan,
    matchedLoans
  } = useBusinessAnalysis();

  const [aiAdvisory, setAiAdvisory] = useState<{ advice: string; nextSteps: string[] } | null>(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);

  const fetchAdvisory = async () => {
    if (!selectedEnterprise) return;
    setLoadingAdvisory(true);
    try {
      const res = await apiClient.getAdvisory({
        enterpriseName: selectedEnterprise.name,
        capital: capitalAvailable ?? 500000,
        district,
        state,
        promoterCategory: promoterCategory === 'special' ? 'Special (SC/ST/Women/NER)' : 'General'
      });
      setAiAdvisory(res);
    } catch (err) {
      console.warn('Could not fetch advisory:', err);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  return (
    <section id="discovery-sandbox" className="py-16 sm:py-24 bg-stone-100/70 border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 mb-2">
              <Sliders className="h-3.5 w-3.5 text-emerald-700" />
              <span>Interactive Decision Sandbox (Guest Mode Enabled)</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Test Real Capital & Location Feasibility
            </h2>
            <p className="mt-1 text-sm text-stone-600 max-w-2xl">
              Adjust your capital and geography below. Watch the backend engine calculate matching enterprises, bank debt leverage, and eligible subsidies in real time.
            </p>
          </div>

          <button
            onClick={onFullAnalysis}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-stone-800 transition self-start md:self-auto cursor-pointer"
          >
            <span>Open Dedicated Planner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Input Controls Bar */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Capital Available Slider */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-emerald-700" />
                  <span>My Available Capital (Own Equity)</span>
                </label>
                <span className="font-heading text-lg font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {formatINRLakhs(capitalAvailable ?? 500000)}
                </span>
              </div>
              <input
                id="capital-slider-input"
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={capitalAvailable ?? 500000}
                onChange={(e) => setCapitalAvailable(Number(e.target.value))}
                className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <div className="flex justify-between text-2xs text-stone-600 mt-1 font-semibold">
                <span>₹50k (Micro/Mudra)</span>
                <span>₹10 Lakhs</span>
                <span>₹25 Lakhs</span>
                <span>₹50 Lakhs (PMEGP Max)</span>
              </div>
            </div>

            {/* State & District */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-700" />
                <span>State & District</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-emerald-600"
                >
                  {availableStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Social Category & Area Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-700" />
                <span>Area & Category</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-emerald-600"
                >
                  <option value="rural">Rural (35% Sub)</option>
                  <option value="semi_urban">Semi-Urban</option>
                  <option value="urban">Urban (15-25%)</option>
                </select>
                <select
                  value={promoterCategory}
                  onChange={(e) => setPromoterCategory(e.target.value as any)}
                  className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 text-xs font-semibold text-stone-800 focus:bg-white focus:outline-emerald-600"
                >
                  <option value="general">General (10% Eq)</option>
                  <option value="special">SC/ST/Women (5%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Matching Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Viable Enterprises List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Feasible Enterprises ({discoveryResult?.enterprises.length || 0})
              </div>
              <span className="text-xs text-emerald-700 font-semibold">
                Sorted by Local District Fit
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500 text-sm">
                Recalculating with backend engines...
              </div>
            ) : discoveryResult && discoveryResult.enterprises.length > 0 ? (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {discoveryResult.enterprises.map((enterprise) => {
                  const isSelected = selectedEnterprise?.id === enterprise.id;
                  const isLocalRecommended = districtData?.recommendedRuralEnterprises.includes(enterprise.id);

                  return (
                    <div
                      key={enterprise.id}
                      onClick={() => selectEnterprise(enterprise)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading text-sm font-bold text-stone-900 leading-snug">
                          {enterprise.name}
                        </h4>
                        {isLocalRecommended && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-2xs font-bold text-amber-900 shrink-0">
                            <Sparkles className="h-3 w-3" />
                            <span>ODOP / Local Fit</span>
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                        {enterprise.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-2xs border-t border-stone-100 pt-2 font-medium">
                        <span className="text-stone-500">
                          Est. Project Cost: <strong className="text-stone-800">{formatINRLakhs(enterprise.recommendedCapital)}</strong>
                        </span>
                        <span className="text-stone-500">
                          Net Margin: <strong className="text-emerald-700 font-semibold">{enterprise.estimatedNetMarginPercent}%</strong>
                        </span>
                        <span className="text-stone-500">
                          Gestation: <strong className="text-stone-800">{enterprise.gestationPeriodMonths} mo</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
                No direct match for this capital limit. Try increasing available capital or adjusting category.
              </div>
            )}
          </div>

          {/* Right Column: Deep Financial & Scheme Breakdown for Selected Enterprise */}
          <div className="lg:col-span-7">
            {selectedEnterprise && financialPlan ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
                {/* Header of selected unit */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Selected Enterprise Blueprint
                    </span>
                    <h3 className="font-heading text-lg font-bold text-stone-900 mt-1">
                      {selectedEnterprise.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {selectedEnterprise.tagline}
                    </p>
                  </div>
                  <div className="text-right sm:shrink-0">
                    <div className="text-xs text-stone-500">Total Project Scale</div>
                    <div className="font-heading text-xl font-black text-stone-900">
                      {formatINRLakhs(financialPlan.totalProjectCost)}
                    </div>
                  </div>
                </div>

                {/* 3-Way Funding Structure Card (Equity, Subsidy, Bank Loan) */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center justify-between">
                    <span>Financing Structure (Capital Stack)</span>
                    <span className="text-2xs font-normal text-stone-500">DIC & Bank Standards</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3">
                      <div className="text-2xs font-semibold text-emerald-800 uppercase">
                        Promoter Equity ({financialPlan.promoterContributionPercent}%)
                      </div>
                      <div className="mt-1 font-heading text-base font-bold text-emerald-950">
                        {formatINRLakhs(financialPlan.promoterContribution)}
                      </div>
                      <div className="mt-0.5 text-2xs text-stone-500">Your Own Capital</div>
                    </div>

                    <div className="rounded-xl bg-purple-50/70 border border-purple-200 p-3">
                      <div className="text-2xs font-semibold text-purple-800 uppercase">
                        Govt. Subsidy Est.
                      </div>
                      <div className="mt-1 font-heading text-base font-bold text-purple-950">
                        {formatINRLakhs(financialPlan.eligibleSubsidyEstimate)}
                      </div>
                      <div className="mt-0.5 text-2xs text-stone-500">PMEGP / PMFME</div>
                    </div>

                    <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-3">
                      <div className="text-2xs font-semibold text-blue-800 uppercase">
                        Bank Term Loan
                      </div>
                      <div className="mt-1 font-heading text-base font-bold text-blue-950">
                        {formatINRLakhs(financialPlan.bankTermLoanRequired)}
                      </div>
                      <div className="mt-0.5 text-2xs text-stone-500">Collateral Free</div>
                    </div>
                  </div>
                </div>

                {/* Key Bankability Ratios */}
                <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                    Bank Feasibility & Viability Metrics
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500">DSCR Ratio:</span>
                      <div className="font-heading font-bold text-stone-900 text-sm">
                        {financialPlan.debtServiceCoverageRatio !== null ? `${formatRatio(financialPlan.debtServiceCoverageRatio)}x` : 'No debt'}
                      </div>
                      <span className="text-2xs text-emerald-700 font-medium">Bank Target: &gt;1.50</span>
                    </div>

                    <div>
                      <span className="text-stone-500">Break-Even Sales:</span>
                      <div className="font-heading font-bold text-stone-900 text-sm">
                        {financialPlan.breakEvenSalesPercent !== null ? formatPercent(financialPlan.breakEvenSalesPercent) : 'N/A'}
                      </div>
                      <span className="text-2xs text-stone-500">Capacity threshold</span>
                    </div>

                    <div>
                      <span className="text-stone-500">Net Annual PAT:</span>
                      <div className="font-heading font-bold text-emerald-700 text-sm">
                        {formatINRLakhs(financialPlan.profitAfterTax)}
                      </div>
                      <span className="text-2xs text-stone-500">First year net profit</span>
                    </div>

                    <div>
                      <span className="text-stone-500">Payback Period:</span>
                      <div className="font-heading font-bold text-stone-900 text-sm">
                        {financialPlan.paybackPeriodYears} Years
                      </div>
                      <span className="text-2xs text-stone-500">Full capital return</span>
                    </div>
                  </div>
                </div>

                {/* Matched Bank Product & Indicative EMI */}
                {matchedLoans && matchedLoans.length > 0 && (
                  <div className="rounded-xl border border-stone-200 p-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5 text-stone-600" />
                        <span>Recommended Institutional Loan Product</span>
                      </span>
                      <span className="text-2xs font-semibold text-emerald-700">
                        {matchedLoans[0].creditGuaranteeCover}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{matchedLoans[0].name}</div>
                        <div className="text-stone-500 text-2xs mt-0.5">
                          Tenure: {matchedLoans[0].maxTenureMonths} mo • Moratorium: {matchedLoans[0].moratoriumMonths} mo
                        </div>
                      </div>
                      <div className="sm:text-right bg-stone-100 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                        <span className="text-2xs text-stone-500">Estimated Monthly EMI:</span>
                        <div className="font-heading font-extrabold text-stone-900 text-sm">
                          {formatINR(matchedLoans[0].estimatedEmi)} / mo
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI / Consultant Advisory Module */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <Bot className="h-4 w-4 text-emerald-700" />
                      <span>Enterprise Consultant Advisory (District Ground Realities)</span>
                    </div>
                    {!aiAdvisory && (
                      <button
                        onClick={fetchAdvisory}
                        disabled={loadingAdvisory}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                      >
                        {loadingAdvisory ? 'Generating...' : 'Generate District Insights'}
                      </button>
                    )}
                  </div>

                  {aiAdvisory ? (
                    <div className="space-y-3 text-xs text-stone-700">
                      <p className="leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-100">
                        {aiAdvisory.advice}
                      </p>
                      <div>
                        <div className="font-bold text-emerald-950 mb-1">Recommended Next Steps:</div>
                        <ol className="list-decimal list-inside space-y-1 text-2xs text-stone-600">
                          {aiAdvisory.nextSteps.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-600">
                      Click above to get tailored advisory on DIC formalities, raw material procurement in {district}, and bank submission tips.
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
                  <span className="text-2xs text-stone-500 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Calculations saved automatically to your Guest Session</span>
                  </span>
                  <button
                    onClick={onFullAnalysis}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
                  >
                    <span>Proceed to Full Detailed Project Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 text-sm">
                Select an enterprise from the left to view comprehensive budget and subsidy analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
