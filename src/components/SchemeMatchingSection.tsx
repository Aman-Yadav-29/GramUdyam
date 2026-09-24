import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Landmark,
  IndianRupee,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  MapPin,
  ClipboardList,
  FileCheck,
  Building
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { SchemeMatchingResult, SchemeMatch, EntrepreneurProfile } from '../types/scheme.ts';
import { SchemeReadinessPlan, UserDocumentDeclaration } from '../types/documentReadiness.ts';
import { GovernmentSchemeCard } from './GovernmentSchemeCard.tsx';
import { DocumentReadinessChecklist } from './DocumentReadinessChecklist.tsx';
import { formatINR } from '../utils/formatters.ts';

interface SchemeMatchingSectionProps {
  businessId: string;
  businessName: string;
  capitalAvailable: number;
  totalProjectCost: number;
  financingGap: number;
  state: string;
  district?: string;
  locationType?: 'rural' | 'semi_urban' | 'urban';
  businessCategory?: string;
  fixedAssets?: number;
  workingCapital?: number;
  monthlyRevenue?: number;
  monthlyOpex?: number;
  monthlyNetProfit?: number;
  estimatedEmi?: number;
  dscr?: number;
}

type FilterCategory = 'all' | 'eligible' | 'potentially_eligible' | 'needs_verification' | 'not_eligible';

