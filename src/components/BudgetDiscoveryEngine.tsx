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
  ArrowRight,
  MapPin,
  Compass,
  Store,
  Zap,
  Droplets,
  Truck,
  X,
  Sprout
} from 'lucide-react';
import { 
  BudgetDiscoveryResult, 
  CalculatedBusinessPlan, 
  DiscoverySortOption, 
  AffordabilityTier 
} from '../types/business.ts';
import { DistrictIntelligence } from '../types/location.ts';
import { apiClient } from '../services/apiClient.ts';
import { formatINR, formatINRLakhs } from '../utils/formatters.ts';
import { POPULAR_INDIAN_STATES, STATE_DISTRICTS_MAP } from '../data/locationBenchmarksData.ts';
import { LocationGisCatchmentMap } from './LocationGisCatchmentMap.tsx';

interface BudgetDiscoveryEngineProps {
  initialCapital?: number;
  initialState?: string;
  initialDistrict?: string;
  initialVillage?: string;
  initialLocationType?: 'rural' | 'semi_urban' | 'urban';
  onLocationChange?: (state: string, district: string, locationType: 'rural' | 'semi_urban' | 'urban', village?: string) => void;
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
  { id: 'location_relevance', label: 'Top Location Synergy (GIS Match)' },
  { id: 'lowest_investment', label: 'Lowest Total Investment' },
  { id: 'highest_profit', label: 'Highest Estimated Monthly Profit' },
  { id: 'lowest_gap', label: 'Lowest Financing Gap' },
  { id: 'shortest_payback', label: 'Shortest Payback Period' },
  { id: 'highest_roi', label: 'Highest Annual ROI' },
];

