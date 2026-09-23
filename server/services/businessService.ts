import { entityRepository } from '../models/schema.ts';
import { BusinessDiscoveryQuery, DiscoveryResult, DiscoverySortOption } from '../../src/types/business.ts';
import { formatINRLakhs } from '../../src/utils/formatters.ts';
import { discoverBusinessesByBudget, DiscoveryConfig } from './discoveryEngine.ts';

export class BusinessService {
  /**
   * Budget-First Discovery Engine
   */
  public discoverByBudget(availableCapital: number, options?: { sortBy?: DiscoverySortOption; config?: Partial<DiscoveryConfig> }) {
    return discoverBusinessesByBudget(availableCapital, options);
  }

  public discoverEnterprises(query: BusinessDiscoveryQuery): DiscoveryResult {
    const rawCapital = query.capitalAvailable ?? query.availableCapital;
    if (rawCapital === undefined || rawCapital === null || isNaN(rawCapital) || rawCapital <= 0) {
      throw new Error('capitalAvailable is required and must be a positive number.');
    }
    const capitalAvailable = rawCapital;
    const state = query.state || 'Uttar Pradesh';
    const district = query.district || 'Varanasi';
    const preferredCategory = query.preferredCategory;

    const matchingEnterprises = entityRepository.queryEnterprises(capitalAvailable, preferredCategory);

    // Also see if there is local district intelligence for special scoring
    const districtIntel = entityRepository.getDistrictIntelligence(state, district);
    
    // Sort matching: prioritize locally recommended units if available
    const sorted = [...matchingEnterprises].sort((a, b) => {
      const aRecommended = districtIntel?.recommendedRuralEnterprises.includes(a.id) ? 1 : 0;
      const bRecommended = districtIntel?.recommendedRuralEnterprises.includes(b.id) ? 1 : 0;
      return bRecommended - aRecommended;
    });

    const allSchemes = entityRepository.getAllSchemes();

    return {
      enterprises: sorted,
      totalMatches: sorted.length,
      summary: {
        capitalBracket: `${formatINRLakhs(capitalAvailable)} Available Capital`,
        locationContext: `${district}, ${state} (${districtIntel ? districtIntel.agroClimaticZone : 'Identified Agro-Zone'})`,
        schemesCount: allSchemes.length
      }
    };
  }

  public getEnterpriseDetails(id: string) {
    return entityRepository.getEnterpriseById(id);
  }

  public getAllEnterprises() {
    return entityRepository.getAllEnterprises();
  }
}

export const businessService = new BusinessService();
