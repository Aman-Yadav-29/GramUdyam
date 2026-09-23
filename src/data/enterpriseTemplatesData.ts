import { EnterpriseIdea } from '../types/business.ts';
import { BUSINESS_TEMPLATES } from './businessTemplates.ts';

export const ENTERPRISE_TEMPLATES: EnterpriseIdea[] = BUSINESS_TEMPLATES.map((bt) => {
  const projectCost = bt.fixedAssets.totalFixedAssets + bt.workingCapital.totalWorkingCapital;
  const annualTurnover = bt.revenueAssumptions.expectedMonthlyRevenue * 12;
  const monthlyOperatingProfit = bt.revenueAssumptions.expectedMonthlyRevenue - bt.operatingCosts.totalMonthlyOpex;
  const marginPercent = bt.revenueAssumptions.expectedMonthlyRevenue > 0
    ? Number(((monthlyOperatingProfit / bt.revenueAssumptions.expectedMonthlyRevenue) * 100).toFixed(1))
    : 15;

  return {
    ...bt,
    minCapitalRequired: projectCost,
    recommendedCapital: Math.round(projectCost * 1.2),
    expectedAnnualTurnover: annualTurnover,
    estimatedNetMarginPercent: marginPercent,
    spaceRequiredSqFt: bt.infrastructure.spaceRequiredSqFt,
    powerRequiredHp: bt.infrastructure.powerHpRequired,
    suitableLocations: ['Rural Growth Centers', 'Agro-Catchment Zones', 'District Clusters'],
    keyMachinery: bt.equipment.map((e) => e.name)
  };
});
