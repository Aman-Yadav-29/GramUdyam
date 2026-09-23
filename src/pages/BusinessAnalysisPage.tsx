import React, { useState } from 'react';
import { 
  ArrowLeft, 
  IndianRupee, 
  MapPin, 
  Building2, 
  Award, 
  LineChart, 
  Landmark, 
  CheckCircle2, 
  FileText, 
  Download,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Printer,
  Compass,
  ListChecks,
  Clock,
  UserCheck,
  LogIn,
  LogOut
} from 'lucide-react';
import { useBusinessAnalysis } from '../hooks/useBusinessAnalysis.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { formatINR, formatINRLakhs, formatPercent, formatRatio } from '../utils/formatters.ts';
import { deriveCapexBreakdown, deriveMonthlyOpex } from '../utils/financialEngine.ts';
import { BudgetDiscoveryEngine } from '../components/BudgetDiscoveryEngine.tsx';
import { CalculatedBusinessPlan } from '../types/business.ts';

interface BusinessAnalysisPageProps {
  onBackToHome: () => void;
  onNavigateToLogin?: () => void;
}

export const BusinessAnalysisPage: React.FC<BusinessAnalysisPageProps> = ({
  onBackToHome,
  onNavigateToLogin
}) => {
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

  const { user, isGuest, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'discovery' | 'overview' | 'capex' | 'location' | 'schemes' | 'loans' | 'eligibility' | 'documents' | 'dpr' | 'roadmap'
  >('discovery');

  const capex = financialPlan ? deriveCapexBreakdown(financialPlan.totalProjectCost) : null;
  const opex = financialPlan ? deriveMonthlyOpex(financialPlan.annualOperatingCostYear1) : null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 hidden md:inline">
              Location: <strong className="text-stone-800">{district}, {state}</strong>
            </span>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{user.fullName || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Guest Session (All Features Unlocked)</span>
                </div>
                {onNavigateToLogin && (
                  <button
                    onClick={onNavigateToLogin}
                    className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Page Title & Context */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
            Enterprise Analysis & Financial Feasibility Hub
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-600">
            Full bankability modeling, government capital subsidies, district intelligence, and DPR preview.
          </p>
        </div>

        {/* Selected Enterprise Banner & Deep-Dive Parameter Controls (shown only when inspecting a specific enterprise) */}
        {selectedEnterprise && activeTab !== 'discovery' && (
          <div className="space-y-4 mb-6">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-2xs font-bold uppercase tracking-wider text-emerald-800">
                  Active Enterprise Deep-Dive
                </div>
                <div className="text-base font-bold text-stone-900">
                  {selectedEnterprise.name}
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  {selectedEnterprise.tagline}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('discovery')}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer self-start sm:self-center shrink-0"
              >
                ← Compare All Businesses by Budget
              </button>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
              <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                Location & Demographic Parameters for DPR
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    State & District
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-800"
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
                      className="rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-xs font-semibold text-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Area Demographics
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-800"
                  >
                    <option value="rural">Rural (Eligible for 35% PMEGP)</option>
                    <option value="semi_urban">Semi-Urban</option>
                    <option value="urban">Urban (15-25% PMEGP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Promoter Social Category
                  </label>
                  <select
                    value={promoterCategory}
                    onChange={(e) => setPromoterCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-800"
                  >
                    <option value="general">General Category (10% Equity Margin)</option>
                    <option value="special">Special (SC / ST / Women / OBC / Ex-SM) (5% Margin)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs - Covering Budget Discovery + All Deep-Dive Modules */}
        <div className="border-b border-stone-200 mb-6 overflow-x-auto">
          <nav className="flex space-x-6 text-xs sm:text-sm font-semibold whitespace-nowrap pb-1">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'discovery'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <IndianRupee className="h-3.5 w-3.5" />
              <span>Budget Discovery (All Businesses)</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Overview & Viability
            </button>
            <button
              onClick={() => setActiveTab('capex')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'capex'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Budget & CAPEX
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'location'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Location Analysis
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'schemes'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Government Schemes
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'loans'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Loan Discovery & EMI
            </button>
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'eligibility'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Eligibility Check
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'documents'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Documents Checklist
            </button>
            <button
              onClick={() => setActiveTab('dpr')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'dpr'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              DPR Blueprint
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`pb-2.5 border-b-2 cursor-pointer transition ${
                activeTab === 'roadmap'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Action Plan
            </button>
          </nav>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'discovery' || !selectedEnterprise ? (
          <BudgetDiscoveryEngine
            initialCapital={capitalAvailable ?? undefined}
            onSelectBusinessForDeepDive={(plan) => {
              setCapitalAvailable(plan.availableCapital);
              selectEnterprise(plan.business as any, plan.availableCapital);
              setActiveTab('overview');
            }}
          />
        ) : selectedEnterprise && financialPlan ? (
          <div>
            {/* 1. OVERVIEW & VIABILITY */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                    <h2 className="font-heading text-xl font-bold text-stone-900">
                      {selectedEnterprise.name}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {selectedEnterprise.tagline}
                    </p>
                    <p className="text-sm text-stone-700 leading-relaxed mt-4">
                      {selectedEnterprise.description}
                    </p>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-stone-100 pt-5 text-xs">
                      <div>
                        <span className="text-stone-500 text-2xs uppercase">Floor Space:</span>
                        <div className="font-bold text-stone-900 mt-0.5">{selectedEnterprise.spaceRequiredSqFt} sq. ft.</div>
                      </div>
                      <div>
                        <span className="text-stone-500 text-2xs uppercase">Power Sanction:</span>
                        <div className="font-bold text-stone-900 mt-0.5">{selectedEnterprise.powerRequiredHp} HP</div>
                      </div>
                      <div>
                        <span className="text-stone-500 text-2xs uppercase">Gestation Period:</span>
                        <div className="font-bold text-stone-900 mt-0.5">{selectedEnterprise.gestationPeriodMonths} Months</div>
                      </div>
                      <div>
                        <span className="text-stone-500 text-2xs uppercase">Risk Profile:</span>
                        <div className="font-bold text-stone-900 mt-0.5 capitalize">{selectedEnterprise.typicalRiskLevel} Risk</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                    <h3 className="font-heading text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                      Required Machinery & Production Assets
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {(selectedEnterprise.keyMachinery || selectedEnterprise.keyRawMaterials || ['Processing equipment', 'Quality testing bench']).map((mach: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                          <span className="text-stone-800 font-medium">{mach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                    <h3 className="font-heading text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                      Capital Structure
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Total Project Scale:</span>
                        <strong className="font-heading text-sm text-stone-900">{formatINRLakhs(financialPlan.totalProjectCost)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Promoter Equity ({financialPlan.promoterContributionPercent}%):</span>
                        <strong className="text-emerald-700">{formatINRLakhs(financialPlan.promoterContribution)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Subsidy Estimate:</span>
                        <strong className="text-purple-700">{formatINRLakhs(financialPlan.eligibleSubsidyEstimate)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Bank Term Loan:</span>
                        <strong className="text-blue-700">{formatINRLakhs(financialPlan.bankTermLoanRequired)}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="text-stone-500">Working Capital Loan:</span>
                        <strong className="text-stone-800">{formatINRLakhs(financialPlan.workingCapitalBankLoan)}</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-stone-500">DSCR Ratio:</span>
                        <strong className="text-stone-900">{formatRatio(financialPlan.debtServiceCoverageRatio)}x</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BUDGET & CAPEX */}
            {activeTab === 'capex' && capex && opex && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                  <h3 className="font-heading text-base font-bold text-stone-900 mb-1">
                    Capital Expenditure (CAPEX) — {formatINRLakhs(capex.totalCapex)}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Fixed investments in plant, building, electrification, and pre-operative trials.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Plant & Machinery</span>
                      <strong>{formatINRLakhs(capex.plantAndMachinery)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Building & Civil Works</span>
                      <strong>{formatINRLakhs(capex.buildingAndCivilWorks)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Electrification & Utilities</span>
                      <strong>{formatINRLakhs(capex.electrificationAndUtilities)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Site Development</span>
                      <strong>{formatINRLakhs(capex.landAndSiteDevelopment)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Pre-operative & Trial Costs</span>
                      <strong>{formatINRLakhs(capex.preOperativeExpenses)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Contingencies</span>
                      <strong>{formatINRLakhs(capex.contingencies)}</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                  <h3 className="font-heading text-base font-bold text-stone-900 mb-1">
                    Monthly Operating Expenses (OPEX) — {formatINRLakhs(opex.totalMonthlyOpex)}/mo
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Working capital required to maintain rolling factory throughput.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Raw Materials & Consumables</span>
                      <strong>{formatINRLakhs(opex.rawMaterials)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Wages & Salaries</span>
                      <strong>{formatINRLakhs(opex.laborAndWages)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Electricity & Fuel</span>
                      <strong>{formatINRLakhs(opex.utilitiesAndPower)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Packaging & Freight</span>
                      <strong>{formatINRLakhs(opex.packagingAndTransport)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span>Marketing & Administration</span>
                      <strong>{formatINRLakhs(opex.marketingAndAdmin)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOCATION ANALYSIS */}
            {activeTab === 'location' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center gap-2 text-stone-900 font-heading text-lg font-bold">
                  <MapPin className="h-5 w-5 text-emerald-700" />
                  <span>District Resource & Catchment Analysis ({district}, {state})</span>
                </div>

                {districtData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-4 rounded-xl bg-stone-50 p-4 border border-stone-200">
                      <div className="font-bold text-stone-900 text-sm">Agricultural & Raw Material Surpluses</div>
                      <div>Agro-Climatic Zone: <strong>{districtData.agroClimaticZone}</strong></div>
                      <div>
                        Primary Agricultural Crops:
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {districtData.keySurplusCrops.map((c, i) => (
                            <span key={i} className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-2xs font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        Prominent APMC / Trade Mandis:
                        <div className="text-stone-700 mt-1">{districtData.prominentLocalMarkets.join(', ')}</div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-stone-50 p-4 border border-stone-200">
                      <div className="font-bold text-stone-900 text-sm">Industrial & Institutional Infrastructure</div>
                      <div>Power Reliability: <strong>{districtData.powerReliabilityScore} / 10 Grid Score</strong></div>
                      <div>Water Availability: <strong>{districtData.waterAvailabilityScore} / 10 Abundance Score</strong></div>
                      <div>Lead Bank Office: <strong>{districtData.leadBankName}</strong></div>
                      <div>DIC Office: <strong>{districtData.districtIndustryCenterAddress}</strong></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    Location intelligence active for {district}, {state}.
                  </p>
                )}
              </div>
            )}

            {/* 4. GOVERNMENT SCHEMES */}
            {activeTab === 'schemes' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Applicable Government Credit Subsidies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-900 text-sm">PMEGP Scheme</span>
                      <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        Up to 35% Subsidy
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mb-3">
                      Prime Minister Employment Generation Programme. Margin money subsidy deposited in 3-year term deposit receipt.
                    </p>
                    <div className="text-xs text-stone-700 font-medium">
                      Calculated Subsidy for this Project: <strong className="text-purple-900 font-bold">{formatINRLakhs(financialPlan.eligibleSubsidyEstimate)}</strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-emerald-900 text-sm">PMFME Scheme</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        35% Grant Capped at ₹10L
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mb-3">
                      PM Formalisation of Micro Food Processing Enterprises Scheme under MoFPI. Dedicated to ODOP and micro-clusters.
                    </p>
                    <div className="text-xs text-stone-700 font-medium">
                      Maximum Grant Cap: <strong className="text-emerald-900 font-bold">₹10,00,000</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LOAN DISCOVERY & EMI */}
            {activeTab === 'loans' && matchedLoans && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Institutional Loan Products & Amortization
                </h3>
                <p className="text-xs text-stone-500">
                  Loan term: ₹{formatINRLakhs(financialPlan.bankTermLoanRequired)} with estimated reducing-balance EMI.
                </p>
                <div className="divide-y divide-stone-100">
                  {matchedLoans.map((loan, idx) => (
                    <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{loan.name}</div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          Guarantee: {loan.creditGuaranteeCover} • Processing Fee: {loan.processingFeePercent}%
                        </div>
                        <div className="text-2xs text-stone-400 mt-1">
                          Key Docs: {loan.requiredDocuments.join(', ')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-stone-500">Estimated Monthly EMI</div>
                        <div className="font-heading font-extrabold text-stone-900 text-base">
                          {formatINR(loan.estimatedEmi)} / mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ELIGIBILITY CHECK */}
            {activeTab === 'eligibility' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Promoter & Scheme Eligibility Matrix
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-950">Age & Educational Criteria</div>
                      <div className="text-stone-700 mt-0.5">Age 18+ verified. For manufacturing projects above ₹10 Lakhs, minimum 8th standard pass is fulfilled.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-950">Capital Margin Equity Match</div>
                      <div className="text-stone-700 mt-0.5">
                        Your available capital of {formatINRLakhs(capitalAvailable ?? financialPlan.promoterContribution)} satisfies the required promoter equity of {financialPlan.promoterContributionPercent}% ({formatINRLakhs(financialPlan.promoterContribution)}).
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-950">Bankability & DSCR Viability</div>
                      <div className="text-stone-700 mt-0.5">
                        Calculated DSCR is <strong>{formatRatio(financialPlan.debtServiceCoverageRatio)}x</strong>, comfortably exceeding the mandatory banking threshold of 1.50x.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. DOCUMENTS CHECKLIST */}
            {activeTab === 'documents' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-stone-900">
                      Prescribed Document Dossier
                    </h3>
                    <p className="text-xs text-stone-500">
                      Standard KYC, technical quotations, and NOC checklist required by DIC and Branch Managers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-stone-200 p-4 bg-stone-50">
                    <div className="font-bold text-stone-900 mb-2">Promoter KYC & Legal</div>
                    <ul className="space-y-1.5 text-stone-600">
                      <li>✓ Aadhaar Card & PAN Card</li>
                      <li>✓ Passport sized photographs (3 copies)</li>
                      <li>✓ Social Category Certificate (if claiming special subsidy)</li>
                      <li>✓ Proof of residence (Electricity bill / Voter ID)</li>
                      <li>✓ Highest educational qualification certificate</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-stone-200 p-4 bg-stone-50">
                    <div className="font-bold text-stone-900 mb-2">Technical & Project Documents</div>
                    <ul className="space-y-1.5 text-stone-600">
                      <li>✓ Detailed Project Report (DPR) with financial statements</li>
                      <li>✓ Machinery quotations from certified suppliers</li>
                      <li>✓ Land possession deed or registered lease agreement (min 5 years)</li>
                      <li>✓ Building layout plan & civil shed estimates</li>
                      <li>✓ Electricity connection sanction letter or DG set proposal</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 8. DPR BLUEPRINT PREVIEW */}
            {activeTab === 'dpr' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Official DIC & Bank Format
                    </span>
                    <h3 className="font-heading text-xl font-bold text-stone-900 mt-1">
                      Detailed Project Report (DPR) — {selectedEnterprise.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print / PDF</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs text-stone-700 leading-relaxed font-mono bg-stone-50 p-5 rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-900 text-sm">CHAPTER 1: EXECUTIVE SUMMARY</div>
                  <p>
                    Proposed enterprise: {selectedEnterprise.name}. Location: {district}, {state}.
                    Estimated Total Project Outlay: ₹{financialPlan.totalProjectCost.toLocaleString('en-IN')}.
                    Promoter Contribution ({financialPlan.promoterContributionPercent}%): ₹{financialPlan.promoterContribution.toLocaleString('en-IN')}.
                    Bank Term Loan Proposed: ₹{financialPlan.bankTermLoanRequired.toLocaleString('en-IN')}.
                    Subsidy Under PMEGP/PMFME: ₹{financialPlan.eligibleSubsidyEstimate.toLocaleString('en-IN')}.
                  </p>

                  <div className="font-bold text-stone-900 text-sm pt-2">CHAPTER 2: PROJECTED FINANCIAL RATIOS</div>
                  <p>
                    • Debt Service Coverage Ratio (DSCR): {financialPlan.debtServiceCoverageRatio.toFixed(2)}x
                    <br />• Break-Even Point (Capacity Utilization): {financialPlan.breakEvenSalesPercent.toFixed(1)}%
                    <br />• Annual Gross Receipts (Year 1): ₹{financialPlan.annualTurnoverYear1.toLocaleString('en-IN')}
                    <br />• Net Profit After Tax (PAT Year 1): ₹{financialPlan.profitAfterTax.toLocaleString('en-IN')}
                    <br />• Capital Payback Period: {financialPlan.paybackPeriodYears} Years
                  </p>
                </div>
              </div>
            )}

            {/* 9. ACTION PLAN */}
            {activeTab === 'roadmap' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Action Plan & Next Steps
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">1</span>
                    <div>
                      <div className="font-bold text-stone-900">Zero-Fee Udyam Registration</div>
                      <div className="text-stone-600 mt-0.5">Visit udyamregistration.gov.in and register using Aadhaar.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">2</span>
                    <div>
                      <div className="font-bold text-stone-900">Procure Machinery Quotations</div>
                      <div className="text-stone-600 mt-0.5">Collect 2-3 competitive proforma invoices for {selectedEnterprise.keyMachinery?.[0] || 'core processing plant machinery'}.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">3</span>
                    <div>
                      <div className="font-bold text-stone-900">Submit Application on KVIC / PMEGP Portal</div>
                      <div className="text-stone-600 mt-0.5">Upload DPR and select {districtData?.districtIndustryCenterAddress || 'Local DIC'} as implementing agency.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 text-sm">
            Recalculating enterprise analysis...
          </div>
        )}
      </main>
    </div>
  );
};
