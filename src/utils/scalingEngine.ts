import { BusinessTemplate, AffordabilityTier } from '../types/business.ts';
import { ScalingRecommendation } from '../types/financial.ts';

export interface ScaleDefinition {
  enterpriseId: string;
  unitName: string;
  standardScaleUnits: number;
  standardScaleLabel: string;
  minViableUnits: number;
  minViableScaleLabel: string;
  stepUnits: number;
  isModular: boolean;
}

export const SCALE_DEFINITIONS: Record<string, ScaleDefinition> = {
  ent_vermicompost: {
    enterpriseId: 'ent_vermicompost',
    unitName: 'HDPE beds',
    standardScaleUnits: 5,
    standardScaleLabel: '5 HDPE commercial beds',
    minViableUnits: 3,
    minViableScaleLabel: '3 HDPE vermi-beds',
    stepUnits: 1,
    isModular: true
  },
  ent_mushroom: {
    enterpriseId: 'ent_mushroom',
    unitName: 'crop bags',
    standardScaleUnits: 600,
    standardScaleLabel: '600 hanging crop bags',
    minViableUnits: 300,
    minViableScaleLabel: '300 poly-bags cycle',
    stepUnits: 50,
    isModular: true
  },
  ent_beekeeping: {
    enterpriseId: 'ent_beekeeping',
    unitName: 'bee hives',
    standardScaleUnits: 25,
    standardScaleLabel: '25 Langstroth bee boxes',
    minViableUnits: 15,
    minViableScaleLabel: '15 Langstroth beehives',
    stepUnits: 5,
    isModular: true
  },
  ent_poultry_broiler: {
    enterpriseId: 'ent_poultry_broiler',
    unitName: 'birds',
    standardScaleUnits: 500,
    standardScaleLabel: '500 birds per batch',
    minViableUnits: 300,
    minViableScaleLabel: '300 birds per batch',
    stepUnits: 50,
    isModular: true
  },
  ent_spices_processing: {
    enterpriseId: 'ent_spices_processing',
    unitName: 'kg / day',
    standardScaleUnits: 200,
    standardScaleLabel: '200 kg / day',
    minViableUnits: 80,
    minViableScaleLabel: '80 kg / day',
    stepUnits: 20,
    isModular: false
  },
  ent_cattle_feed: {
    enterpriseId: 'ent_cattle_feed',
    unitName: 'kg / hour',
    standardScaleUnits: 300,
    standardScaleLabel: '300 kg / hour',
    minViableUnits: 150,
    minViableScaleLabel: '150 kg / hour',
    stepUnits: 50,
    isModular: false
  },
  ent_oil_expeller: {
    enterpriseId: 'ent_oil_expeller',
    unitName: 'kg seeds / hour',
    standardScaleUnits: 200,
    standardScaleLabel: '200 kg seeds / hour (6-bolt)',
    minViableUnits: 100,
    minViableScaleLabel: '100 kg seeds / hour (4-bolt)',
    stepUnits: 50,
    isModular: false
  },
  ent_dairy_chilling: {
    enterpriseId: 'ent_dairy_chilling',
    unitName: 'L / day',
    standardScaleUnits: 500,
    standardScaleLabel: '500 L / day',
    minViableUnits: 300,
    minViableScaleLabel: '300 L / day',
    stepUnits: 50,
    isModular: false
  },
  ent_dal_mill: {
    enterpriseId: 'ent_dal_mill',
    unitName: 'kg / hour',
    standardScaleUnits: 500,
    standardScaleLabel: '500 kg / hour',
    minViableUnits: 200,
    minViableScaleLabel: '200 kg / hour',
    stepUnits: 100,
    isModular: false
  },
  ent_corrugated_boxes: {
    enterpriseId: 'ent_corrugated_boxes',
    unitName: 'boxes / day',
    standardScaleUnits: 3000,
    standardScaleLabel: '3,000 boxes / day',
    minViableUnits: 1000,
    minViableScaleLabel: '1,000 boxes / day',
    stepUnits: 500,
    isModular: false
  },
  ent_solar_cold_storage: {
    enterpriseId: 'ent_solar_cold_storage',
    unitName: 'MT',
    standardScaleUnits: 10,
    standardScaleLabel: '10 MT dual-zone chamber',
    minViableUnits: 5,
    minViableScaleLabel: '5 MT capacity',
    stepUnits: 1,
    isModular: false
  },
  ent_flyash_bricks: {
    enterpriseId: 'ent_flyash_bricks',
    unitName: 'bricks / day',
    standardScaleUnits: 8000,
    standardScaleLabel: '8,000 bricks / day',
    minViableUnits: 3000,
    minViableScaleLabel: '3,000 bricks / day',
    stepUnits: 1000,
    isModular: false
  }
};

