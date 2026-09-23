import { entityRepository } from '../models/schema.ts';
import { FinancialPlan, CapexBreakdown, OpexMonthlyBreakdown, FinancialScenarioType } from '../../src/types/financial.ts';
import { 
  calculateDeterministicFinancialPlan, 
  deriveCapexBreakdown, 
  deriveMonthlyOpex, 
  calculateEmi 
} from '../../src/utils/financialEngine.ts';
import { BUSINESS_TEMPLATES } from '../../src/data/businessTemplates.ts';

export class FinancialEngineService {
  public generateFinancialProjections(params: {
    enterpriseId: string;
    capitalAvailable: number;
    promoterCategory: 'general' | 'special';
    locationType: 'rural' | 'urban';
    state: string;
    district: string;
    scenario?: FinancialScenarioType;
    customScaleUnits?: number;
  }): {
    plan: FinancialPlan;
    capex: CapexBreakdown;
    opex: OpexMonthlyBreakdown;
    emiAnalysis: ReturnType<typeof calculateEmi>;
  } {
    // 1. Try to find matched template in detailed BUSINESS_TEMPLATES
    const template = BUSINESS_TEMPLATES.find(t => t.id === params.enterpriseId);

    if (template) {
      const plan = calculateDeterministicFinancialPlan({
        business: template,
        availableCapital: params.capitalAvailable,
        scenario: params.scenario || 'base',
        customScaleUnits: params.customScaleUnits,
        isSpecialCategory: params.promoterCategory === 'special',
        isRural: params.locationType === 'rural'
      });

      const capex: CapexBreakdown = {
        landAndSiteDevelopment: Math.round(plan.fixedAssetsCost * 0.05),
        buildingAndCivilWorks: Math.round(plan.fixedAssetsCost * 0.25),
        plantAndMachinery: Math.round(plan.fixedAssetsCost * 0.60),
        electrificationAndUtilities: Math.round(plan.fixedAssetsCost * 0.05),
        preOperativeExpenses: plan.startupCost,
        contingencies: plan.fixedAssetsCost - (
          Math.round(plan.fixedAssetsCost * 0.05) +
          Math.round(plan.fixedAssetsCost * 0.25) +
          Math.round(plan.fixedAssetsCost * 0.60) +
          Math.round(plan.fixedAssetsCost * 0.05) +
          plan.startupCost
        ),
        totalCapex: plan.fixedAssetsCost
      };

      const emiAnalysis = calculateEmi(plan.bankTermLoanRequired, 9.5, 60);

      return {
        plan,
        capex,
        opex: plan.monthlyOpexBreakdown,
        emiAnalysis
      };
    }

    // 2. Fallback to schema entity repository if template not directly found
    const enterprise = entityRepository.getEnterpriseById(params.enterpriseId);
    const recommendedCapital = enterprise ? enterprise.recommendedCapital : params.capitalAvailable;
    const expectedTurnover = enterprise ? enterprise.expectedAnnualTurnover : recommendedCapital * 3;
    const netMarginPercent = enterprise ? enterprise.estimatedNetMarginPercent : 20;

    // Construct dynamic template
    const fallbackTemplate = {
      id: params.enterpriseId,
      name: enterprise?.name || 'Enterprise Unit',
      category: 'manufacturing' as const,
      tagline: enterprise?.tagline || 'Rural enterprise production unit',
      description: enterprise?.description || 'Micro enterprise manufacturing and processing facility',
      minimumViableScale: 'Single machine setup',
      defaultScale: 'Standard commercial unit',
      unit: 'units / month',
      fixedAssets: {
        equipmentCost: Math.round(recommendedCapital * 0.55),
        infrastructureCost: Math.round(recommendedCapital * 0.15),
        preOperativeCost: Math.round(recommendedCapital * 0.05),
        totalFixedAssets: Math.round(recommendedCapital * 0.75)
      },
      equipment: [],
      infrastructure: {
        spaceRequiredSqFt: enterprise?.spaceRequiredSqFt || 500,
        shedType: 'Semi-pucca industrial shed',
        powerHpRequired: enterprise?.powerRequiredHp || 5,
        waterRequirement: 'Municipal/Borewell supply'
      },
      workingCapital: {
        cycleMonths: 2,
        rawMaterialReserve: Math.round(recommendedCapital * 0.15),
        cashContingency: Math.round(recommendedCapital * 0.10),
        totalWorkingCapital: Math.round(recommendedCapital * 0.25)
      },
      operatingCosts: {
        rawMaterialsMonthly: Math.round((expectedTurnover / 12) * (1 - netMarginPercent / 100) * 0.65),
        laborAndWagesMonthly: Math.round((expectedTurnover / 12) * (1 - netMarginPercent / 100) * 0.20),
        utilitiesAndPowerMonthly: Math.round((expectedTurnover / 12) * (1 - netMarginPercent / 100) * 0.07),
        repairAndMaintenanceMonthly: Math.round((expectedTurnover / 12) * (1 - netMarginPercent / 100) * 0.04),
        freightAndLogisticsMonthly: Math.round((expectedTurnover / 12) * (1 - netMarginPercent / 100) * 0.04),
        totalMonthlyOpex: Math.round((expectedTurnover / 12) * (1 - netMarginPercent / 100))
      },
      expectedOutputMonthly: 1000,
      priceAssumptions: {
        unitSellingPrice: 100,
        unitRawMaterialCost: 60
      },
      revenueAssumptions: {
        expectedMonthlyRevenue: Math.round(expectedTurnover / 12),
        capacityUtilizationPercent: 80,
        assumedMarginBasis: 'Commercial wholesale trade'
      },
      gestationPeriodMonths: 2,
      typicalRiskLevel: 'low' as const,
      keyRawMaterials: [],
      eligibleSchemes: ['PMEGP', 'MUDRA']
    };

    const plan = calculateDeterministicFinancialPlan({
      business: fallbackTemplate,
      availableCapital: params.capitalAvailable,
      scenario: params.scenario || 'base',
      customScaleUnits: params.customScaleUnits,
      isSpecialCategory: params.promoterCategory === 'special',
      isRural: params.locationType === 'rural'
    });

    const capex = deriveCapexBreakdown(plan.fixedAssetsCost);
    const opex = deriveMonthlyOpex(plan.annualOperatingCostYear1);
    const emiAnalysis = calculateEmi(plan.bankTermLoanRequired, 9.5, 60);

    return {
      plan,
      capex,
      opex,
      emiAnalysis
    };
  }
}

export const financialEngineService = new FinancialEngineService();