export const BudgetDiscoveryEngine: React.FC<BudgetDiscoveryEngineProps> = ({
  initialCapital,
  initialState = 'Uttar Pradesh',
  initialDistrict = 'Varanasi',
  initialVillage = 'Raja Talab',
  initialLocationType = 'rural',
  onLocationChange,
  onSelectBusinessForDeepDive,
  className = ''
}) => {
  // State for availableCapital
  const [availableCapital, setAvailableCapital] = useState<number | null>(initialCapital ?? null);
  const [customInputValue, setCustomInputValue] = useState<string>(initialCapital ? String(initialCapital) : '');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(
    initialCapital ? !CAPITAL_PRESETS.some(p => p.value === initialCapital) : false
  );

  // Location Intelligence States
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [villageOrTown, setVillageOrTown] = useState<string>(initialVillage || '');
  const [locationType, setLocationType] = useState<'rural' | 'semi_urban' | 'urban'>(initialLocationType);
  const [showGisMapModal, setShowGisMapModal] = useState<boolean>(false);
  const [districtData, setDistrictData] = useState<DistrictIntelligence | null>(null);

  // Sorting: default to location_relevance
  const [sortBy, setSortBy] = useState<DiscoverySortOption>('location_relevance');
  const [loading, setLoading] = useState<boolean>(false);
  const [discoveryResult, setDiscoveryResult] = useState<BudgetDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch district benchmarks for GIS view
  const fetchDistrictInfo = useCallback(async (stateName: string, districtName: string) => {
    try {
      const data = await apiClient.getDistrictData(stateName, districtName);
      setDistrictData(data);
    } catch (e) {
      console.warn('Could not fetch district data', e);
    }
  }, []);

  // Fetch discovery results via backend API pipeline
  const runDiscovery = useCallback(async (
    capital: number, 
    sort: DiscoverySortOption,
    stateName: string,
    districtName: string,
    locType: 'rural' | 'semi_urban' | 'urban',
    villageName?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.discoverByBudget(capital, sort, {
        state: stateName,
        district: districtName,
        locationType: locType,
        villageOrTown: villageName
      });
      setDiscoveryResult(res);
      fetchDistrictInfo(stateName, districtName);

      if (onLocationChange) {
        onLocationChange(stateName, districtName, locType, villageName);
      }
    } catch (err: any) {
      console.error('Budget discovery error:', err);
      setError(err.message || 'Failed to load budget discovery results');
      setDiscoveryResult(null);
    } finally {
      setLoading(false);
    }
  }, [fetchDistrictInfo, onLocationChange]);

  // Initial & reactive triggers
  useEffect(() => {
    if (availableCapital !== null && availableCapital > 0) {
      runDiscovery(availableCapital, sortBy, selectedState, selectedDistrict, locationType, villageOrTown);
    }
  }, [availableCapital, sortBy, selectedState, selectedDistrict, locationType, villageOrTown, runDiscovery]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const districts = STATE_DISTRICTS_MAP[newState] || ['Central District'];
    const defaultDist = districts[0] || newState;
    setSelectedDistrict(defaultDist);
  };

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

  const availableDistricts = STATE_DISTRICTS_MAP[selectedState] || [selectedDistrict];

  return (
    <div id="budget-discovery-root" className={`w-full ${className}`}>
      {/* 1. Location & Budget Input Hub */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs mb-8 space-y-6">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 mb-1.5">
              <Compass className="h-3.5 w-3.5 text-emerald-700" />
              <span>Phase 5 • Location GIS + Budget Discovery Engine</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
              Find Viable Rural Enterprises for Your Location & Budget
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Calculates exact fixed capital, working reserves, and local agricultural synergy. 
              <strong> Location refines candidate businesses, without overriding financial affordability.</strong>
            </p>
          </div>

          {/* GIS Radar Modal Button */}
          {districtData && (
            <button
              onClick={() => setShowGisMapModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>View {selectedDistrict} GIS Catchment Map</span>
            </button>
          )}
        </div>

        {/* Location Inputs Grid */}
        <div className="rounded-xl bg-stone-50/80 p-4 border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-emerald-800" />
            <span>Target Location Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* State Selection */}
            <div>
              <label className="block text-2xs font-bold text-stone-600 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-emerald-600"
              >
                {POPULAR_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* District Selection */}
            <div>
              <label className="block text-2xs font-bold text-stone-600 mb-1">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-emerald-600"
              >
                {availableDistricts.map((dst) => (
                  <option key={dst} value={dst}>{dst}</option>
                ))}
              </select>
            </div>

            {/* Village / Town / City (Optional) */}
            <div>
              <label className="block text-2xs font-bold text-stone-600 mb-1">
                Village / Town / City <span className="font-normal text-stone-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={villageOrTown}
                onChange={(e) => setVillageOrTown(e.target.value)}
                placeholder="e.g. Raja Talab, Bela, Kanti"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-emerald-600"
              />
            </div>

            {/* Rural / Urban Status */}
            <div>
              <label className="block text-2xs font-bold text-stone-600 mb-1">Catchment Classification</label>
              <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-stone-300 text-center">
                {(['rural', 'semi_urban', 'urban'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLocationType(type)}
                    className={`py-1 text-2xs font-bold rounded capitalize cursor-pointer transition ${
                      locationType === type 
                        ? 'bg-emerald-800 text-white' 
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {type === 'semi_urban' ? 'Semi-Ur' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Micro-village provenance disclaimer */}
          <div className="text-3xs text-stone-500 pt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-emerald-700 shrink-0" />
            <span>
              Official Provenance Notice: Statistics are referenced from official <strong>District-level</strong> & <strong>State-level</strong> benchmarks (Census of India, MoA&FW, Agmarknet, CGWB). Village-level surveys require on-ground field validation.
            </span>
          </div>
        </div>

        {/* Capital Presets */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Select Your Available Promoter Capital (Equity)
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            {CAPITAL_PRESETS.map((preset) => {
              const isSelected = !isCustomMode && availableCapital === preset.value;
              return (
                <button
                  key={preset.value}
                  id={`btn-preset-capital-${preset.value}`}
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-600 ring-offset-2'
                      : 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            <button
              id="btn-custom-capital-mode"
              onClick={() => setIsCustomMode(true)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
      </div>

      {/* When no capital selected yet, prompt user */}
      {availableCapital === null && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <IndianRupee className="h-6 w-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-stone-900">
            Select Your Available Capital Above
          </h3>
          <p className="mt-1 text-xs text-stone-600 max-w-md mx-auto">
            Choose ₹50,000, ₹1 Lakh, ₹2 Lakh, ₹5 Lakh, ₹10 Lakh, or a custom amount. The system models CapEx, working reserves, bank leverage, and local {selectedDistrict} agro-climate synergy for all candidates.
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
                Evaluation Basis: <strong className="text-stone-900">{formatINR(availableCapital)} Equity in {selectedDistrict}, {selectedState}</strong>
              </div>
              <div className="text-sm font-bold text-stone-900 mt-0.5">
                {discoveryResult.totalAnalyzed} Enterprises Analyzed across 3 Strict Affordability Tiers
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

          {/* TIER 1: Fits Available Budget (Zero Debt Required) */}
          <section id="section-fits-budget" className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-700" />
                  <h3 className="font-heading text-lg font-bold text-emerald-950">
                    Fits Available Budget
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {discoveryResult.fitsBudget.length} Models
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Total Project Cost (Fixed Assets + Working Capital) ≤ Available Capital. Zero bank debt required to commence operations.
                </p>
              </div>
            </div>

            {discoveryResult.fitsBudget.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
                No enterprise models can be established strictly within {formatINR(availableCapital)} without institutional bank credit. See bankable models below!
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

          {/* TIER 2: Bankable with Limited Financing */}
          <section id="section-limited-financing" className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <h3 className="font-heading text-lg font-bold text-amber-950">
                    Bankable with Limited Financing
                  </h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    {discoveryResult.limitedFinancing.length} Models
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Financing gap is bankable (Equity ≥ 20%, Debt ≤ 4× Capital & ≤ ₹20 Lakhs, DSCR ≥ 1.25).
                </p>
              </div>
            </div>

            {discoveryResult.limitedFinancing.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
                No models fit the bankable limited financing criteria for this capital level.
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

          {/* TIER 3: Requires Higher Investment */}
          <section id="section-higher-investment" className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-stone-400" />
                  <h3 className="font-heading text-lg font-bold text-stone-900">
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

      {/* GIS Catchment Map Modal */}
      {showGisMapModal && districtData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGisMapModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <LocationGisCatchmentMap
              districtData={districtData}
              villageOrTown={villageOrTown}
              locationType={locationType}
            />
          </div>
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
  const { 
    business, 
    projectCost, 
    workingCapital, 
    availableCapital, 
    financingGap, 
    monthlyRevenue, 
    monthlyOpex, 
    monthlyNetProfit, 
    netMargin, 
    roi, 
    paybackYears, 
    breakEvenPercent, 
    monthlyEmi, 
    dscr, 
    affordabilityTier, 
    affordabilityReason,
    locationFit
  } = plan;

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

        {/* Phase 5: Location Relevance & Synergy Badge */}
        {locationFit && (
          <div className="mt-3 rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-2xs font-bold text-emerald-900">
                <MapPin className="h-3 w-3 text-emerald-700" />
                <span>{locationFit.district} Location Match:</span>
              </span>
              <span className={`text-3xs font-extrabold px-1.5 py-0.5 rounded ${
                locationFit.synergyLevel === 'HIGH_SYNERGY' 
                  ? 'bg-emerald-600 text-white' 
                  : (locationFit.synergyLevel === 'MODERATE_SYNERGY' ? 'bg-amber-600 text-white' : 'bg-stone-600 text-white')
              }`}>
                {locationFit.locationScore}% Synergy
              </span>
            </div>

            {/* Matched raw material or mandi channel */}
            <div className="text-3xs text-emerald-950 font-medium line-clamp-1">
              {locationFit.rawMaterialSynergy.matchedSurpluses.length > 0 ? (
                <span>Surplus: <strong>{locationFit.rawMaterialSynergy.matchedSurpluses.slice(0, 2).join(', ')}</strong></span>
              ) : (
                <span>Catchment: {locationFit.rawMaterialSynergy.nearestMandi}</span>
              )}
            </div>

            {/* Provenance Disclosure */}
            <div className="text-3xs text-emerald-800/80 flex items-center justify-between pt-1 border-t border-emerald-200/60">
              <span className="truncate">Source: {locationFit.rawMaterialSynergy.provenance.source.slice(0, 30)}...</span>
              <span className="shrink-0 font-bold">({locationFit.rawMaterialSynergy.provenance.geographicLevel.replace(' estimate', '')})</span>
            </div>
          </div>
        )}

        {/* Phase 6: Agriculture Location Intelligence Indicator */}
        {plan.agriLocationAnalysis && (
          <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50/50 border border-emerald-200/80 px-2 py-1 text-3xs text-emerald-900 font-medium">
            <span className="flex items-center gap-1 font-bold">
              <Sprout className="h-3 w-3 text-emerald-700" />
              <span>Agri Factors:</span>
            </span>
            <span>
              {plan.agriLocationAnalysis.whyMaySuit.length} Supportive factors (District-level)
            </span>
          </div>
        )}

        {/* Business Scaling Display (Phase 4 Business Scaling) */}
        {plan.scaling && plan.scaling.isScalable && (
          <div className="mt-3 rounded-xl bg-stone-50 border border-stone-200 p-2.5 text-2xs space-y-1.5">
            <div className="flex items-center justify-between text-3xs uppercase font-extrabold tracking-wider">
              <span className="flex items-center gap-1 text-emerald-800">
                <Layers className="h-3 w-3" />
                <span>Scale Assessment</span>
              </span>
              {plan.scaling.suggestedScaleUnits < plan.scaling.standardScaleUnits ? (
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  Scale Reduced
                </span>
              ) : (
                <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-semibold">
                  Standard Scale
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
              <div>
                <span className="text-stone-400 block text-3xs uppercase font-bold">Standard scale</span>
                <span className="font-semibold text-stone-800">{plan.scaling.standardScaleLabel}</span>
              </div>
              <div>
                <span className="text-emerald-700 block text-3xs uppercase font-bold">
                  {plan.scaling.suggestedScaleUnits < plan.scaling.standardScaleUnits ? 'Suggested scale' : 'Minimum viable'}
                </span>
                <span className="font-bold text-emerald-950">
                  {plan.scaling.suggestedScaleUnits < plan.scaling.standardScaleUnits ? plan.scaling.suggestedScaleLabel : plan.scaling.minViableScaleLabel}
                </span>
              </div>
            </div>

            {plan.scaling.suggestedScaleUnits < plan.scaling.standardScaleUnits && (
              <div className="flex justify-between items-baseline pt-1 border-t border-stone-200/60 text-3xs">
                <span className="text-stone-500 font-medium">Estimated cost ({plan.scaling.suggestedScaleLabel}):</span>
                <span className="font-bold text-emerald-900 text-2xs">{formatINR(plan.scaling.estimatedTotalProjectCost)}</span>
              </div>
            )}
          </div>
        )}

        {/* Financial Highlights Table */}
        <div className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-xs">
          {/* Total Project Cost */}
          <div className="flex justify-between items-baseline">
            <span className="text-stone-500">Total Project Cost:</span>
            <span className="font-bold text-stone-900">{formatINR(projectCost)}</span>
          </div>

          {/* Financing Gap */}
          <div className="flex justify-between items-baseline">
            <span className="text-stone-500">Financing Gap:</span>
            <span className={`font-bold ${financingGap === 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
              {financingGap === 0 ? '₹0 (Fully Funded)' : formatINR(financingGap)}
            </span>
          </div>

          {/* Monthly Net Profit */}
          <div className="flex justify-between items-baseline">
            <span className="text-stone-500">Est. Monthly Net Profit:</span>
            <span className="font-bold text-emerald-800">{formatINR(monthlyNetProfit)}</span>
          </div>

          {/* Return on Investment */}
          <div className="flex justify-between items-baseline">
            <span className="text-stone-500">Annual ROI:</span>
            <span className="font-bold text-stone-900">{roi}%</span>
          </div>

          {/* Payback Period */}
          <div className="flex justify-between items-baseline">
            <span className="text-stone-500">Payback Period:</span>
            <span className="font-bold text-stone-900">{paybackYears} Years</span>
          </div>

          {/* Debt Metrics if financing gap exists */}
          {financingGap > 0 && (
            <div className="pt-2 border-t border-dashed border-stone-200 space-y-1.5 text-2xs text-stone-600">
              <div className="flex justify-between">
                <span>Monthly EMI:</span>
                <span className="font-semibold text-stone-800">{formatINR(monthlyEmi)}</span>
              </div>
              <div className="flex justify-between">
                <span>DSCR Coverage:</span>
                <span className={`font-bold ${dscr && dscr >= 1.4 ? 'text-emerald-800' : (dscr && dscr >= 1.25 ? 'text-amber-800' : 'text-rose-700')}`}>
                  {dscr ? `${dscr}×` : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Affordability Explanation Note */}
        <div className="mt-3 text-3xs text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
          {affordabilityReason}
        </div>
      </div>

      {/* CTA Button */}
      {onSelect && (
        <button
          onClick={() => onSelect(plan)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <span>View Complete Business Blueprint</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