export const SchemeMatchingSection: React.FC<SchemeMatchingSectionProps> = ({
  businessId,
  businessName,
  capitalAvailable,
  totalProjectCost,
  financingGap,
  state,
  district,
  locationType = 'rural',
  businessCategory,
  fixedAssets,
  workingCapital,
  monthlyRevenue,
  monthlyOpex,
  monthlyNetProfit,
  estimatedEmi,
  dscr
}) => {
  // Minimal optional entrepreneur profile state
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<string>('');
  const [socialCategory, setSocialCategory] = useState<string>('');
  const [isNewBusiness, setIsNewBusiness] = useState<boolean>(true);
  const [isFarmer, setIsFarmer] = useState<boolean>(false);
  const [showProfileForm, setShowProfileForm] = useState<boolean>(false);

  // Result state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matchingResult, setMatchingResult] = useState<SchemeMatchingResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  // Phase 8: View state & Document Readiness
  const [mainView, setMainView] = useState<'matching' | 'readiness'>('matching');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [readinessPlan, setReadinessPlan] = useState<SchemeReadinessPlan | null>(null);
  const [readinessLoading, setReadinessLoading] = useState<boolean>(false);
  const [isSavingReadiness, setIsSavingReadiness] = useState<boolean>(false);

  const runMatching = useCallback(async () => {
    if (!businessId || !state) return;

    setLoading(true);
    setError(null);

    const profile: EntrepreneurProfile = {
      age: age !== '' ? Number(age) : undefined,
      gender: gender || undefined,
      socialCategory: socialCategory || undefined,
      isWomanEntrepreneur: gender === 'female',
      isNewBusiness,
      isExistingBusiness: !isNewBusiness,
      isFarmer,
      isRuralEntrepreneur: locationType === 'rural'
    };

    try {
      const result = await apiClient.matchSchemes({
        businessId,
        availableCapital: capitalAvailable,
        projectCost: totalProjectCost,
        financingGap,
        location: {
          state,
          district,
          ruralUrban: locationType
        },
        entrepreneurProfile: profile
      });

      setMatchingResult(result);

      // Default selected scheme for readiness to first match if not yet chosen
      if (!selectedSchemeId && result.matches.length > 0) {
        const preferred = result.matches.find((m) => m.status === 'eligible') ||
          result.matches.find((m) => m.status === 'potentially_eligible') ||
          result.matches[0];
        setSelectedSchemeId(preferred.scheme.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to match schemes');
    } finally {
      setLoading(false);
    }
  }, [businessId, capitalAvailable, totalProjectCost, financingGap, state, district, locationType, age, gender, socialCategory, isNewBusiness, isFarmer, selectedSchemeId]);

  useEffect(() => {
    runMatching();
  }, [runMatching]);

  // Load Document Readiness when selectedSchemeId changes or tab opened
  const loadReadiness = useCallback(async (schemeId: string) => {
    if (!schemeId) return;

    setReadinessLoading(true);
    try {
      // Find matching status if available
      const match = matchingResult?.matches.find((m) => m.scheme.id === schemeId);
      const eligibilityStatus = match?.status || 'needs_verification';

      const plan = await apiClient.getSchemeReadiness(schemeId, {
        eligibilityStatus,
        businessName,
        businessCategory,
        projectCost: totalProjectCost,
        availableCapital: capitalAvailable,
        financingGap,
        fixedAssets,
        workingCapital,
        monthlyRevenue,
        monthlyOpex,
        monthlyNetProfit,
        estimatedEmi,
        dscr
      });

      // Overlay any local declarations from localStorage for guest persistence
      const storageKey = `gramudyam_readiness_${schemeId}`;
      let localDecls: Record<string, UserDocumentDeclaration> = {};
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          localDecls = JSON.parse(raw);
        }
      } catch {
        // ignore
      }

      const mergedDeclarations = { ...plan.userDeclarations, ...localDecls };

      // Update document userStatus and calculate summary
      let markedAvailable = 0;
      let needToPrepare = 0;
      let needVerification = 0;

      const updatedDocs = plan.documents.map((d) => {
        const userStatus = mergedDeclarations[d.id] || d.initialStatus;
        if (userStatus === 'available') markedAvailable++;
        else if (userStatus === 'to_prepare') needToPrepare++;
        else needVerification++;

        return {
          ...d,
          userStatus
        };
      });

      setReadinessPlan({
        ...plan,
        documents: updatedDocs,
        userDeclarations: mergedDeclarations,
        summary: {
          totalRequired: updatedDocs.length,
          markedAvailable,
          needToPrepare,
          needVerification
        }
      });
    } catch (err: any) {
      console.error('Failed to load readiness plan:', err);
    } finally {
      setReadinessLoading(false);
    }
  }, [matchingResult, businessName, businessCategory, totalProjectCost, capitalAvailable, financingGap, fixedAssets, workingCapital, monthlyRevenue, monthlyOpex, monthlyNetProfit, estimatedEmi, dscr]);

  useEffect(() => {
    if (selectedSchemeId && mainView === 'readiness') {
      loadReadiness(selectedSchemeId);
    }
  }, [selectedSchemeId, mainView, loadReadiness]);

  // Handle user changing declaration on a document
  const handleDeclarationChange = (docId: string, status: UserDocumentDeclaration) => {
    if (!readinessPlan || !selectedSchemeId) return;

    const newDeclarations: Record<string, UserDocumentDeclaration> = {
      ...readinessPlan.userDeclarations,
      [docId]: status
    };

    // Save to localStorage for instant guest responsiveness
    try {
      localStorage.setItem(`gramudyam_readiness_${selectedSchemeId}`, JSON.stringify(newDeclarations));
    } catch {
      // ignore
    }

    let markedAvailable = 0;
    let needToPrepare = 0;
    let needVerification = 0;

    const updatedDocs = readinessPlan.documents.map((d) => {
      const userStatus = newDeclarations[d.id] || d.initialStatus;
      if (userStatus === 'available') markedAvailable++;
      else if (userStatus === 'to_prepare') needToPrepare++;
      else needVerification++;

      return {
        ...d,
        userStatus
      };
    });

    setReadinessPlan({
      ...readinessPlan,
      documents: updatedDocs,
      userDeclarations: newDeclarations,
      summary: {
        totalRequired: updatedDocs.length,
        markedAvailable,
        needToPrepare,
        needVerification
      }
    });
  };

  // Save declarations to backend
  const handleSaveReadiness = async () => {
    if (!readinessPlan || !selectedSchemeId) return;

    setIsSavingReadiness(true);
    try {
      await apiClient.saveSchemeReadiness(selectedSchemeId, readinessPlan.userDeclarations);
      // Also cache to localStorage
      localStorage.setItem(`gramudyam_readiness_${selectedSchemeId}`, JSON.stringify(readinessPlan.userDeclarations));
    } catch (err) {
      console.error('Failed to save readiness:', err);
    } finally {
      setIsSavingReadiness(false);
    }
  };

  // Action on scheme card to jump straight to readiness
  const handleSelectForReadiness = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setMainView('readiness');
    loadReadiness(schemeId);
  };

  // Filter matches based on selected category tab
  const filteredMatches = useMemo(() => {
    if (!matchingResult) return [];
    if (activeCategory === 'all') return matchingResult.matches;
    if (activeCategory === 'eligible') return matchingResult.categorized.eligible;
    if (activeCategory === 'potentially_eligible') return matchingResult.categorized.potentiallyEligible;
    if (activeCategory === 'needs_verification') return matchingResult.categorized.needsVerification;
    if (activeCategory === 'not_eligible') return matchingResult.categorized.notEligible;
    return matchingResult.matches;
  }, [matchingResult, activeCategory]);

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation: Scheme Evaluation vs Document Preparation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainView('matching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 ${
              mainView === 'matching'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Government Schemes ({matchingResult?.totalEvaluated || 12})</span>
          </button>

          <button
            onClick={() => {
              setMainView('readiness');
              if (selectedSchemeId) loadReadiness(selectedSchemeId);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 ${
              mainView === 'readiness'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Application Readiness & Documents</span>
          </button>
        </div>

        {/* Financial gap reminder */}
        <div className="text-xs text-stone-600">
          Financing Gap: <strong className="text-amber-900 font-bold">{formatINR(financingGap)}</strong>
        </div>
      </div>

      {/* VIEW A: GOVERNMENT SCHEMES MATCHING LIST */}
      {mainView === 'matching' && (
        <div className="space-y-6">
          {/* Top Financing Requirement Header */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                  <Landmark className="h-4 w-4 text-stone-600" />
                  <span>Phase 7: Deterministic Government Scheme & Loan Matching</span>
                </div>
                <h2 className="font-heading text-xl font-bold text-stone-900">
                  Government Support for {businessName}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span>Location: <strong>{district ? `${district}, ` : ''}{state}</strong> ({locationType.replace('_', ' ')})</span>
                </div>
              </div>

              {/* Financial Gap Summary */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-3xs text-stone-500 block">Project Cost</span>
                  <strong className="text-stone-900 text-sm block">{formatINR(totalProjectCost)}</strong>
                </div>
                <div className="border-l border-stone-200 pl-3">
                  <span className="text-3xs text-stone-500 block">Available Capital</span>
                  <strong className="text-stone-700 text-sm block">{formatINR(capitalAvailable)}</strong>
                </div>
                <div className="border-l border-stone-200 pl-3">
                  <span className="text-3xs text-stone-500 block">Financing Gap to Fund</span>
                  <strong className="text-amber-800 text-sm block font-black">{formatINR(financingGap)}</strong>
                </div>
              </div>
            </div>

            {/* Minimal Profile Input Section */}
            <div className="mt-5 border-t border-stone-100 pt-4">
              <button
                onClick={() => setShowProfileForm(!showProfileForm)}
                className="flex items-center gap-2 text-xs font-bold text-stone-800 hover:text-stone-900"
              >
                <SlidersHorizontal className="h-4 w-4 text-stone-600" />
                <span>{showProfileForm ? 'Hide Entrepreneur Profile Filter' : 'Refine With Entrepreneur Profile (Age, Gender, Social Category)'}</span>
                {showProfileForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showProfileForm && (
                <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-3xs font-bold uppercase text-stone-500 mb-1">
                        Applicant Age
                      </label>
                      <input
                        type="number"
                        min={18}
                        max={80}
                        value={age}
                        onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 28"
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-stone-400 focus:outline-none"
                      />
                      <span className="text-3xs text-stone-400 mt-0.5 block">Some schemes enforce 18–40 or 18–45 yrs</span>
                    </div>

                    <div>
                      <label className="block text-3xs font-bold uppercase text-stone-500 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-stone-400 focus:outline-none"
                      >
                        <option value="">Unspecified (Any)</option>
                        <option value="female">Woman Entrepreneur</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="text-3xs text-stone-400 mt-0.5 block">Unlocks Women-priority benefits</span>
                    </div>

                    <div>
                      <label className="block text-3xs font-bold uppercase text-stone-500 mb-1">
                        Social Category
                      </label>
                      <select
                        value={socialCategory}
                        onChange={(e) => setSocialCategory(e.target.value)}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-stone-400 focus:outline-none"
                      >
                        <option value="">Unspecified (General)</option>
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC (Scheduled Caste)</option>
                        <option value="st">ST (Scheduled Tribe)</option>
                        <option value="minority">Minority</option>
                      </select>
                      <span className="text-3xs text-stone-400 mt-0.5 block">Affects subsidy slab & equity margin</span>
                    </div>

                    <div>
                      <label className="block text-3xs font-bold uppercase text-stone-500 mb-1">
                        Enterprise Stage
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="bizStage"
                            checked={isNewBusiness}
                            onChange={() => setIsNewBusiness(true)}
                            className="text-stone-900"
                          />
                          <span>New / Greenfield</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="bizStage"
                            checked={!isNewBusiness}
                            onChange={() => setIsNewBusiness(false)}
                            className="text-stone-900"
                          />
                          <span>Existing Unit</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-stone-200">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFarmer}
                        onChange={(e) => setIsFarmer(e.target.checked)}
                        className="rounded border-stone-300 text-stone-900"
                      />
                      <span>Applicant holds Farmer / Cultivator status</span>
                    </label>

                    <button
                      onClick={runMatching}
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Update Scheme Evaluation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error display if matching fails */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Filter Tabs */}
          {matchingResult && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Evaluated ({matchingResult.totalEvaluated})
                </button>

                <button
                  onClick={() => setActiveCategory('eligible')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                    activeCategory === 'eligible'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Conditions Met ({matchingResult.categorized.eligible.length})</span>
                </button>

                <button
                  onClick={() => setActiveCategory('potentially_eligible')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                    activeCategory === 'potentially_eligible'
                      ? 'bg-blue-800 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <span>Potentially Compatible ({matchingResult.categorized.potentiallyEligible.length})</span>
                </button>

                <button
                  onClick={() => setActiveCategory('needs_verification')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                    activeCategory === 'needs_verification'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Needs More Info ({matchingResult.categorized.needsVerification.length})</span>
                </button>

                <button
                  onClick={() => setActiveCategory('not_eligible')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 ${
                    activeCategory === 'not_eligible'
                      ? 'bg-stone-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Not Eligible ({matchingResult.categorized.notEligible.length})</span>
                </button>
              </div>

              {/* Scheme Cards List */}
              {loading ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-500">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-stone-400 mb-2" />
                  Evaluating government scheme criteria against project cost and entrepreneur profile...
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center text-xs text-stone-500">
                  No government schemes in this specific category for the current profile parameters.
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredMatches.map((match) => (
                    <GovernmentSchemeCard
                      key={match.scheme.id}
                      match={match}
                      onSelectForReadiness={handleSelectForReadiness}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: APPLICATION READINESS & DOCUMENT CHECKLIST (PHASE 8) */}
      {mainView === 'readiness' && (
        <div className="space-y-6">
          {/* Scheme Switcher Dropdown */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-stone-600" />
              <span className="text-xs font-bold text-stone-700">Select Scheme for Readiness Preparation:</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSchemeId || ''}
                onChange={(e) => {
                  setSelectedSchemeId(e.target.value);
                  loadReadiness(e.target.value);
                }}
                className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs max-w-xs sm:max-w-md"
              >
                {matchingResult?.matches.map((m) => (
                  <option key={m.scheme.id} value={m.scheme.id}>
                    {m.scheme.name} ({m.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Readiness Checklist View */}
          {readinessLoading ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-stone-400 mb-2" />
              Loading scheme document checklist and application workflow...
            </div>
          ) : readinessPlan ? (
            <DocumentReadinessChecklist
              plan={readinessPlan}
              businessName={businessName}
              projectCost={totalProjectCost}
              availableCapital={capitalAvailable}
              financingGap={financingGap}
              onDeclarationChange={handleDeclarationChange}
              onSave={handleSaveReadiness}
              isSaving={isSavingReadiness}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-xs text-stone-500">
              Please select a government scheme above to view its document checklist.
            </div>
          )}
        </div>
      )}

      {/* Unobtrusive Official Mandatory Disclosure */}
      <div className="rounded-xl border border-stone-200 bg-stone-100/70 p-4 text-xs text-stone-600 flex items-start gap-3">
        <Info className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> Government scheme information is provided for transparent guidance based on available official government sources (.gov.in, .nic.in). Eligibility, loan sanctions, subsidy release, and interest terms are determined exclusively by the respective administrative department and financing bank. Please verify current guidelines directly on the official portal before submitting applications.
        </p>
      </div>
    </div>
  );
};
