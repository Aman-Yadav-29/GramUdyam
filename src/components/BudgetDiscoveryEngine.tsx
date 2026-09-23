import React, { useState, useEffect, useCallback } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Percent,
  Calculator,
  ShieldCheck,
  ChevronRight,
  Layers,
  Building2,
  Wrench,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BudgetDiscoveryResult, 
  CalculatedBusinessPlan, 
  DiscoverySortOption, 
  AffordabilityTier 
} from '../types/business.ts';
import { apiClient } from '../services/apiClient.ts';
import { formatINR, formatINRLakhs } from '../utils/formatters.ts';

interface BudgetDiscoveryEngineProps {
  initialCapital?: number;
  onSelectBusinessForDeepDive?: (plan: CalculatedBusinessPlan) => void;
  className?: string;
}

const CAPITAL_PRESETS = [
  { label: '₹50,000', value: 50000 },
  { label: '₹1,00,000', value: 100000 },
  { label: '₹2,00,000', value: 200000 },
  { label: '₹5,00,000', value: 500000 },
  { label: '₹10,00,000', value: 1000000 },
];

const SORT_OPTIONS: { id: DiscoverySortOption; label: string }[] = [
  { id: 'lowest_investment', label: 'Lowest Investment' },
  { id: 'highest_profit', label: 'Highest Estimated Monthly Profit' },
  { id: 'lowest_gap', label: 'Lowest Financing Gap' },
  { id: 'shortest_payback', label: 'Shortest Payback' },
  { id: 'highest_roi', label: 'Highest ROI' },
];

