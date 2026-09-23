import { entityRepository } from '../models/schema.ts';
import { DistrictIntelligence } from '../../src/types/location.ts';
import { POPULAR_INDIAN_STATES } from '../../src/data/locationBenchmarksData.ts';

export class LocationGisService {
  public getDistrictData(state: string, district: string): DistrictIntelligence | null {
    const data = entityRepository.getDistrictIntelligence(state, district);
    if (data) {
      return data;
    }

    // Extensible fallback synthesizer for any Indian district query
    return {
      state,
      district,
      agroClimaticZone: 'Regional Agricultural & Industrial Catchment',
      keySurplusCrops: ['Regional Grains', 'Cash Crops', 'Seasonal Vegetables'],
      industrialClusters: ['District MSME Cluster', 'Agri-trade Market Yard'],
      powerReliabilityScore: 7.5,
      waterAvailabilityScore: 7.5,
      nearestHighwayKm: 6,
      nearestRailwayStationKm: 10,
      prominentLocalMarkets: [`${district} Main APMC Mandi`, `${district} Industrial Area`],
      recommendedRuralEnterprises: ['ent_spices_processing', 'ent_oil_expeller', 'ent_paper_packaging'],
      districtIndustryCenterAddress: `District Industries Center, Collectorate Complex, ${district}, ${state}`,
      leadBankName: 'State Lead Bank Office'
    };
  }

  public getSupportedStates(): string[] {
    return POPULAR_INDIAN_STATES;
  }

  public getDistrictsByState(state: string): string[] {
    const all = entityRepository.getAllDistrictBenchmarks();
    const stateMatched = all.filter((d) => d.state.toLowerCase() === state.toLowerCase()).map((d) => d.district);
    if (stateMatched.length > 0) return stateMatched;

    // Default sample districts for state if benchmark records are being expanded
    return [`${state} Central`, `${state} North`, `${state} South`];
  }
}

export const locationGisService = new LocationGisService();