/**
 * Calculates scaled financial components for a specific discrete unit count.
 * All affordability decisions use:
 * Total Project Cost = CapEx + Working Capital Requirement
 */
export function calculateScaledCostBreakdown(
  business: BusinessTemplate,
  scaleDef: ScaleDefinition,
  units: number
): {
  units: number;
  scalingRatio: number;
  fixedAssets: {
    equipmentCost: number;
    infrastructureCost: number;
    preOperativeCost: number;
    totalFixedAssets: number;
  };
  workingCapital: {
    rawMaterialReserve: number;
    cashContingency: number;
    totalWorkingCapital: number;
  };
  totalProjectCost: number; // CapEx + Working Capital Requirement
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyNetProfit: number;
} {
  // Ensure integer units and enforce valid boundaries
  const validUnits = Math.max(scaleDef.minViableUnits, Math.min(scaleDef.standardScaleUnits, Math.round(units)));
  const scalingRatio = validUnits / scaleDef.standardScaleUnits;

  // 1. CapEx calculation
  // Equipment: modular units scale near-linearly; continuous equipment has base machine + capacity sizing
  const equipmentCost = scaleDef.isModular
    ? Math.round(business.fixedAssets.equipmentCost * (0.20 + 0.80 * scalingRatio))
    : Math.round(business.fixedAssets.equipmentCost * (0.35 + 0.65 * scalingRatio));

  const infrastructureCost = Math.round(business.fixedAssets.infrastructureCost * (0.40 + 0.60 * scalingRatio));
  const preOperativeCost = Math.round(business.fixedAssets.preOperativeCost * (0.50 + 0.50 * scalingRatio));
  const totalFixedAssets = equipmentCost + infrastructureCost + preOperativeCost;

  // 2. Working Capital calculation
  const rawMaterialReserve = Math.round(business.workingCapital.rawMaterialReserve * scalingRatio);
  const cashContingency = Math.round(business.workingCapital.cashContingency * (0.40 + 0.60 * scalingRatio));
  const totalWorkingCapital = rawMaterialReserve + cashContingency;

  // Total Project Cost = CapEx + Working Capital Requirement (MANDATORY RULE)
  const totalProjectCost = totalFixedAssets + totalWorkingCapital;

  // 3. Operating metrics at scaled capacity
  const monthlyRevenue = Math.round(business.revenueAssumptions.expectedMonthlyRevenue * scalingRatio);
  
  const rawMaterials = Math.round(business.operatingCosts.rawMaterialsMonthly * scalingRatio);
  const labor = Math.round(business.operatingCosts.laborAndWagesMonthly * (0.40 + 0.60 * scalingRatio));
  const utilities = Math.round(business.operatingCosts.utilitiesAndPowerMonthly * (0.30 + 0.70 * scalingRatio));
  const repairs = Math.round(business.operatingCosts.repairAndMaintenanceMonthly * (0.30 + 0.70 * scalingRatio));
  const freight = Math.round(business.operatingCosts.freightAndLogisticsMonthly * scalingRatio);
  const monthlyOpex = rawMaterials + labor + utilities + repairs + freight;

  // Depreciation: 15% on machinery, 5% on infrastructure
  const annualDepr = (equipmentCost * 0.15) + (infrastructureCost * 0.05);
  const monthlyDepr = Math.round(annualDepr / 12);

  const monthlyNetProfit = Math.max(0, monthlyRevenue - monthlyOpex - monthlyDepr);

  return {
    units: validUnits,
    scalingRatio,
    fixedAssets: {
      equipmentCost,
      infrastructureCost,
      preOperativeCost,
      totalFixedAssets
    },
    workingCapital: {
      rawMaterialReserve,
      cashContingency,
      totalWorkingCapital
    },
    totalProjectCost,
    monthlyRevenue,
    monthlyOpex,
    monthlyNetProfit
  };
}

/**
 * Determines whether a business can realistically be scaled down to fit or be financed
 * by availableCapital, without creating fractional or unrealistic units.
 */
