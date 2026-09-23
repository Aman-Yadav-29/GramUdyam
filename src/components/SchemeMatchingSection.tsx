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
  FileSpreadsheet
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { SchemeMatchingResult, SchemeMatch, EntrepreneurProfile } from '../types/scheme.ts';
import { GovernmentSchemeCard } from './GovernmentSchemeCard.tsx';
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
  locationType = 'rural'
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
    } catch (err: any) {
      setError(err.message || 'Failed to match schemes');
    } finally {
      setLoading(false);
    }
  }, [businessId, capitalAvailable, totalProjectCost, financingGap, state, district, locationType, age, gender, socialCategory, isNewBusiness, isFarmer]);

  useEffect(() => {
    runMatching();
  }, [runMatching]);

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
      {/* 1. Top Financing Requirement Header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              <Landmark className="h-4 w-4 text-stone-600" />
              <span>Deterministic Government Scheme & Loan Matching</span>
            </div>
            <h2 className="font-heading text-xl font-bold text-stone-900">
              Government Support for {businessName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
              <MapPin className="h-3.5 w-3.5 text-stone-400" />
              <span>Location: <strong>{district ? `${district}, ` : ''}{state}</strong> ({locationType.replace('_', ' ')})</span>
            </div>
          </div>

          {/* Financial Gap Summary Pill */}
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
              <p className="text-3xs text-stone-500 font-medium">
                * All profile questions are optional. Unprovided fields will remain in "Needs Verification" rather than being marked ineligible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Applicant Age (Years)
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="">Not Specified</option>
                    <option value="female">Woman Entrepreneur</option>
                    <option value="male">Male Entrepreneur</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Social Category */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Social Category
                  </label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="">Not Specified</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">Scheduled Caste (SC)</option>
                    <option value="st">Scheduled Tribe (ST)</option>
                    <option value="minority">Minority</option>
                  </select>
                </div>

                {/* Business Stage */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Enterprise Stage
                  </label>
                  <select
                    value={isNewBusiness ? 'new' : 'existing'}
                    onChange={(e) => setIsNewBusiness(e.target.value === 'new')}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="new">New Setup (Greenfield)</option>
                    <option value="existing">Existing Unit Expansion</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={isFarmer}
                    onChange={(e) => setIsFarmer(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span>Applicant is a registered farmer / agricultural landholder</span>
                </label>

                <button
                  onClick={runMatching}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Update Scheme Evaluation</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Error display if matching fails */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
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

          {/* 4. Scheme Cards List */}
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
                <GovernmentSchemeCard key={match.scheme.id} match={match} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Unobtrusive Official Mandatory Disclosure */}
      <div className="rounded-xl border border-stone-200 bg-stone-100/70 p-4 text-xs text-stone-600 flex items-start gap-3">
        <Info className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> Government scheme information is provided for transparent guidance based on available official government sources (.gov.in, .nic.in). Eligibility, loan sanctions, subsidy release, and interest terms are determined exclusively by the respective administrative department and financing bank. Please verify current guidelines directly on the official portal before submitting applications.
        </p>
      </div>
    </div>
  );
};
