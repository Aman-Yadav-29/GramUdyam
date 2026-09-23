import { BusinessTemplate, AffordabilityTier } from '../types/business.ts';
import { ScalingRecommendation } from '../types/financial.ts';
import { 
  calculateTotalProjectCost, 
  calculateFinancingGap, 
  calculateEmi, 
  calculateDscr 
} from './financialFormulas.ts';

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
  },
  ent_dairy_cattle: {
    enterpriseId: 'ent_dairy_cattle',
    unitName: 'animals',
    standardScaleUnits: 10,
    standardScaleLabel: '10 animals',
    minViableUnits: 5,
    minViableScaleLabel: '5 animals',
    stepUnits: 1,
    isModular: true
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

  // Total Project Cost = CapEx + Working Capital Requirement (MANDATORY AUTHORITATIVE RULE)
  const totalProjectCost = calculateTotalProjectCost(totalFixedAssets, totalWorkingCapital);

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

export interface ScalingConfig {
  minPromoterEquityPercent?: number;
  maxManageableDebt?: number;
  annualInterestRatePercent?: number;
  annualInterestRate?: number;
  loanTenureMonths?: number;
  minViableDscr?: number;
}

/**
 * Determines whether a business can realistically be scaled down to fit or be financed
 * by availableCapital, without creating fractional or unrealistic units.
 * 
 * Strictly implements the 4 cases:
 * Case A: Fully affordable (Project Cost <= Available Capital)
 * Case B: Affordable with financing (Project Cost > Available Capital, meets equity & debt criteria)
 * Case C: Candidate scale violates viability -> Downscale further if a valid smaller scale exists
 * Case D: Minimum viable scale still unaffordable -> HIGHER_INVESTMENT
 */
export function evaluateBusinessScaling(
  business: BusinessTemplate,
  availableCapital: number,
  config?: ScalingConfig
): ScalingRecommendation {
  const minEquityThreshold = config?.minPromoterEquityPercent ?? 20;
  const maxDebtLimit = config?.maxManageableDebt ?? 1500000;
  const annualRatePct = config?.annualInterestRatePercent ?? 
    (config?.annualInterestRate !== undefined ? config.annualInterestRate * 100 : 9.5);
  const tenureMonths = config?.loanTenureMonths ?? 60;
  const minDscrThreshold = config?.minViableDscr ?? 1.0;

  const safeCapital = Math.max(0, availableCapital || 0);
  const scaleDef = business ? SCALE_DEFINITIONS[business.id] : undefined;

  // If template is invalid or no scale definition exists:
  if (!business || !scaleDef) {
    const fixed = business?.fixedAssets?.totalFixedAssets || 0;
    const wc = business?.workingCapital?.totalWorkingCapital || 0;
    const standardCost = calculateTotalProjectCost(fixed, wc);
    const gapAnalysis = calculateFinancingGap(standardCost, safeCapital);
    const gap = gapAnalysis.financingGap;
    const equityPct = gapAnalysis.promoterContributionPercent;

    const emiCalc = calculateEmi(gap, annualRatePct, tenureMonths);
    const rev = business?.revenueAssumptions?.expectedMonthlyRevenue || 0;
    const opex = business?.operatingCosts?.totalMonthlyOpex || 0;
    const profit = Math.max(0, rev - opex);
    const annualDebtService = emiCalc.monthlyEmi * 12;
    const dscrVal = annualDebtService > 0 ? Number(((profit * 12) / annualDebtService).toFixed(2)) : null;

    let tier: AffordabilityTier;
    let reason: string;
    let canScaleToBudget: boolean;

    if (safeCapital >= standardCost && standardCost > 0) {
      tier = 'FITS_BUDGET';
      canScaleToBudget = true;
      reason = `Standard configuration outlay of ₹${standardCost.toLocaleString('en-IN')}. Available capital: ₹${safeCapital.toLocaleString('en-IN')}. Fully funded by equity without external borrowing.`;
    } else if (equityPct >= minEquityThreshold && gap <= maxDebtLimit) {
      tier = 'LIMITED_FINANCING';
      canScaleToBudget = true;
      reason = `Total Project Cost: ₹${standardCost.toLocaleString('en-IN')}. User Capital: ₹${safeCapital.toLocaleString('en-IN')}. Required financing: ₹${gap.toLocaleString('en-IN')} (${equityPct}% promoter equity). Estimated EMI: ₹${emiCalc.monthlyEmi.toLocaleString('en-IN')}/month. External financing required.`;
    } else {
      tier = 'HIGHER_INVESTMENT';
      canScaleToBudget = false;
      reason = `Total Project Cost: ₹${standardCost.toLocaleString('en-IN')}. User Capital: ₹${safeCapital.toLocaleString('en-IN')} provides ${equityPct}% equity, below the minimum ${minEquityThreshold}% requirement. Classified as higher investment.`;
    }

    return {
      isScalable: false,
      canScaleToBudget,
      unitName: business?.unit || 'units',
      standardScaleUnits: 1,
      standardScaleLabel: business?.defaultScale || 'Standard scale',
      suggestedScaleUnits: 1,
      suggestedScaleLabel: business?.defaultScale || 'Standard scale',
      stepUnits: 1,
      minViableUnits: 1,
      minViableScaleLabel: business?.minimumViableScale || 'Standard scale',
      estimatedFixedAssets: fixed,
      estimatedWorkingCapital: wc,
      estimatedTotalProjectCost: standardCost,
      availableCapital: safeCapital,
      financingGap: gap,
      requiresExternalFinancing: gap > 0,
      requiredFinancing: gap,
      estimatedMonthlyEmi: emiCalc.monthlyEmi,
      dscr: dscrVal,
      affordabilityTier: tier,
      affordabilityReason: reason,
      monthlyRevenue: rev,
      monthlyNetProfit: profit,
      scalingRatio: 1.0
    };
  }

  // Calculate standard scale plan
  const standardPlan = calculateScaledCostBreakdown(business, scaleDef, scaleDef.standardScaleUnits);

  // Case A1: Standard scale fits 100% within available capital (no borrowing)
  if (safeCapital >= standardPlan.totalProjectCost) {
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
      availableCapital: safeCapital,
      financingGap: 0,
      requiresExternalFinancing: false,
      requiredFinancing: 0,
      estimatedMonthlyEmi: 0,
      dscr: null,
      affordabilityTier: 'FITS_BUDGET',
      affordabilityReason: `Standard scale (${scaleDef.standardScaleLabel}) total project cost is ₹${standardPlan.totalProjectCost.toLocaleString('en-IN')}, fully covered by available capital of ₹${safeCapital.toLocaleString('en-IN')} without borrowing.`,
      monthlyRevenue: standardPlan.monthlyRevenue,
      monthlyNetProfit: standardPlan.monthlyNetProfit,
      scalingRatio: 1.0
    };
  }

  // Generate candidate scales: strictly discrete integer steps from standardScaleUnits down to minViableUnits
  const candidateScales: number[] = [];
  for (let u = scaleDef.standardScaleUnits; u >= scaleDef.minViableUnits; u -= scaleDef.stepUnits) {
    const intU = Math.round(u);
    if (!candidateScales.includes(intU)) candidateScales.push(intU);
  }
  const minInt = Math.round(scaleDef.minViableUnits);
  if (!candidateScales.includes(minInt)) {
    candidateScales.push(minInt);
  }

  // Sort descending for checking if downscaling allows 100% equity funding
  candidateScales.sort((a, b) => b - a);

  // Case A2: Check if downscaling allows 100% equity funding (no debt needed)
  for (const units of candidateScales) {
    if (units === scaleDef.standardScaleUnits) continue; // standard scale already checked
    const plan = calculateScaledCostBreakdown(business, scaleDef, units);
    if (plan.totalProjectCost <= safeCapital) {
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
        availableCapital: safeCapital,
        financingGap: 0,
        requiresExternalFinancing: false,
        requiredFinancing: 0,
        estimatedMonthlyEmi: 0,
        dscr: null,
        affordabilityTier: 'FITS_BUDGET',
        affordabilityReason: `Standard scale (${scaleDef.standardScaleLabel}) requires ₹${standardPlan.totalProjectCost.toLocaleString('en-IN')}. Downscaled to ${units} ${scaleDef.unitName} (Total Project Cost: ₹${plan.totalProjectCost.toLocaleString('en-IN')}) to fully fit within available capital of ₹${safeCapital.toLocaleString('en-IN')} without borrowing.`,
        monthlyRevenue: plan.monthlyRevenue,
        monthlyNetProfit: plan.monthlyNetProfit,
        scalingRatio: plan.scalingRatio
      };
    }
  }

  // Case B: External financing is required.
  // Evaluate candidate scales from minViableUnits upwards to find the most viable scale with lowest debt exposure.
  const candidatesAsc = [...candidateScales].sort((a, b) => a - b);
  for (const units of candidatesAsc) {
    const plan = calculateScaledCostBreakdown(business, scaleDef, units);
    const gapAnalysis = calculateFinancingGap(plan.totalProjectCost, safeCapital);
    const gap = gapAnalysis.financingGap;
    const equityPct = gapAnalysis.promoterContributionPercent;

    const emiCalc = calculateEmi(gap, annualRatePct, tenureMonths);
    const annualDebtService = emiCalc.monthlyEmi * 12;
    const monthlyDepr = Math.round(((plan.fixedAssets.equipmentCost * 0.15) + (plan.fixedAssets.infrastructureCost * 0.05)) / 12);
    const monthlyInterest = Math.round((gap * (annualRatePct / 100)) / 12);
    const cadsAnnual = (plan.monthlyNetProfit + monthlyDepr + monthlyInterest) * 12;
    const dscrAnalysis = calculateDscr(cadsAnnual, annualDebtService);
    const dscr = dscrAnalysis.dscr;

    // Viability rules:
    // 1. Promoter Equity >= minPromoterEquityPercent (20%)
    // 2. Financing Gap <= maxManageableDebt (₹15L)
    // 3. DSCR >= minViableDscr (1.0x)
    const isEquitySufficient = equityPct >= minEquityThreshold;
    const isDebtManageable = gap <= maxDebtLimit;
    const isDscrViable = dscr === null || dscr >= minDscrThreshold;

    if (isEquitySufficient && isDebtManageable && isDscrViable) {
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
        availableCapital: safeCapital,
        financingGap: gap,
        requiresExternalFinancing: true,
        requiredFinancing: gap,
        estimatedMonthlyEmi: emiCalc.monthlyEmi,
        dscr,
        affordabilityTier: 'LIMITED_FINANCING',
        affordabilityReason: `Standard scale: ${scaleDef.standardScaleLabel}. Suggested scale: ${units} ${scaleDef.unitName}. Total Project Cost: ₹${plan.totalProjectCost.toLocaleString('en-IN')}. User Capital: ₹${safeCapital.toLocaleString('en-IN')}. Required financing: ₹${gap.toLocaleString('en-IN')} (${equityPct}% promoter equity). Estimated EMI: ₹${emiCalc.monthlyEmi.toLocaleString('en-IN')}/month. DSCR: ${dscr ?? 0}x. External bank financing required.`,
        monthlyRevenue: plan.monthlyRevenue,
        monthlyNetProfit: plan.monthlyNetProfit,
        scalingRatio: plan.scalingRatio
      };
    }
  }

  // Case D: Minimum viable scale still unaffordable under financing criteria
  const minPlan = calculateScaledCostBreakdown(business, scaleDef, scaleDef.minViableUnits);
  const minGapAnalysis = calculateFinancingGap(minPlan.totalProjectCost, safeCapital);
  const minGap = minGapAnalysis.financingGap;
  const currentMinEquityPct = minGapAnalysis.promoterContributionPercent;
  const minEmiCalc = calculateEmi(minGap, annualRatePct, tenureMonths);
  const minAnnualDebtService = minEmiCalc.monthlyEmi * 12;
  const minMonthlyDepr = Math.round(((minPlan.fixedAssets.equipmentCost * 0.15) + (minPlan.fixedAssets.infrastructureCost * 0.05)) / 12);
  const minMonthlyInterest = Math.round((minGap * (annualRatePct / 100)) / 12);
  const minCadsAnnual = (minPlan.monthlyNetProfit + minMonthlyDepr + minMonthlyInterest) * 12;
  const minDscrAnalysis = calculateDscr(minCadsAnnual, minAnnualDebtService);

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
    availableCapital: safeCapital,
    financingGap: minGap,
    requiresExternalFinancing: true,
    requiredFinancing: minGap,
    estimatedMonthlyEmi: minEmiCalc.monthlyEmi,
    dscr: minDscrAnalysis.dscr,
    affordabilityTier: 'HIGHER_INVESTMENT',
    affordabilityReason: `Cannot realistically be reduced below minimum viable scale (${scaleDef.minViableScaleLabel}, Total Project Cost ₹${minPlan.totalProjectCost.toLocaleString('en-IN')}). User capital of ₹${safeCapital.toLocaleString('en-IN')} provides only ${currentMinEquityPct}% promoter equity (below required ${minEquityThreshold}% threshold; Financing gap: ₹${minGap.toLocaleString('en-IN')}). Classified as higher investment.`,
    monthlyRevenue: minPlan.monthlyRevenue,
    monthlyNetProfit: minPlan.monthlyNetProfit,
    scalingRatio: minPlan.scalingRatio
  };
}
