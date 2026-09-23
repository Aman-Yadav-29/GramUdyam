import { entityRepository } from '../models/schema.ts';
import { DistrictIntelligence } from '../../src/types/location.ts';
import { POPULAR_INDIAN_STATES, STATE_DISTRICTS_MAP } from '../../src/data/locationBenchmarksData.ts';
import { generateDistrictFallback } from '../../src/utils/locationIntelligenceEngine.ts';

export class LocationGisService {
  public getDistrictData(state: string, district: string): DistrictIntelligence {
    const data = entityRepository.getDistrictIntelligence(state, district);
    if (data) {
      return data;
    }

    // Return truthful fallback marked explicitly as 'State-level estimate' with official sources
    return generateDistrictFallback(state, district);
  }

  public getSupportedStates(): string[] {
    return POPULAR_INDIAN_STATES;
  }

  public getDistrictsByState(state: string): string[] {
    // 1. Check known district map
    if (STATE_DISTRICTS_MAP[state]) {
      return STATE_DISTRICTS_MAP[state];
    }

    // 2. Check benchmarks
    const all = entityRepository.getAllDistrictBenchmarks();
    const stateMatched = all.filter((d) => d.state.toLowerCase() === state.toLowerCase()).map((d) => d.district);
    if (stateMatched.length > 0) return stateMatched;

    // 3. Fallback sample districts
    return [`${state} Central`, `${state} North`, `${state} South`];
  }

  public getAllDistrictsMap(): Record<string, string[]> {
    return STATE_DISTRICTS_MAP;
  }
}

export const locationGisService = new LocationGisService();