export const BudgetDiscoveryEngine: React.FC<BudgetDiscoveryEngineProps> = ({
  initialCapital,
  onSelectBusinessForDeepDive,
  className = ''
}) => {
  // State for availableCapital - do NOT assume ₹1 lakh or ₹5 lakh. Start with null or initialCapital if provided.
  const [availableCapital, setAvailableCapital] = useState<number | null>(initialCapital ?? null);
  const [customInputValue, setCustomInputValue] = useState<string>(initialCapital ? String(initialCapital) : '');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(
    initialCapital ? !CAPITAL_PRESETS.some(p => p.value === initialCapital) : false
  );

  const [sortBy, setSortBy] = useState<DiscoverySortOption>('lowest_investment');
  const [loading, setLoading] = useState<boolean>(false);
  const [discoveryResult, setDiscoveryResult] = useState<BudgetDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch discovery results via backend API pipeline
  const runDiscovery = useCallback(async (capital: number, sort: DiscoverySortOption) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.discoverByBudget(capital, sort);
      setDiscoveryResult(res);
    } catch (err: any) {
      console.error('Budget discovery error:', err);
      setError(err.message || 'Failed to load budget discovery results');
      setDiscoveryResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (availableCapital !== null && availableCapital > 0) {
      runDiscovery(availableCapital, sortBy);
    }
  }, [availableCapital, sortBy, runDiscovery]);

  const handleSelectPreset = (value: number) => {
    setIsCustomMode(false);
    setAvailableCapital(value);
    setCustomInputValue(String(value));
  };

  const handleCustomInputApply = () => {
    const cleaned = customInputValue.replace(/[^0-9]/g, '');
    const parsed = Number(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      setAvailableCapital(parsed);
      setError(null);
    } else {
      setError('Please enter a valid positive capital amount.');
    }
  };

  return (
    <div id="budget-discovery-root" className={`w-full ${className}`}>
      {/* 1. Primary Capital Input Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 mb-2.5">
            <Calculator className="h-3.5 w-3.5 text-stone-900" />
            <span>Step 1: Budget-First Discovery</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            How much capital do you have available to start your business?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
            Enter your own available equity savings. GramUdyam analyzes all configured enterprise models, itemizing machinery, working capital cycles, and bank financing gaps without requiring you to guess a business beforehand.
          </p>
        </div>

        {/* Capital Presets Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
          {CAPITAL_PRESETS.map((preset) => {
            const isSelected = !isCustomMode && availableCapital === preset.value;
            return (
              <button
                key={preset.value}
                id={`btn-preset-${preset.value}`}
                onClick={() => handleSelectPreset(preset.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs scale-102 ring-2 ring-emerald-600 ring-offset-2'
                    : 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          <button
            id="btn-preset-custom"
            onClick={() => {
              setIsCustomMode(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isCustomMode
                ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-2'
                : 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            Custom Amount
          </button>
        </div>

        {/* Custom Input Field */}
        {isCustomMode && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-stone-100">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500 font-bold text-sm">
                ₹
              </span>
              <input
                type="text"
                id="input-custom-capital"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCustomInputApply();
                }}
                placeholder="e.g. 75000 or 350000"
                className="w-full pl-8 pr-3 py-2 text-sm font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-emerald-600"
              />
            </div>
            <button
              id="btn-apply-custom-capital"
              onClick={handleCustomInputApply}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              Analyze Enterprises
            </button>
            {customInputValue && !isNaN(Number(customInputValue)) && Number(customInputValue) > 0 && (
              <span className="text-xs text-stone-500 font-medium">
                ({formatINRLakhs(Number(customInputValue))})
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* When no capital selected yet, prompt user */}
      {availableCapital === null && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <IndianRupee className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-stone-900">
            Select an Available Capital Amount Above
          </h3>
          <p className="mt-1 text-xs text-stone-600 max-w-md mx-auto">
            Choose ₹50,000, ₹1 Lakh, ₹2 Lakh, ₹5 Lakh, ₹10 Lakh, or a custom amount. The system will calculate real fixed assets, operational buffers, and exact bank financing for every business.
          </p>
        </div>
      )}

      {/* 2. Active Discovery Results & Sorting Controls */}
      {availableCapital !== null && discoveryResult && (
        <div className="space-y-8">
          {/* Header Summary & Sort Bar */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-500">
                Evaluation Basis: <strong className="text-stone-900">{formatINR(availableCapital)} Available Capital</strong>
              </div>
              <div className="text-sm font-bold text-stone-900 mt-0.5">
                {discoveryResult.totalAnalyzed} Enterprises Analyzed across 3 Affordability Tiers
              </div>
            </div>

            {/* Sorting Toolbar */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="select-discovery-sort" className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5 text-stone-500" />
                <span>Sort By:</span>
              </label>
              <select
                id="select-discovery-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as DiscoverySortOption)}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-800 focus:bg-white focus:outline-emerald-700"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 1: Businesses You Can Start (FITS_BUDGET) */}
          <section id="section-fits-budget" className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600" />
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-900">
                    Businesses You Can Start
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                    {discoveryResult.fitsBudget.length} Models
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Total project cost (fixed equipment + working capital cycle) is fully covered within your ₹{availableCapital.toLocaleString('en-IN')} capital without debt.
                </p>
              </div>
            </div>

            {discoveryResult.fitsBudget.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
                No configured businesses have a total project cost under ₹{availableCapital.toLocaleString('en-IN')}. Check the <strong>Limited Financing</strong> section below where your capital provides sufficient promoter equity margin!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {discoveryResult.fitsBudget.map((plan) => (
                  <BusinessFinancialCard
                    key={plan.business.id}
                    plan={plan}
                    onSelect={onSelectBusinessForDeepDive}
                  />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: Can Start With Limited Financing (LIMITED_FINANCING) */}
          <section id="section-limited-financing" className="space-y-4 pt-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-900">
                    Can Start With Limited Financing
                  </h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    {discoveryResult.limitedFinancing.length} Models
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Project cost is above your capital, but your ₹{availableCapital.toLocaleString('en-IN')} meets the configured promoter-equity threshold (≥{discoveryResult.config?.minPromoterEquityPercent ?? 20}%) and projected debt service is bankable.
                </p>
              </div>
            </div>

            {discoveryResult.limitedFinancing.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
                No enterprises currently match the limited financing threshold for this capital bracket.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {discoveryResult.limitedFinancing.map((plan) => (
                  <BusinessFinancialCard
                    key={plan.business.id}
                    plan={plan}
                    onSelect={onSelectBusinessForDeepDive}
                  />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 3: Requires Higher Investment (HIGHER_INVESTMENT) */}
          <section id="section-higher-investment" className="space-y-4 pt-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-stone-400" />
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-stone-900">
                    Requires Higher Investment
                  </h3>
                  <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-800">
                    {discoveryResult.higherInvestment.length} Models
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Substantially exceeds available capital; requires higher promoter equity or co-founders to qualify for commercial bankability.
                </p>
              </div>
            </div>

            {discoveryResult.higherInvestment.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
                All configured businesses are affordable within your available capital or manageable financing!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {discoveryResult.higherInvestment.map((plan) => (
                  <BusinessFinancialCard
                    key={plan.business.id}
                    plan={plan}
                    onSelect={onSelectBusinessForDeepDive}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

interface BusinessFinancialCardProps {
  plan: CalculatedBusinessPlan;
  onSelect?: (plan: CalculatedBusinessPlan) => void;
}

const BusinessFinancialCard: React.FC<BusinessFinancialCardProps> = ({ plan, onSelect }) => {
  const { business, projectCost, workingCapital, availableCapital, financingGap, monthlyRevenue, monthlyOpex, monthlyNetProfit, netMargin, roi, paybackYears, breakEvenPercent, monthlyEmi, dscr, affordabilityTier, affordabilityReason } = plan;

  const tierStyles = {
    FITS_BUDGET: {
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      badgeText: 'Fits Budget (Zero Debt Required)',
      cardBorder: 'border-emerald-200 hover:border-emerald-400'
    },
    LIMITED_FINANCING: {
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
      badgeText: 'Bankable (Limited Financing)',
      cardBorder: 'border-amber-200 hover:border-amber-400'
    },
    HIGHER_INVESTMENT: {
      badgeBg: 'bg-stone-100 text-stone-700 border-stone-300',
      badgeText: 'Requires Higher Investment',
      cardBorder: 'border-stone-200 hover:border-stone-400'
    }
  }[affordabilityTier];

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${tierStyles.cardBorder}`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-3xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
            {business.category.replace('_', ' ')}
          </span>
          <span className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${tierStyles.badgeBg}`}>
            {tierStyles.badgeText}
          </span>
        </div>

        {/* Business Title & Tagline */}
        <h4 className="font-heading text-base font-bold text-stone-900 line-clamp-2 leading-tight">
          {business.name}
        </h4>
        <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
          {business.tagline}
        </p>

        {/* Scale badge */}
        <div className="mt-2 text-2xs text-stone-500 flex items-center gap-2">
          <span>Scale: <strong>{business.defaultScale}</strong></span>
          <span>•</span>
          <span>Cycle: <strong>{business.unit}</strong></span>
        </div>

        {/* Real Financial Breakdown Grid */}
        <div className="mt-4 rounded-xl bg-stone-50 p-3.5 border border-stone-200 space-y-2.5 text-xs">
          {/* Row 1: Project Cost & Working Capital */}
          <div className="flex justify-between items-baseline">
            <span className="text-stone-500 font-medium">Total Project Cost:</span>
            <span className="font-bold text-stone-900">{formatINR(projectCost)}</span>
          </div>
          <div className="flex justify-between items-baseline text-2xs text-stone-500 pl-2">
            <span>↳ Working Capital Component:</span>
            <span className="font-medium text-stone-700">{formatINR(workingCapital)}</span>
          </div>

          {/* Row 2: Own Capital & Financing Gap */}
          <div className="flex justify-between items-baseline pt-1 border-t border-stone-200/60">
            <span className="text-stone-500 font-medium">Your Equity / Gap:</span>
            <div className="text-right">
              <span className="font-semibold text-emerald-800">{formatINR(Math.min(availableCapital, projectCost))}</span>
              {financingGap > 0 ? (
                <span className="text-amber-800 font-bold ml-1">(-{formatINR(financingGap)})</span>
              ) : (
                <span className="text-emerald-700 font-bold ml-1">(100% Funded)</span>
              )}
            </div>
          </div>

          {/* Row 3: Monthly Revenue & OPEX */}
          <div className="flex justify-between items-baseline pt-1 border-t border-stone-200/60">
            <span className="text-stone-500 font-medium">Monthly Rev / OPEX:</span>
            <span className="font-semibold text-stone-800">
              {formatINR(monthlyRevenue)} / {formatINR(monthlyOpex)}
            </span>
          </div>

          {/* Row 4: Monthly Net Profit & Margin */}
          <div className="flex justify-between items-baseline pt-1 border-t border-stone-200/60">
            <span className="text-stone-900 font-bold">Est. Monthly Net Profit:</span>
            <div className="text-right">
              <span className="font-bold text-emerald-800 text-sm">{formatINR(monthlyNetProfit)}</span>
              <span className="text-2xs text-stone-500 ml-1">({netMargin}%)</span>
            </div>
          </div>

          {/* Row 5: ROI, Payback, Break-even */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-stone-200/80 text-center text-3xs">
            <div className="bg-white p-1.5 rounded-lg border border-stone-200">
              <div className="text-stone-400 font-bold">ROI (p.a.)</div>
              <div className="font-bold text-stone-900 text-xs mt-0.5">{roi}%</div>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-stone-200">
              <div className="text-stone-400 font-bold">PAYBACK</div>
              <div className="font-bold text-stone-900 text-xs mt-0.5">{paybackYears} yrs</div>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-stone-200">
              <div className="text-stone-400 font-bold">BREAK-EVEN</div>
              <div className="font-bold text-stone-900 text-xs mt-0.5">{breakEvenPercent}%</div>
            </div>
          </div>

          {/* Row 6: Financing Specifics (EMI & DSCR) where gap > 0 */}
          {financingGap > 0 && (
            <div className="rounded-lg bg-amber-50/70 p-2.5 border border-amber-200/80 text-2xs space-y-1.5">
              <div className="flex justify-between items-baseline text-amber-900">
                <span className="font-semibold">Illustrative EMI:</span>
                <span className="font-bold text-xs">{formatINR(monthlyEmi)}/mo</span>
              </div>
              <div className="text-3xs text-amber-800 leading-tight">
                Based on illustrative 9.5% annual interest and 5-year tenure assumption (not a loan offer or lender quotation).
              </div>
              {dscr !== null && (
                <div className="flex justify-between items-baseline pt-1 border-t border-amber-200 text-amber-900">
                  <span className="font-semibold">Projected Debt Service Ratio (DSCR):</span>
                  <span className="font-bold">{dscr}x {dscr >= 1.5 ? '(Strong)' : '(Viable)'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Affordability Engine Explanation Note */}
        <div className="mt-3 text-2xs text-stone-500 leading-tight">
          {affordabilityReason}
        </div>
      </div>

      {/* Select / Inspect Action Button */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <button
          id={`btn-select-${business.id}`}
          onClick={() => onSelect && onSelect(plan)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 text-xs font-bold transition cursor-pointer"
        >
          <span>Inspect Full Model & DPR</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