export function evaluateBusinessScaling(
  business: BusinessTemplate,
  availableCapital: number,
  config = {
    minPromoterEquityPercent: 20,
    maxManageableDebt: 1500000
  }
): ScalingRecommendation {
  const scaleDef = SCALE_DEFINITIONS[business.id];

  // If no scale definition exists, fallback to standard business figures
  if (!scaleDef) {
    const standardCost = business.fixedAssets.totalFixedAssets + business.workingCapital.totalWorkingCapital;
    const gap = Math.max(0, standardCost - availableCapital);
    const tier: AffordabilityTier = availableCapital >= standardCost
      ? 'FITS_BUDGET'
      : (gap <= config.maxManageableDebt && (availableCapital / standardCost) >= (config.minPromoterEquityPercent / 100))
        ? 'LIMITED_FINANCING'
        : 'HIGHER_INVESTMENT';

    return {
      isScalable: false,
      canScaleToBudget: availableCapital >= standardCost,
      unitName: business.unit,
      standardScaleUnits: 1,
      standardScaleLabel: business.defaultScale,
      suggestedScaleUnits: 1,
      suggestedScaleLabel: business.defaultScale,
      stepUnits: 1,
      minViableUnits: 1,
      minViableScaleLabel: business.minimumViableScale,
      estimatedFixedAssets: business.fixedAssets.totalFixedAssets,
      estimatedWorkingCapital: business.workingCapital.totalWorkingCapital,
      estimatedTotalProjectCost: standardCost,
      availableCapital,
      financingGap: gap,
      affordabilityTier: tier,
      affordabilityReason: `Standard configuration outlay of ₹${standardCost.toLocaleString('en-IN')}.`,
      monthlyRevenue: business.revenueAssumptions.expectedMonthlyRevenue,
      monthlyNetProfit: business.revenueAssumptions.expectedMonthlyRevenue - business.operatingCosts.totalMonthlyOpex,
      scalingRatio: 1.0
    };
  }

  // Calculate standard scale plan
  const standardPlan = calculateScaledCostBreakdown(business, scaleDef, scaleDef.standardScaleUnits);

  // If available capital already covers the standard scale, suggest standard scale
  if (availableCapital >= standardPlan.totalProjectCost) {
    return {
      isScalable: true,
      canScaleToBudget: true,
      unitName: scaleDef.unitName,
      standardScaleUnits: scaleDef.standardScaleUnits,
      standardScaleLabel: scaleDef.standardScaleLabel,
      suggestedScaleUnits: scaleDef.standardScaleUnits,
      suggestedScaleLabel: scaleDef.standardScaleLabel,
      stepUnits: scaleDef.stepUnits,
      minViableUnits: scaleDef.minViableUnits,
      minViableScaleLabel: scaleDef.minViableScaleLabel,
      estimatedFixedAssets: standardPlan.fixedAssets.totalFixedAssets,
      estimatedWorkingCapital: standardPlan.workingCapital.totalWorkingCapital,
      estimatedTotalProjectCost: standardPlan.totalProjectCost,
      availableCapital,
      financingGap: 0,
      affordabilityTier: 'FITS_BUDGET',
      affordabilityReason: `Standard scale fully fits within your capital of ₹${availableCapital.toLocaleString('en-IN')}.`,
      monthlyRevenue: standardPlan.monthlyRevenue,
      monthlyNetProfit: standardPlan.monthlyNetProfit,
      scalingRatio: 1.0
    };
  }

  // The default scale is too expensive. Generate all valid discrete integer scales:
  // e.g., from standardUnits down to minViableUnits stepping by stepUnits.
  const candidateScales: number[] = [];
  for (let u = scaleDef.standardScaleUnits; u >= scaleDef.minViableUnits; u -= scaleDef.stepUnits) {
    candidateScales.push(u);
  }
  if (!candidateScales.includes(scaleDef.minViableUnits)) {
    candidateScales.push(scaleDef.minViableUnits);
  }

  // Sort descending
  candidateScales.sort((a, b) => b - a);

  // 1. Look for a scale that fits 100% within available capital
  for (const units of candidateScales) {
    if (units === scaleDef.standardScaleUnits) continue; // standard scale already checked above
    const plan = calculateScaledCostBreakdown(business, scaleDef, units);
    if (plan.totalProjectCost <= availableCapital) {
      return {
        isScalable: true,
        canScaleToBudget: true,
        unitName: scaleDef.unitName,
        standardScaleUnits: scaleDef.standardScaleUnits,
        standardScaleLabel: scaleDef.standardScaleLabel,
        suggestedScaleUnits: units,
        suggestedScaleLabel: `${units.toLocaleString('en-IN')} ${scaleDef.unitName}`,
        stepUnits: scaleDef.stepUnits,
        minViableUnits: scaleDef.minViableUnits,
        minViableScaleLabel: scaleDef.minViableScaleLabel,
        estimatedFixedAssets: plan.fixedAssets.totalFixedAssets,
        estimatedWorkingCapital: plan.workingCapital.totalWorkingCapital,
        estimatedTotalProjectCost: plan.totalProjectCost,
        availableCapital,
        financingGap: 0,
        affordabilityTier: 'FITS_BUDGET',
        affordabilityReason: `Downscaled from ${scaleDef.standardScaleLabel} to ${units} ${scaleDef.unitName} to fully fit your budget of ₹${availableCapital.toLocaleString('en-IN')}.`,
        monthlyRevenue: plan.monthlyRevenue,
        monthlyNetProfit: plan.monthlyNetProfit,
        scalingRatio: plan.scalingRatio
      };
    }
  }

  // 2. If none fits 100%, check if downscaling qualifies for LIMITED_FINANCING
  // Choose the scale that has >= 20% promoter equity and debt gap <= maxManageableDebt
  for (const units of candidateScales) {
    const plan = calculateScaledCostBreakdown(business, scaleDef, units);
    const gap = plan.totalProjectCost - availableCapital;
    const equityPct = (availableCapital / plan.totalProjectCost) * 100;
    
    if (equityPct >= config.minPromoterEquityPercent && gap <= config.maxManageableDebt) {
      return {
        isScalable: true,
        canScaleToBudget: true,
        unitName: scaleDef.unitName,
        standardScaleUnits: scaleDef.standardScaleUnits,
        standardScaleLabel: scaleDef.standardScaleLabel,
        suggestedScaleUnits: units,
        suggestedScaleLabel: `${units.toLocaleString('en-IN')} ${scaleDef.unitName}`,
        stepUnits: scaleDef.stepUnits,
        minViableUnits: scaleDef.minViableUnits,
        minViableScaleLabel: scaleDef.minViableScaleLabel,
        estimatedFixedAssets: plan.fixedAssets.totalFixedAssets,
        estimatedWorkingCapital: plan.workingCapital.totalWorkingCapital,
        estimatedTotalProjectCost: plan.totalProjectCost,
        availableCapital,
        financingGap: gap,
        affordabilityTier: 'LIMITED_FINANCING',
        affordabilityReason: `Scale adjusted to ${units} ${scaleDef.unitName} (Project Cost: ₹${plan.totalProjectCost.toLocaleString('en-IN')}) enabling viable bank loan of ₹${gap.toLocaleString('en-IN')} with ${equityPct.toFixed(0)}% promoter margin.`,
        monthlyRevenue: plan.monthlyRevenue,
        monthlyNetProfit: plan.monthlyNetProfit,
        scalingRatio: plan.scalingRatio
      };
    }
  }

  // 3. If even the minimum viable scale cannot be funded or bank-financed:
  // "If the business cannot be scaled realistically, classify it as higher investment."
  const minPlan = calculateScaledCostBreakdown(business, scaleDef, scaleDef.minViableUnits);
  const minGap = minPlan.totalProjectCost - availableCapital;

  return {
    isScalable: true,
    canScaleToBudget: false,
    unitName: scaleDef.unitName,
    standardScaleUnits: scaleDef.standardScaleUnits,
    standardScaleLabel: scaleDef.standardScaleLabel,
    suggestedScaleUnits: scaleDef.minViableUnits,
    suggestedScaleLabel: scaleDef.minViableScaleLabel,
    stepUnits: scaleDef.stepUnits,
    minViableUnits: scaleDef.minViableUnits,
    minViableScaleLabel: scaleDef.minViableScaleLabel,
    estimatedFixedAssets: minPlan.fixedAssets.totalFixedAssets,
    estimatedWorkingCapital: minPlan.workingCapital.totalWorkingCapital,
    estimatedTotalProjectCost: minPlan.totalProjectCost,
    availableCapital,
    financingGap: minGap,
    affordabilityTier: 'HIGHER_INVESTMENT',
    affordabilityReason: `Cannot realistically be reduced below minimum viable scale (${scaleDef.minViableScaleLabel}, Total Project Cost ₹${minPlan.totalProjectCost.toLocaleString('en-IN')}). Classified as higher investment.`,
    monthlyRevenue: minPlan.monthlyRevenue,
    monthlyNetProfit: minPlan.monthlyNetProfit,
    scalingRatio: minPlan.scalingRatio
  };
}
