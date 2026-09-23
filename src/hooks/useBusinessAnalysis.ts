import { useState, useEffect, useCallback } from 'react';
import { EnterpriseIdea, DiscoveryResult } from '../types/business.ts';
import { DistrictIntelligence } from '../types/location.ts';
import { FinancialPlan, FinancialScenarioType } from '../types/financial.ts';
import { apiClient } from '../services/apiClient.ts';
import { POPULAR_INDIAN_STATES } from '../data/locationBenchmarksData.ts';

export function useBusinessAnalysis() {
  const [capitalAvailable, setCapitalAvailable] = useState<number | null>(null);
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [district, setDistrict] = useState<string>('Varanasi');
  const [villageOrTown, setVillageOrTown] = useState<string>('Raja Talab');
  const [subDistrictOrBlock, setSubDistrictOrBlock] = useState<string>('Arajiline');
  const [locationType, setLocationType] = useState<'rural' | 'semi_urban' | 'urban'>('rural');
  const [promoterCategory, setPromoterCategory] = useState<'general' | 'special'>('general');
  const [preferredCategory, setPreferredCategory] = useState<string>('all');
  const [scenario, setScenario] = useState<FinancialScenarioType>('base');
  const [customScaleUnits, setCustomScaleUnits] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseIdea | null>(null);
  const [districtData, setDistrictData] = useState<DistrictIntelligence | null>(null);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [matchedLoans, setMatchedLoans] = useState<any[]>([]);

  // Helper to recompute financial plan when parameters change
  const recomputePlan = useCallback(async (
    enterprise: EnterpriseIdea,
    capital: number,
    currentScenario: FinancialScenarioType,
    scaleUnits?: number
  ) => {
    try {
      const [finResult, districtIntel] = await Promise.all([
        apiClient.calculateFinancialPlan({
          enterpriseId: enterprise.id,
          capitalAvailable: capital,
          promoterCategory,
          locationType: locationType === 'urban' ? 'urban' : 'rural',
          state,
          district,
          scenario: currentScenario,
          customScaleUnits: scaleUnits
        }),
        apiClient.getDistrictData(state, district)
      ]);
      setFinancialPlan(finResult.plan);
      setDistrictData(districtIntel);

      const loans = await apiClient.matchLoans(finResult.plan.bankTermLoanRequired, promoterCategory === 'special');
      setMatchedLoans(loans);
    } catch (err: any) {
      console.warn('Could not compute financial plan:', err);
    }
  }, [promoterCategory, locationType, state, district]);

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
        await recomputePlan(selectedEnterprise, capitalAvailable, scenario, customScaleUnits);
      }
    } catch (err: any) {
      console.error('Discovery error:', err);
      setError(err.message || 'Failed to analyze business opportunities');
    } finally {
      setLoading(false);
    }
  }, [capitalAvailable, state, district, locationType, preferredCategory, selectedEnterprise, recomputePlan, scenario, customScaleUnits]);

  // Select a business enterprise for deep-dive
  const selectEnterprise = async (enterprise: EnterpriseIdea, capitalOverride?: number) => {
    setSelectedEnterprise(enterprise);
    setCustomScaleUnits(undefined); // Reset custom scale when selecting new enterprise
    const effectiveCapital = capitalOverride ?? capitalAvailable ?? 0;
    if (effectiveCapital <= 0) return;

    await recomputePlan(enterprise, effectiveCapital, scenario, undefined);
  };

  // Recalculate when scenario or customScaleUnits changes
  const updateScenario = useCallback((newScenario: FinancialScenarioType) => {
    setScenario(newScenario);
    if (selectedEnterprise && capitalAvailable && capitalAvailable > 0) {
      recomputePlan(selectedEnterprise, capitalAvailable, newScenario, customScaleUnits);
    }
  }, [selectedEnterprise, capitalAvailable, customScaleUnits, recomputePlan]);

  const updateScaleUnits = useCallback((newUnits: number | undefined) => {
    setCustomScaleUnits(newUnits);
    if (selectedEnterprise && capitalAvailable && capitalAvailable > 0) {
      recomputePlan(selectedEnterprise, capitalAvailable, scenario, newUnits);
    }
  }, [selectedEnterprise, capitalAvailable, scenario, recomputePlan]);

  return {
    availableCapital: capitalAvailable,
    setAvailableCapital: setCapitalAvailable,
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
    preferredCategory,
    setPreferredCategory,
    availableStates: POPULAR_INDIAN_STATES,
    scenario,
    setScenario: updateScenario,
    customScaleUnits,
    setCustomScaleUnits: updateScaleUnits,
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
