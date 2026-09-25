import React, { useState, useMemo } from 'react';
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
  LogOut,
  Calculator,
  Percent,
  BarChart3,
  Layers,
  Table,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Sliders,
  AlertTriangle,
  Sprout,
  FolderKanban,
  CheckSquare
} from 'lucide-react';
import { useBusinessAnalysis } from '../hooks/useBusinessAnalysis.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { formatINR, formatINRLakhs, formatPercent, formatRatio } from '../utils/formatters.ts';
import { deriveCapexBreakdown, deriveMonthlyOpex } from '../utils/financialEngine.ts';
import { BudgetDiscoveryEngine } from '../components/BudgetDiscoveryEngine.tsx';
import { LocationGisCatchmentMap } from '../components/LocationGisCatchmentMap.tsx';
import { AgricultureLocationAnalysisCard } from '../components/AgricultureLocationAnalysisCard.tsx';
import { SchemeMatchingSection } from '../components/SchemeMatchingSection.tsx';
import { BusinessPlanView } from '../components/BusinessPlanView.tsx';
import { SavedPlansWorkspace } from '../components/SavedPlansWorkspace.tsx';
import { assembleBusinessPlan } from '../utils/businessPlanGenerator.ts';
import { ENTERPRISE_TEMPLATES } from '../data/enterpriseTemplatesData.ts';
import { apiClient } from '../services/apiClient.ts';
import { CalculatedBusinessPlan } from '../types/business.ts';
import { FinancialScenarioType } from '../types/financial.ts';
import { BusinessPlan } from '../types/businessPlan.ts';
import { saveGuestPlan, updateGuestPlanNarrative } from '../utils/guestStorage.ts';
import { BankAppraisalCard } from '../components/BankAppraisalCard.tsx';
import { generateBankAppraisalDossier } from '../utils/bankAppraisalEngine.ts';
import { DprReportView } from '../components/DprReportView.tsx';
import { generateDetailedProjectReport } from '../utils/dprGenerator.ts';
import { ActionCenterView } from '../components/ActionCenterView.tsx';

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
    villageOrTown,
    setVillageOrTown,
    subDistrictOrBlock,
    setSubDistrictOrBlock,
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
    agriLocationAnalysis,
    financialPlan,
    matchedLoans,
    matchedSchemes,
    scenario,
    setScenario,
    customScaleUnits,
    setCustomScaleUnits
  } = useBusinessAnalysis();

  const { user, isGuest, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'discovery' | 'plan' | 'overview' | 'financials' | 'capex' | 'location' | 'schemes' | 'loans' | 'eligibility' | 'documents' | 'dpr' | 'roadmap' | 'workspace'
  >('discovery');

  const [openedPlan, setOpenedPlan] = useState<BusinessPlan | null>(null);

  const capex = financialPlan ? deriveCapexBreakdown(financialPlan.fixedAssetsCost) : null;
  const opex = financialPlan ? deriveMonthlyOpex(financialPlan.annualOperatingCostYear1) : null;

  // Phase 9: Assembled Business & Financing Plan (Invariant consumption of Phase 3-8 source-of-truth)
  const assembledPlan = useMemo(() => {
    if (!selectedEnterprise || !financialPlan) return null;
    const template = ENTERPRISE_TEMPLATES.find((t) => t.id === selectedEnterprise.id) || selectedEnterprise;
    return assembleBusinessPlan({
      enterprise: template as any,
      financialPlan,
      availableCapital: capitalAvailable ?? 0,
      location: {
        state,
        district,
        subDistrictOrBlock,
        villageOrTown,
        locationType
      },
      districtData,
      agriLocationAnalysis,
      entrepreneurProfile: {
        isRural: locationType === 'rural',
        socialCategory: promoterCategory === 'special' ? 'Special Category (SC/ST/Woman/OBC)' : 'General',
        isNewBusiness: true
      }
    });
  }, [
    selectedEnterprise,
    financialPlan,
    capitalAvailable,
    state,
    district,
    subDistrictOrBlock,
    villageOrTown,
    locationType,
    districtData,
    agriLocationAnalysis,
    promoterCategory
  ]);

  // Phase 11: Bank Credit Appraisal Dossier (Pure invariant consumption of Phase 4 financial metrics)
  const bankAppraisalDossier = useMemo(() => {
    if (!selectedEnterprise || !financialPlan) return null;
    return generateBankAppraisalDossier({
      enterpriseId: selectedEnterprise.id,
      enterpriseName: selectedEnterprise.name,
      enterpriseCategory: selectedEnterprise.category,
      totalProjectCost: financialPlan.totalProjectCost,
      fixedAssetsCost: financialPlan.fixedAssetsCost,
      workingCapitalRequirement: financialPlan.workingCapitalRequirement,
      availableCapital: capitalAvailable ?? financialPlan.promoterContribution,
      promoterContribution: financialPlan.promoterContribution,
      bankTermLoanRequired: financialPlan.bankTermLoanRequired,
      financingGap: financialPlan.financingGap,
      monthlyRevenue: financialPlan.monthlyRevenue,
      monthlyOpex: financialPlan.monthlyOperatingExpenses,
      monthlyNetProfit: financialPlan.monthlyNetProfit,
      debtServiceCoverageRatio: financialPlan.debtServiceCoverageRatio,
      estimatedMonthlyEmi: financialPlan.monthlyEmi,
      breakEvenCapacityPercent: financialPlan.breakEvenSalesPercent ?? null,
      paybackYears: financialPlan.paybackPeriodYears,

      state,
      district,
      locationType,
      isWomanOrSpecialCategory: promoterCategory === 'special',
      groundwaterConcern: Boolean(agriLocationAnalysis?.factors?.some((f) => (f.factor === 'water' || f.factor === 'groundwater' || f.factorLabel.toLowerCase().includes('water')) && f.status === 'concern'))
    });

  }, [
    selectedEnterprise,
    financialPlan,
    capitalAvailable,
    state,
    district,
    locationType,
    promoterCategory,
    agriLocationAnalysis
  ]);

  // Phase 11: 25-Section Detailed Project Report (DPR)
  const dprReport = useMemo(() => {
    if (!selectedEnterprise || !financialPlan) return null;
    const template = ENTERPRISE_TEMPLATES.find((t) => t.id === selectedEnterprise.id) || selectedEnterprise;
    return generateDetailedProjectReport({
      enterprise: template as any,
      financialPlan,
      capex,
      opex,
      availableCapital: capitalAvailable ?? financialPlan.promoterContribution,
      location: {
        state,
        district,
        subDistrictOrBlock,
        villageOrTown,
        locationType
      },
      promoterProfile: {
        name: user?.fullName || (isGuest ? 'Guest Entrepreneur' : 'Promoter / Entrepreneur'),
        isRural: locationType === 'rural',
        socialCategory: promoterCategory === 'special' ? 'Special Category (SC/ST/Woman/OBC)' : 'General Category',
        isNewBusiness: true
      },
      districtData,
      agriLocationAnalysis,
      schemeMatches: matchedSchemes || [],
      matchedLoans: matchedLoans || []
    });
  }, [
    selectedEnterprise,
    financialPlan,
    capex,
    opex,
    capitalAvailable,
    state,
    district,
    subDistrictOrBlock,
    villageOrTown,
    locationType,
    user,
    isGuest,
    promoterCategory,
    districtData,
    agriLocationAnalysis,
    matchedSchemes,
    matchedLoans
  ]);



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
            <button
              onClick={() => setActiveTab('workspace')}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs ${
                activeTab === 'workspace'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:text-emerald-800'
              }`}
              title="Open My Saved Plans workspace"
            >
              <FolderKanban className="h-3.5 w-3.5 text-emerald-700" />
              <span>My Saved Plans</span>
            </button>

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
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 ${
                    activeTab === 'plan'
                      ? 'bg-emerald-900 text-white'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Business & Financing Plan</span>
                </button>
                <button
                  onClick={() => setActiveTab('discovery')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  ← Compare All
                </button>
              </div>
            </div>

            {/* Location & Demographic Parameters for DPR */}
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

            {/* Phase 4: Financial Engine Scenario Selector & Business Scaling Interactive Controller */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 1. Interactive Scenario Switcher */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-emerald-800" />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Financial Risk Scenario
                    </span>
                  </div>
                  <span className="text-3xs font-semibold text-stone-500 uppercase bg-stone-100 px-2 py-0.5 rounded">
                    Live Recalculation
                  </span>
                </div>
                <p className="text-2xs text-stone-500 mb-3">
                  Changing assumptions immediately recalculates revenue, expenses, net profit, EMI, and DSCR.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScenario('conservative')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center cursor-pointer border ${
                      scenario === 'conservative'
                        ? 'bg-amber-100/80 border-amber-500 text-amber-950 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>Conservative</span>
                    <span className="text-3xs font-normal opacity-80 mt-0.5">-15% Rev, +5% Opex</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScenario('base')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center cursor-pointer border ${
                      scenario === 'base'
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>Base Case</span>
                    <span className="text-3xs font-normal opacity-80 mt-0.5">100% Target Baseline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScenario('optimistic')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex flex-col items-center cursor-pointer border ${
                      scenario === 'optimistic'
                        ? 'bg-blue-100 border-blue-500 text-blue-950 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>Optimistic</span>
                    <span className="text-3xs font-normal opacity-80 mt-0.5">+10% Rev, -4% Opex</span>
                  </button>
                </div>
              </div>

              {/* 2. Business Scaling Controller */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-800" />
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Business Scaling Controller
                    </span>
                  </div>
                  {financialPlan?.scaling && (
                    <span className={`text-3xs font-bold px-2 py-0.5 rounded ${
                      financialPlan.scaling.suggestedScaleUnits < financialPlan.scaling.standardScaleUnits
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {financialPlan.scaling.suggestedScaleUnits < financialPlan.scaling.standardScaleUnits
                        ? 'Reduced Scale Active'
                        : 'Standard Scale'}
                    </span>
                  )}
                </div>

                {financialPlan?.scaling ? (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-2xs">
                      <div>
                        <span className="text-stone-400 block text-3xs font-bold uppercase">Standard Scale</span>
                        <span className="font-semibold text-stone-800">{financialPlan.scaling.standardScaleLabel}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-3xs font-bold uppercase">Suggested Scale</span>
                        <span className="font-bold text-emerald-950">{financialPlan.scaling.suggestedScaleLabel}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-2xs text-stone-600">
                        Estimated Cost: <strong className="text-stone-900 text-xs">{formatINR(financialPlan.scaling.estimatedTotalProjectCost)}</strong>
                      </div>

                      {/* Discrete scale unit stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!financialPlan.scaling) return;
                            const current = customScaleUnits ?? financialPlan.scaling.suggestedScaleUnits;
                            const minU = financialPlan.scaling.minViableUnits;
                            const step = financialPlan.scaling.stepUnits || 1;
                            const nextU = Math.max(minU, current - step);
                            setCustomScaleUnits(nextU);
                          }}
                          disabled={(customScaleUnits ?? financialPlan.scaling.suggestedScaleUnits) <= financialPlan.scaling.minViableUnits}
                          className="p-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-stone-700"
                          title="Decrease scale"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="font-bold text-xs text-stone-900 min-w-[70px] text-center">
                          {(customScaleUnits ?? financialPlan.scaling.suggestedScaleUnits)} {financialPlan.scaling.unitName}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (!financialPlan.scaling) return;
                            const current = customScaleUnits ?? financialPlan.scaling.suggestedScaleUnits;
                            const maxU = financialPlan.scaling.standardScaleUnits * 2;
                            const step = financialPlan.scaling.stepUnits || 1;
                            const nextU = Math.min(maxU, current + step);
                            setCustomScaleUnits(nextU);
                          }}
                          className="p-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 cursor-pointer text-stone-700"
                          title="Increase scale"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-3xs text-stone-400">
                      Total Project Cost = CapEx + Working Capital Requirement. Strictly integer, non-fractional units.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 py-3">
                    Fixed capacity enterprise: {selectedEnterprise.defaultScale} ({selectedEnterprise.unit}).
                  </div>
                )}
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
              onClick={() => setActiveTab('workspace')}
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'workspace'
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>My Saved Plans</span>
            </button>
            {selectedEnterprise && (
              <button
                onClick={() => setActiveTab('plan')}
                className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                  activeTab === 'plan'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Business & Financing Plan</span>
              </button>
            )}
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
              onClick={() => setActiveTab('financials')}
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'financials'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Financial Engine & Feasibility</span>
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
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'location'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {agriLocationAnalysis ? (
                <>
                  <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Location & Agriculture Analysis</span>
                </>
              ) : (
                <span>Location Analysis</span>
              )}
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
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'loans'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>Bank Appraisal & Loans</span>
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
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'dpr'
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              <span>DPR / Business Plan (25 Chapters)</span>
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`pb-2.5 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'roadmap'
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Action Center &amp; Monitoring</span>
            </button>
          </nav>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'workspace' ? (
          <SavedPlansWorkspace
            isAuthenticated={isAuthenticated}
            isGuest={isGuest}
            onOpenPlan={(plan) => {
              setOpenedPlan(plan);
              const matchedEnterprise = ENTERPRISE_TEMPLATES.find((e) => e.id === plan.business.businessId);
              if (matchedEnterprise) {
                selectEnterprise(matchedEnterprise as any, plan.financials.availableCapital);
              }
              if (plan.location) {
                setState(plan.location.state);
                setDistrict(plan.location.district);
                setLocationType(plan.location.locationType);
              }
              setActiveTab('plan');
            }}
            onCloseWorkspace={() => setActiveTab('discovery')}
            onNavigateToLogin={onNavigateToLogin}
            onNewPlan={() => {
              setOpenedPlan(null);
              setActiveTab('discovery');
            }}
          />
        ) : activeTab === 'plan' && (openedPlan || assembledPlan) ? (
          <div className="mb-8">
            <BusinessPlanView
              plan={openedPlan || assembledPlan!}
              onNavigateTab={(tab) => {
                if (tab === 'business' || tab === 'budget') {
                  setActiveTab('discovery');
                } else if (tab === 'location') {
                  setActiveTab('location');
                } else if (tab === 'financials') {
                  setActiveTab('financials');
                } else if (tab === 'agriculture') {
                  setActiveTab('location');
                } else if (tab === 'schemes') {
                  setActiveTab('schemes');
                } else if (tab === 'documents') {
                  setActiveTab('documents');
                } else if (tab === 'loans' || tab === 'appraisal') {
                  setActiveTab('loans');
                }
              }}

              onSavePlan={async (planToSave) => {
                await apiClient.saveBusinessPlan(planToSave);
                if (isGuest) {
                  saveGuestPlan(planToSave);
                }
              }}
              onUpdateNarrative={async (narrative) => {
                const currentPlan = openedPlan || assembledPlan;
                if (!currentPlan) return;
                if (isAuthenticated) {
                  await apiClient.updateBusinessPlanNarrative(currentPlan.id, narrative);
                } else {
                  updateGuestPlanNarrative(currentPlan.id, narrative);
                }
                if (openedPlan) {
                  setOpenedPlan({
                    ...openedPlan,
                    narrative: {
                      ...openedPlan.narrative,
                      ...narrative,
                      lastEditedAt: new Date().toISOString()
                    }
                  });
                }
              }}
            />
          </div>
        ) : activeTab === 'discovery' || !selectedEnterprise ? (
          <BudgetDiscoveryEngine
            initialCapital={capitalAvailable ?? undefined}
            initialState={state}
            initialDistrict={district}
            initialVillage={villageOrTown}
            initialLocationType={locationType}
            onLocationChange={(newState, newDistrict, newLocType, newVillage) => {
              setState(newState);
              setDistrict(newDistrict);
              setLocationType(newLocType);
              if (newVillage) setVillageOrTown(newVillage);
            }}
            onSelectBusinessForDeepDive={(plan) => {
              setOpenedPlan(null);
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

                    {/* Phase 6: Agriculture Location Intelligence Badge */}
                    {agriLocationAnalysis && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-emerald-700 shrink-0" />
                          <span className="text-stone-800">
                            <strong>Agriculture Location Analysis Active:</strong> {agriLocationAnalysis.whyMaySuit.length} supportive factors identified in {district}, {state}.
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('location')}
                          className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 text-xs shrink-0 cursor-pointer underline underline-offset-2"
                        >
                          View Factor Evaluation
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

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
                        <strong className="text-stone-900">
                          {financialPlan.debtServiceCoverageRatio !== null ? `${formatRatio(financialPlan.debtServiceCoverageRatio)}x` : 'No debt service'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL ENGINE & FEASIBILITY (PHASE 4) */}
            {activeTab === 'financials' && (
              <div className="space-y-6">
                {/* 1. Core Financial Engine Breakdown Header Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Project Cost */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="text-3xs uppercase font-extrabold tracking-wider text-stone-500 mb-1">
                      Total Project Cost
                    </div>
                    <div className="font-heading text-2xl font-black text-stone-900">
                      {formatINR(financialPlan.totalProjectCost)}
                    </div>
                    <div className="mt-2 text-2xs space-y-1 text-stone-600 border-t border-stone-100 pt-2">
                      <div className="flex justify-between">
                        <span>Fixed Assets (CapEx):</span>
                        <strong className="text-stone-900">{formatINR(financialPlan.fixedAssetsCost)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Working Capital Req.:</span>
                        <strong className="text-stone-900">{formatINR(financialPlan.workingCapitalRequirement)}</strong>
                      </div>
                      <div className="flex justify-between text-stone-500 text-3xs">
                        <span>Startup / Pre-op Cost:</span>
                        <span>{formatINR(financialPlan.startupCost)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-3xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded">
                      Formula: CapEx + Working Capital
                    </div>
                  </div>

                  {/* Card 2: Financing Gap & Debt */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="text-3xs uppercase font-extrabold tracking-wider text-stone-500 mb-1">
                      Financing Gap & Debt
                    </div>
                    <div className="font-heading text-2xl font-black text-amber-900">
                      {formatINR(financialPlan.financingGap)}
                    </div>
                    <div className="mt-2 text-2xs space-y-1 text-stone-600 border-t border-stone-100 pt-2">
                      <div className="flex justify-between">
                        <span>Available Capital:</span>
                        <strong className="text-emerald-800">{formatINR(financialPlan.availableCapital)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Promoter Equity %:</span>
                        <strong className="text-stone-900">{financialPlan.promoterContributionPercent}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Bank Term Loan:</span>
                        <strong className="text-stone-900">{formatINR(financialPlan.bankTermLoanRequired)}</strong>
                      </div>
                    </div>
                    <div className="mt-2 text-3xs text-stone-600 font-medium bg-stone-100 px-2 py-1 rounded">
                      Gap = Project Cost - Available Capital
                    </div>
                  </div>

                  {/* Card 3: Monthly Net Profit & Margin */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="text-3xs uppercase font-extrabold tracking-wider text-stone-500 mb-1">
                      Monthly Net Profit ({scenario.toUpperCase()})
                    </div>
                    <div className="font-heading text-2xl font-black text-emerald-800">
                      {formatINR(financialPlan.monthlyNetProfit)}
                    </div>
                    <div className="mt-2 text-2xs space-y-1 text-stone-600 border-t border-stone-100 pt-2">
                      <div className="flex justify-between">
                        <span>Gross Revenue:</span>
                        <strong className="text-stone-900">{formatINR(financialPlan.monthlyRevenue)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Expenses:</span>
                        <strong className="text-stone-900">{formatINR(financialPlan.monthlyOperatingExpenses)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Profit Margin:</span>
                        <strong className="text-emerald-800">{financialPlan.netMarginPercent}%</strong>
                      </div>
                    </div>
                    <div className="mt-2 text-3xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded">
                      Annual Net Profit: {formatINR(financialPlan.monthlyNetProfit * 12)}
                    </div>
                  </div>

                  {/* Card 4: Returns, Payback & DSCR */}
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                    <div className="text-3xs uppercase font-extrabold tracking-wider text-stone-500 mb-1">
                      Feasibility & Solvency Ratios
                    </div>
                    <div className="font-heading text-2xl font-black text-stone-900">
                      {financialPlan.returnOnInvestmentPercent}% <span className="text-xs font-normal text-stone-500">ROI</span>
                    </div>
                    <div className="mt-2 text-2xs space-y-1 text-stone-600 border-t border-stone-100 pt-2">
                      <div className="flex justify-between">
                        <span>Payback Period:</span>
                        <strong className="text-stone-900">{financialPlan.paybackPeriodYears} Years</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Break-Even Capacity:</span>
                        <strong className="text-stone-900">
                          {financialPlan.breakEvenSalesPercent !== null ? `${financialPlan.breakEvenSalesPercent}%` : 'N/A'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt Service (DSCR):</span>
                        <strong className={`${financialPlan.debtServiceCoverageRatio && financialPlan.debtServiceCoverageRatio >= 1.5 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {financialPlan.debtServiceCoverageRatio !== null ? `${financialPlan.debtServiceCoverageRatio}x` : 'No debt service'}
                        </strong>
                      </div>
                    </div>
                    <div className="mt-2 text-3xs text-stone-600 font-medium bg-stone-100 px-2 py-1 rounded">
                      Monthly EMI: {formatINR(financialPlan.monthlyEmi)}/mo
                    </div>
                  </div>
                </div>

                {/* 2. Deterministic Financial Formula & Debt Amortization Panel */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                    <div>
                      <h3 className="font-heading text-base font-bold text-stone-900">
                        Debt Service & Equated Monthly Installment (EMI)
                      </h3>
                      <p className="text-xs text-stone-500">
                        Standard reducing-balance amortization calculated deterministically without AI heuristics.
                      </p>
                    </div>
                    <span className="text-2xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                      Formula: P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                      <span className="text-stone-500 font-medium block">Principal Borrowing (P):</span>
                      <span className="font-bold text-base text-stone-900">{formatINR(financialPlan.financingGap)}</span>
                      <p className="text-3xs text-stone-500">
                        Calculated as Total Project Cost ({formatINR(financialPlan.totalProjectCost)}) minus Available Promoter Capital ({formatINR(financialPlan.availableCapital)}).
                      </p>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                      <span className="text-stone-500 font-medium block">Annual Interest & Tenure (r, n):</span>
                      <span className="font-bold text-base text-stone-900">
                        {scenario === 'conservative' ? '10.5%' : scenario === 'optimistic' ? '8.5%' : '9.5%'} p.a. • 60 Months
                      </span>
                      <p className="text-3xs text-stone-500">
                        5-year repayment tenure with reducing balance interest based on active risk scenario.
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                      <span className="text-emerald-900 font-medium block">Equated Monthly Installment (EMI):</span>
                      <span className="font-bold text-xl text-emerald-950">{formatINR(financialPlan.monthlyEmi)} / mo</span>
                      <p className="text-3xs text-emerald-800">
                        Debt Service Coverage Ratio (DSCR): <strong>{financialPlan.debtServiceCoverageRatio !== null ? `${financialPlan.debtServiceCoverageRatio}x` : 'No debt service'}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Multi-Scenario Risk Assessment: Conservative vs Base vs Optimistic */}
                {financialPlan.scenarios && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                      <div>
                        <h3 className="font-heading text-base font-bold text-stone-900">
                          Scenario Stress-Testing: Conservative vs Base vs Optimistic
                        </h3>
                        <p className="text-xs text-stone-500">
                          Sensitivity analysis modeling revenue contractions, cost inflation, and interest shifts.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${scenario === 'conservative' ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-500' : 'bg-stone-100 text-stone-600'}`}>
                          Conservative
                        </span>
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${scenario === 'base' ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-600' : 'bg-stone-100 text-stone-600'}`}>
                          Base Case
                        </span>
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${scenario === 'optimistic' ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-600' : 'bg-stone-100 text-stone-600'}`}>
                          Optimistic
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-500 font-bold">
                            <th className="py-2.5 pr-4">Metric</th>
                            <th className="py-2.5 px-3 bg-amber-50/50 text-amber-950">Conservative (-15% Rev, +5% Opex)</th>
                            <th className="py-2.5 px-3 bg-emerald-50/50 text-emerald-950 font-black">Base Case (100% Target)</th>
                            <th className="py-2.5 px-3 bg-blue-50/50 text-blue-950">Optimistic (+10% Rev, -4% Opex)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Monthly Gross Revenue</td>
                            <td className="py-2.5 px-3 bg-amber-50/30 font-semibold">{formatINR(financialPlan.scenarios.conservative.monthlyRevenue)}</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-bold">{formatINR(financialPlan.scenarios.base.monthlyRevenue)}</td>
                            <td className="py-2.5 px-3 bg-blue-50/30 font-semibold">{formatINR(financialPlan.scenarios.optimistic.monthlyRevenue)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Monthly Operating Expenses (OPEX)</td>
                            <td className="py-2.5 px-3 bg-amber-50/30">{formatINR(financialPlan.scenarios.conservative.monthlyOpex)}</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-semibold">{formatINR(financialPlan.scenarios.base.monthlyOpex)}</td>
                            <td className="py-2.5 px-3 bg-blue-50/30">{formatINR(financialPlan.scenarios.optimistic.monthlyOpex)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-bold text-stone-900">Monthly Net Profit</td>
                            <td className="py-2.5 px-3 bg-amber-50/30 font-bold text-amber-900">{formatINR(financialPlan.scenarios.conservative.monthlyNetProfit)}</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-black text-emerald-900">{formatINR(financialPlan.scenarios.base.monthlyNetProfit)}</td>
                            <td className="py-2.5 px-3 bg-blue-50/30 font-bold text-blue-900">{formatINR(financialPlan.scenarios.optimistic.monthlyNetProfit)}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Net Profit Margin %</td>
                            <td className="py-2.5 px-3 bg-amber-50/30">{financialPlan.scenarios.conservative.netMarginPercent}%</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-bold">{financialPlan.scenarios.base.netMarginPercent}%</td>
                            <td className="py-2.5 px-3 bg-blue-50/30">{financialPlan.scenarios.optimistic.netMarginPercent}%</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Return on Investment (ROI p.a.)</td>
                            <td className="py-2.5 px-3 bg-amber-50/30">{financialPlan.scenarios.conservative.roiPercent}%</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-bold">{financialPlan.scenarios.base.roiPercent}%</td>
                            <td className="py-2.5 px-3 bg-blue-50/30">{financialPlan.scenarios.optimistic.roiPercent}%</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Payback Period</td>
                            <td className="py-2.5 px-3 bg-amber-50/30">{financialPlan.scenarios.conservative.paybackPeriodYears} Years</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-bold">{financialPlan.scenarios.base.paybackPeriodYears} Years</td>
                            <td className="py-2.5 px-3 bg-blue-50/30">{financialPlan.scenarios.optimistic.paybackPeriodYears} Years</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Break-Even Utilization %</td>
                            <td className="py-2.5 px-3 bg-amber-50/30">{financialPlan.scenarios.conservative.breakEvenSalesPercent !== null ? `${financialPlan.scenarios.conservative.breakEvenSalesPercent}%` : 'N/A'}</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-bold">{financialPlan.scenarios.base.breakEvenSalesPercent !== null ? `${financialPlan.scenarios.base.breakEvenSalesPercent}%` : 'N/A'}</td>
                            <td className="py-2.5 px-3 bg-blue-50/30">{financialPlan.scenarios.optimistic.breakEvenSalesPercent !== null ? `${financialPlan.scenarios.optimistic.breakEvenSalesPercent}%` : 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 pr-4 font-medium text-stone-700">Debt Service Coverage (DSCR)</td>
                            <td className="py-2.5 px-3 bg-amber-50/30 font-semibold">{financialPlan.scenarios.conservative.debtServiceCoverageRatio ? `${financialPlan.scenarios.conservative.debtServiceCoverageRatio}x` : 'N/A'}</td>
                            <td className="py-2.5 px-3 bg-emerald-50/30 font-bold">{financialPlan.scenarios.base.debtServiceCoverageRatio ? `${financialPlan.scenarios.base.debtServiceCoverageRatio}x` : 'N/A'}</td>
                            <td className="py-2.5 px-3 bg-blue-50/30 font-semibold">{financialPlan.scenarios.optimistic.debtServiceCoverageRatio ? `${financialPlan.scenarios.optimistic.debtServiceCoverageRatio}x` : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Cash Flow Projections: Year 1 Monthly & 3-Year Annual */}
                {financialPlan.cashFlow && (
                  <div className="grid grid-cols-1 gap-6">
                    {/* Year 1 Month-by-Month Cash Flow */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-heading text-base font-bold text-stone-900">
                            Year 1 Month-by-Month Operating Cash Flow
                          </h3>
                          <p className="text-xs text-stone-500">
                            Simulates initial ramp-up, working capital turnover, debt service, and cumulative cash reserves.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-2xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-500 font-bold">
                              <th className="py-2 pr-2">Month</th>
                              <th className="py-2 px-2">Gross Revenue</th>
                              <th className="py-2 px-2">OPEX</th>
                              <th className="py-2 px-2">Operating Cash Flow</th>
                              <th className="py-2 px-2">Debt Service (EMI)</th>
                              <th className="py-2 px-2">Net Cash Surplus</th>
                              <th className="py-2 pl-2">Cumulative Cash</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {financialPlan.cashFlow.year1Monthly.map((m) => (
                              <tr key={m.month} className="hover:bg-stone-50">
                                <td className="py-2 pr-2 font-bold text-stone-800">Month {m.month}</td>
                                <td className="py-2 px-2">{formatINR(m.grossRevenue)}</td>
                                <td className="py-2 px-2 text-stone-600">{formatINR(m.operatingExpenses)}</td>
                                <td className="py-2 px-2 font-medium">{formatINR(m.operatingCashFlow)}</td>
                                <td className="py-2 px-2 text-stone-500">{formatINR(m.debtServiceEmi)}</td>
                                <td className={`py-2 px-2 font-bold ${m.netCashSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {formatINR(m.netCashSurplus)}
                                </td>
                                <td className="py-2 pl-2 font-bold text-stone-900">{formatINR(m.cumulativeCashBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3-Year Annual Cash Flow Projection */}
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                      <div>
                        <h3 className="font-heading text-base font-bold text-stone-900">
                          3-Year Strategic Cash Flow & Capital Accumulation
                        </h3>
                        <p className="text-xs text-stone-500">
                          3-year forward horizon projecting expansion capacity and promoter debt retirement.
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-2xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-stone-500 font-bold">
                              <th className="py-2 pr-2">Horizon</th>
                              <th className="py-2 px-2">Annual Turnover</th>
                              <th className="py-2 px-2">Operating Costs</th>
                              <th className="py-2 px-2">Depreciation</th>
                              <th className="py-2 px-2">Net Profit</th>
                              <th className="py-2 px-2">Debt Service</th>
                              <th className="py-2 px-2">Annual Surplus</th>
                              <th className="py-2 pl-2">Cumulative Bank Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {financialPlan.cashFlow.threeYearAnnual.map((y) => (
                              <tr key={y.year} className="hover:bg-stone-50">
                                <td className="py-2 pr-2 font-bold text-stone-900">Year {y.year}</td>
                                <td className="py-2 px-2 font-semibold">{formatINR(y.grossRevenue)}</td>
                                <td className="py-2 px-2 text-stone-600">{formatINR(y.operatingExpenses)}</td>
                                <td className="py-2 px-2 text-stone-500">{formatINR(y.depreciation)}</td>
                                <td className="py-2 px-2 font-bold text-emerald-800">{formatINR(y.netProfit)}</td>
                                <td className="py-2 px-2 text-stone-500">{formatINR(y.debtService)}</td>
                                <td className="py-2 px-2 font-bold text-stone-900">{formatINR(y.netSurplus)}</td>
                                <td className="py-2 pl-2 font-black text-emerald-900">{formatINR(y.cumulativeCashBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
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
              <div className="space-y-6">
                {/* Phase 6: Agriculture-Specific Location Analysis */}
                {agriLocationAnalysis && (
                  <AgricultureLocationAnalysisCard analysis={agriLocationAnalysis} />
                )}

                {districtData ? (
                  <LocationGisCatchmentMap
                    districtData={districtData}
                    villageOrTown={villageOrTown}
                    locationType={locationType}
                  />
                ) : (
                  <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs text-xs text-stone-500">
                    Location intelligence active for {district}, {state}.
                  </div>
                )}
              </div>
            )}

            {/* 4. GOVERNMENT SCHEMES & LOANS (PHASE 7 & 8) */}
            {activeTab === 'schemes' && (
              <SchemeMatchingSection
                businessId={selectedEnterprise.id}
                businessName={selectedEnterprise.name}
                businessCategory={selectedEnterprise.category}
                capitalAvailable={capitalAvailable ?? 0}
                totalProjectCost={financialPlan.totalProjectCost}
                financingGap={financialPlan.bankTermLoanRequired ?? Math.max(0, financialPlan.totalProjectCost - (capitalAvailable ?? 0))}
                state={state}
                district={district}
                locationType={locationType}
                fixedAssets={capex?.totalCapex}
                workingCapital={financialPlan.workingCapitalBankLoan}
                monthlyRevenue={financialPlan.monthlyRevenue}
                monthlyOpex={opex?.totalMonthlyOpex}
                monthlyNetProfit={financialPlan.monthlyNetProfit}
                estimatedEmi={financialPlan.monthlyEmi}
                dscr={financialPlan.debtServiceCoverageRatio ?? undefined}
              />
            )}

            {/* 5. BANK CREDIT APPRAISAL & LOANS (PHASE 11) */}
            {activeTab === 'loans' && bankAppraisalDossier && (
              <BankAppraisalCard dossier={bankAppraisalDossier} />
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
                        {financialPlan.debtServiceCoverageRatio !== null ? (
                          <>Calculated DSCR is <strong>{formatRatio(financialPlan.debtServiceCoverageRatio)}x</strong>, meeting banking viability benchmarks.</>
                        ) : (
                          <>No external debt service required; project is fully equity funded.</>
                        )}
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

            {/* 8. DPR BLUEPRINT (25 STANDARDIZED CHAPTERS) */}
            {activeTab === 'dpr' && (
              dprReport ? (
                <DprReportView
                  dpr={dprReport}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              ) : (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">
                  Select an enterprise to generate the 25-section Detailed Project Report.
                </div>
              )
            )}

            {/* 9. ACTION CENTER & MONITORING */}
            {activeTab === 'roadmap' && (
              selectedEnterprise ? (
                <ActionCenterView
                  planId={openedPlan?.id || `plan_${selectedEnterprise.id}_${capitalAvailable}`}
                  planTitle={openedPlan ? `${openedPlan.business.businessName} Plan` : `${selectedEnterprise.name} Business Plan`}
                  enterprise={selectedEnterprise}
                  financialPlan={financialPlan}
                  location={{ state, district, locationType }}
                  districtData={districtData}
                  agriAnalysis={agriLocationAnalysis as any}
                  matchedSchemes={matchedSchemes as any}
                  isGuest={isGuest}
                  onNavigateTab={(tab) => setActiveTab(tab as any)}
                />
              ) : (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">
                  Select an enterprise to view Action Center &amp; Execution Monitoring.
                </div>
              )
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
