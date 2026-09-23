import { useState, useEffect, useCallback } from 'react';
import { EnterpriseIdea, DiscoveryResult } from '../types/business.ts';
import { DistrictIntelligence } from '../types/location.ts';
import { FinancialPlan } from '../types/financial.ts';
import { apiClient } from '../services/apiClient.ts';
import { POPULAR_INDIAN_STATES } from '../data/locationBenchmarksData.ts';

export function useBusinessAnalysis() {
  const [capitalAvailable, setCapitalAvailable] = useState<number | null>(null);
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [district, setDistrict] = useState<string>('Varanasi');
  const [locationType, setLocationType] = useState<'rural' | 'semi_urban' | 'urban'>('rural');
  const [promoterCategory, setPromoterCategory] = useState<'general' | 'special'>('general');
  const [preferredCategory, setPreferredCategory] = useState<string>('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseIdea | null>(null);
  const [districtData, setDistrictData] = useState<DistrictIntelligence | null>(null);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [matchedLoans, setMatchedLoans] = useState<any[]>([]);

  // Run discovery (for older / legacy views if needed)
  const runDiscovery = useCallback(async () => {
    if (!capitalAvailable || capitalAvailable <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const [discovery, districtIntel] = await Promise.all([
        apiClient.discoverEnterprises({
          capitalAvailable,
          state,
          district,
          locationType,
          preferredCategory: preferredCategory === 'all' ? undefined : (preferredCategory as any)
        }),
        apiClient.getDistrictData(state, district)
      ]);

      setDiscoveryResult(discovery);
      setDistrictData(districtIntel);

      if (selectedEnterprise) {
        const finResult = await apiClient.calculateFinancialPlan({
          enterpriseId: selectedEnterprise.id,
          capitalAvailable,
          promoterCategory,
          locationType: locationType === 'urban' ? 'urban' : 'rural',
          state,
          district
        });
        setFinancialPlan(finResult.plan);

        const loans = await apiClient.matchLoans(finResult.plan.bankTermLoanRequired, promoterCategory === 'special');
        setMatchedLoans(loans);
      }
    } catch (err: any) {
      console.error('Discovery error:', err);
      setError(err.message || 'Failed to analyze business opportunities');
    } finally {
      setLoading(false);
    }
  }, [capitalAvailable, state, district, locationType, preferredCategory, promoterCategory, selectedEnterprise]);

  // Select a business enterprise for deep-dive
  const selectEnterprise = async (enterprise: EnterpriseIdea, capitalOverride?: number) => {
    setSelectedEnterprise(enterprise);
    const effectiveCapital = capitalOverride ?? capitalAvailable ?? 0;
    if (effectiveCapital <= 0) return;

    try {
      const [finResult, districtIntel] = await Promise.all([
        apiClient.calculateFinancialPlan({
          enterpriseId: enterprise.id,
          capitalAvailable: effectiveCapital,
          promoterCategory,
          locationType: locationType === 'urban' ? 'urban' : 'rural',
          state,
          district
        }),
        apiClient.getDistrictData(state, district)
      ]);
      setFinancialPlan(finResult.plan);
      setDistrictData(districtIntel);

      const loans = await apiClient.matchLoans(finResult.plan.bankTermLoanRequired, promoterCategory === 'special');
      setMatchedLoans(loans);
    } catch (err: any) {
      console.warn('Could not recompute financial plan:', err);
    }
  };

  return {
    availableCapital: capitalAvailable,
    setAvailableCapital: setCapitalAvailable,
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
    preferredCategory,
    setPreferredCategory,
    availableStates: POPULAR_INDIAN_STATES,
    loading,
    error,
    discoveryResult,
    selectedEnterprise,
    selectEnterprise,
    districtData,
    financialPlan,
    matchedLoans,
    refreshAnalysis: runDiscovery
  };
}
