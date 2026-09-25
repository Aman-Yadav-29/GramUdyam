import { entityRepository } from '../models/schema.ts';
import type { SchemeCalculationRequest, SchemeCalculationResult, GovernmentScheme } from '../../src/types/schemes.ts';

export class SchemeEngineService {
  public getAllSchemes(): GovernmentScheme[] {
    return entityRepository.getAllSchemes();
  }

  public evaluateScheme(request: SchemeCalculationRequest): SchemeCalculationResult {
    const scheme = entityRepository.getSchemeByCode(request.schemeCode);
    if (!scheme) {
      throw new Error(`Scheme with code '${request.schemeCode}' not found`);
    }

    const { projectCost, promoterCategory, locationType } = request;
    const isSpecial = promoterCategory === 'special';
    const isRural = locationType === 'rural';

    // Promoter margin percent
    const promoterContributionPercent = isSpecial
      ? scheme.beneficiaryContributionPercentSpecial
      : scheme.beneficiaryContributionPercentGeneral;

    const promoterContributionAmount = Math.round((projectCost * promoterContributionPercent) / 100);

    // Subsidy rate lookup
    let subsidyRate = 0;
    if (isSpecial && isRural) {
      subsidyRate = scheme.subsidyPercentSpecialRural;
    } else if (isSpecial && !isRural) {
      subsidyRate = scheme.subsidyPercentSpecialUrban;
    } else if (!isSpecial && isRural) {
      subsidyRate = scheme.subsidyPercentGeneralRural;
    } else {
      subsidyRate = scheme.subsidyPercentGeneralUrban;
    }

    let calculatedSubsidy = Math.round((projectCost * subsidyRate) / 100);
    if (scheme.maxSubsidyAmount > 0 && calculatedSubsidy > scheme.maxSubsidyAmount) {
      calculatedSubsidy = scheme.maxSubsidyAmount;
    }

    const bankLoanAmount = Math.max(0, projectCost - promoterContributionAmount);

    return {
      scheme,
      eligible: projectCost <= scheme.maxProjectCost,
      ineligibilityReasons: projectCost > scheme.maxProjectCost ? [`Project cost exceeds scheme ceiling of ₹${scheme.maxProjectCost.toLocaleString('en-IN')}`] : [],
      projectCostConsidered: projectCost,
      promoterContributionAmount,
      promoterContributionPercent,
      subsidyAmount: calculatedSubsidy,
      subsidyPercent: subsidyRate,
      bankLoanAmount,
      effectiveSubsidyType: scheme.code === 'AIF' ? 'interest_subvention' : 'credit_linked_back_ended'
    };
  }

  public findEligibleSchemes(params: {
    projectCost: number;
    promoterCategory: 'general' | 'special';
    locationType: 'rural' | 'urban';
    activityType: 'manufacturing' | 'service' | 'trading' | 'food_processing';
  }): SchemeCalculationResult[] {
    const all = this.getAllSchemes();
    return all.map((scheme) => {
      return this.evaluateScheme({
        schemeCode: scheme.code,
        projectCost: params.projectCost,
        promoterCategory: params.promoterCategory,
        locationType: params.locationType,
        activityType: params.activityType
      });
    });
  }
}

export const schemeEngineService = new SchemeEngineService();
