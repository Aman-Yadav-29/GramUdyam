import { BusinessDiscoveryQuery } from '../types/business.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBusinessDiscoveryQuery(query: Partial<BusinessDiscoveryQuery>): ValidationResult {
  const errors: string[] = [];

  if (query.capitalAvailable === undefined || query.capitalAvailable === null) {
    errors.push('Available capital is required.');
  } else if (typeof query.capitalAvailable !== 'number' || isNaN(query.capitalAvailable)) {
    errors.push('Available capital must be a valid number.');
  } else if (query.capitalAvailable < 10000) {
    errors.push('Minimum capital for micro-enterprise analysis is ₹10,000.');
  } else if (query.capitalAvailable > 500000000) {
    errors.push('Maximum capital limit for micro/small enterprise scope is ₹50 Crore.');
  }

  if (!query.state || query.state.trim().length === 0) {
    errors.push('State selection is required.');
  }

  if (!query.district || query.district.trim().length === 0) {
    errors.push('District name is required.');
  }

  if (query.locationType && !['rural', 'semi_urban', 'urban'].includes(query.locationType)) {
    errors.push('Location type must be either rural, semi_urban, or urban.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
