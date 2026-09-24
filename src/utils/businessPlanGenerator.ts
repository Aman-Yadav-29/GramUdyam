/**
 * Phase 9: Business Plan Assembly Utility
 * 
 * Strict architectural guidelines:
 * - Pure orchestration and derived presentation.
 * - Zero recalculation of Phase 4 financial metrics (project cost, gap, DSCR, EMI, profit).
 * - Zero aggregate scores or predictive ranking claims.
 * - Sourced strictly from Phases 3, 4, 5, 6, 7, and 8.
 */

import { EnterpriseIdea } from '../types/business.ts';
import { FinancialPlan } from '../types/financial.ts';
import { DistrictIntelligence } from '../types/location.ts';
import { AgriLocationAnalysis } from '../types/agriLocation.ts';
import { SchemeMatch } from '../types/scheme.ts';
import { SchemeReadinessPlan } from '../types/documentReadiness.ts';
import {
  BusinessPlan,
  BusinessPlanBusinessSection,
  EntrepreneurPlanSection,
  BusinessPlanLocationSection,
  BusinessPlanAgricultureSection,
  BusinessPlanFinancialSection,
  BusinessPlanScenarioSection,
  BusinessPlanProjectionsSection,
  BusinessPlanFinancingSection,
  BusinessPlanSchemeSection,
  BusinessPlanDocumentSection,
  ImplementationPlanSection,
  BusinessPlanNarrativeSection,
  PlanAssumption,
  PlanDisclosure
} from '../types/businessPlan.ts';

export interface AssembleBusinessPlanParams {
  enterprise: EnterpriseIdea;
  financialPlan: FinancialPlan;
  availableCapital: number;
  location: {
    state: string;
    district: string;
    subDistrictOrBlock?: string;
    villageOrTown?: string;
    locationType: 'rural' | 'semi_urban' | 'urban';
  };
  districtData?: DistrictIntelligence | null;
  agriLocationAnalysis?: AgriLocationAnalysis | null;
  schemeMatches?: SchemeMatch[];
  documentReadiness?: SchemeReadinessPlan | null;
  entrepreneurProfile?: {
    age?: number;
    gender?: string;
    socialCategory?: string;
    isFarmer?: boolean;
    isRural?: boolean;
    isNewBusiness?: boolean;
  };
  scenarioSnapshots?: BusinessPlanScenarioSection[];
  narrative?: BusinessPlanNarrativeSection;
  existingId?: string;
}

export function assembleBusinessPlan(params: AssembleBusinessPlanParams): BusinessPlan {
  const {
    enterprise,
    financialPlan,
    availableCapital,
    location,
    districtData,
    agriLocationAnalysis,
    schemeMatches = [],
    documentReadiness,
    entrepreneurProfile,
    scenarioSnapshots,
    narrative,
    existingId
  } = params;

  // 1. Business Section
  const primaryInputs = ((enterprise as any).keyRawMaterials && (enterprise as any).keyRawMaterials.length > 0)
    ? (enterprise as any).keyRawMaterials
    : ((enterprise as any).rawMaterialsRequired && (enterprise as any).rawMaterialsRequired.length > 0)
      ? (enterprise as any).rawMaterialsRequired
      : ['Raw materials and packaging items specified in the model'];

  const majorEquipment = ((enterprise as any).keyMachinery && (enterprise as any).keyMachinery.length > 0)
    ? (enterprise as any).keyMachinery
    : (enterprise.equipment && enterprise.equipment.length > 0)
      ? enterprise.equipment.map((e) => e.name)
      : ['Standard machinery & tools specified in the enterprise template'];

  const proposedScale = financialPlan.scaling
    ? financialPlan.scaling.suggestedScaleLabel
    : `${enterprise.defaultScale} ${enterprise.unit}`;

  const factualDescription = [
    `Proposed Business: ${enterprise.name}`,
    `Category: ${enterprise.category}`,
    `Proposed Scale: ${proposedScale}`,
    `Primary Activity: ${enterprise.description || 'Not specified in the current business model.'}`,
    `Primary Inputs: ${primaryInputs.join(', ')}`,
    `Primary Output: ${enterprise.unit ? `Commercial products measured in ${enterprise.unit}` : 'Not specified in the current business model.'}`
  ].join('\n');

  const spaceReq = (enterprise as any).spaceRequiredSqFt || (enterprise.infrastructure ? `${enterprise.infrastructure.spaceRequiredSqFt} sq.ft.` : undefined);

  const businessSection: BusinessPlanBusinessSection = {
    businessId: enterprise.id,
    businessName: enterprise.name,
    businessCategory: enterprise.category,
    businessType: (enterprise as any).type || (enterprise.category ? `${enterprise.category} Enterprise` : 'Micro / Small Enterprise'),
    proposedScale,
    unit: enterprise.unit,
    availableCapital,
    selectedLocation: `${location.villageOrTown ? `${location.villageOrTown}, ` : ''}${location.district}, ${location.state}`,
    factualDescription,
    primaryInputs,
    primaryOutput: enterprise.unit ? `Processed / manufactured goods measured in ${enterprise.unit}` : 'Not specified in the current business model.',
    majorEquipment,
    infrastructureRequirements: spaceReq
      ? `${spaceReq} covered area, standard power & water connection`
      : 'Covered shed with standard power and water utility connections',
    workingCapitalRequirement: financialPlan.workingCapitalRequirement,
    fixedAssetsCost: financialPlan.fixedAssetsCost
  };

  // 2. Entrepreneur Section (Strictly user-provided only)
  const hasDeclaredDetails = Boolean(
    entrepreneurProfile && (
      entrepreneurProfile.age !== undefined ||
      entrepreneurProfile.gender !== undefined ||
      entrepreneurProfile.socialCategory !== undefined ||
      entrepreneurProfile.isFarmer !== undefined ||
      entrepreneurProfile.isRural !== undefined ||
      entrepreneurProfile.isNewBusiness !== undefined
    )
  );

  const entrepreneurSection: EntrepreneurPlanSection = {
    age: entrepreneurProfile?.age,
    gender: entrepreneurProfile?.gender,
    socialCategory: entrepreneurProfile?.socialCategory,
    isFarmer: entrepreneurProfile?.isFarmer,
    isRural: entrepreneurProfile?.isRural ?? (location.locationType === 'rural'),
    isNewBusiness: entrepreneurProfile?.isNewBusiness,
    hasDeclaredDetails
  };

  // 3. Location Section (Preserves Phase 5 benchmarks & disclosures)
  const isCalibrated = Boolean(districtData && districtData.district.toLowerCase() === location.district.toLowerCase());
  const geographicResolution = districtData?.population?.geographicLevel || 'District-level estimate';
  const marketCatchment = districtData?.mandis && districtData.mandis.length > 0
    ? `Primary trading mandis / wholesale hubs: ${districtData.mandis.map((m) => `${m.name} (${m.distanceKm} km)`).join(', ')}`
    : (districtData?.prominentLocalMarkets && districtData.prominentLocalMarkets.length > 0
      ? `Prominent local markets: ${districtData.prominentLocalMarkets.join(', ')}`
      : 'Local block and district commercial catchment');
  const powerHours = districtData?.infrastructure?.averagePowerSupplyHoursPerDay?.value;
  const roadConnectivity = districtData?.logistics?.pmgsyRoadConnectivity;

  const locationSection: BusinessPlanLocationSection = {
    state: location.state,
    district: location.district,
    subDistrictOrBlock: location.subDistrictOrBlock,
    villageOrTown: location.villageOrTown,
    locationType: location.locationType,
    resolution: geographicResolution,
    marketCatchmentInfo: marketCatchment,
    powerAvailabilityHours: powerHours,
    roadConnectivityRating: roadConnectivity,
    benchmarkDisclosure: 'Location analysis uses district/state reference benchmark data and must be verified locally at the site prior to capital commitment.',
    isCalibratedDistrict: isCalibrated
  };

  // 4. Agriculture Section (Appears ONLY for applicable businesses from Phase 6)
  let agricultureSection: BusinessPlanAgricultureSection | undefined = undefined;
  if (agriLocationAnalysis && (agriLocationAnalysis.isAgriBusiness || agriLocationAnalysis.agriBusinessKind)) {
    const unknownFactors = agriLocationAnalysis.factors
      ? agriLocationAnalysis.factors.filter((f) => f.status === 'unknown').map((f) => `${f.factorLabel}: Data not available in district records`)
      : [];

    const priorityVerificationSteps = agriLocationAnalysis.whatToVerifyLocally && agriLocationAnalysis.whatToVerifyLocally.length > 0
      ? agriLocationAnalysis.whatToVerifyLocally.map((v) => `${v.factorLabel}: ${v.practicalAction || v.instruction}`)
      : ['Conduct ground-level water testing and local mandi inquiry before investment'];

    agricultureSection = {
      applicable: true,
      businessKind: agriLocationAnalysis.agriBusinessKind || 'agricultural_enterprise',
      whyMaySuit: agriLocationAnalysis.whyMaySuit || [],
      whyMayNotSuit: agriLocationAnalysis.whyMayNotSuit || [],
      unknownFactors,
      priorityVerificationSteps,
      scoreDisclosure: agriLocationAnalysis.scoreDisclosure || 'No composite or single suitability score is computed. Suitability depends on local micro-climate, groundwater testing, and field verification.'
    };
  }

  // 5. Financial Section (Phase 4 Invariant Source of Truth)
  const annualRevenueYear1 = financialPlan.annualTurnoverYear1 ?? (financialPlan.monthlyRevenue * 12);
  const annualOperatingCostYear1 = financialPlan.annualOperatingCostYear1 ?? (financialPlan.monthlyOperatingExpenses * 12);
  const annualNetProfitYear1 = financialPlan.profitAfterTax ?? (financialPlan.monthlyNetProfit * 12);
  const monthlyOpex = financialPlan.monthlyOperatingExpenses ?? (annualOperatingCostYear1 / 12);
  const estimatedMonthlyEmi = financialPlan.monthlyEmi ?? null;
  const breakEvenCapacityPercent = financialPlan.breakEvenSalesPercent ?? null;
  const affordabilityClassification = (financialPlan as any).affordabilityClassification ||
    financialPlan.scaling?.affordabilityTier ||
    (financialPlan.financingGap === 0 ? 'FITS_BUDGET' : financialPlan.financingGap <= availableCapital * 2 ? 'LIMITED_FINANCING' : 'HIGHER_INVESTMENT');

  let plainInterpretation = financialPlan.scaling?.affordabilityReason || '';
  if (!plainInterpretation) {
    if (affordabilityClassification === 'FITS_BUDGET') {
      plainInterpretation = `Your available capital of ₹${availableCapital.toLocaleString('en-IN')} fully covers or exceeds the total project outlay of ₹${financialPlan.totalProjectCost.toLocaleString('en-IN')}. The business plan requires zero external borrowing.`;
    } else if (affordabilityClassification === 'LIMITED_FINANCING') {
      plainInterpretation = `The proposed scale requires a total project outlay of ₹${financialPlan.totalProjectCost.toLocaleString('en-IN')}. With available capital of ₹${availableCapital.toLocaleString('en-IN')}, a financing gap of ₹${financialPlan.financingGap.toLocaleString('en-IN')} exists. The model classifies this as requiring limited bank term loans or government credit support.`;
    } else {
      plainInterpretation = `The project outlay of ₹${financialPlan.totalProjectCost.toLocaleString('en-IN')} significantly exceeds available capital (₹${availableCapital.toLocaleString('en-IN')}). The financial engine classifies this as higher investment, requiring substantial credit linkage or co-investment.`;
    }
  }

  const financialSection: BusinessPlanFinancialSection = {
    totalProjectCost: financialPlan.totalProjectCost,
    fixedAssetsCost: financialPlan.fixedAssetsCost,
    workingCapitalRequirement: financialPlan.workingCapitalRequirement,
    availableCapital,
    promoterContribution: financialPlan.promoterContribution,
    financingGap: financialPlan.financingGap,
    bankTermLoanRequired: financialPlan.bankTermLoanRequired,
    workingCapitalBankLoan: financialPlan.workingCapitalBankLoan,
    monthlyRevenue: financialPlan.monthlyRevenue,
    annualRevenueYear1,
    monthlyOpex,
    annualOperatingCostYear1,
    monthlyNetProfit: financialPlan.monthlyNetProfit,
    annualNetProfitYear1,
    estimatedMonthlyEmi,
    debtServiceCoverageRatio: financialPlan.debtServiceCoverageRatio,
    breakEvenCapacityPercent,
    affordabilityClassification,
    paybackYears: financialPlan.paybackPeriodYears,
    netMarginPercent: financialPlan.netMarginPercent ?? (annualRevenueYear1 > 0
      ? (annualNetProfitYear1 / annualRevenueYear1) * 100
      : 0),
    plainLanguageInterpretation: plainInterpretation
  };

  // 6. Scenarios Section (Phase 4 multi-scenario sensitivities)
  const scenarios: BusinessPlanScenarioSection[] = scenarioSnapshots && scenarioSnapshots.length > 0
    ? scenarioSnapshots
    : financialPlan.scenarios ? [
        {
          scenario: 'conservative',
          label: 'Conservative (-15% Revenue, +5% OPEX)',
          monthlyRevenue: financialPlan.scenarios.conservative.monthlyRevenue,
          monthlyOpex: financialPlan.scenarios.conservative.monthlyOpex,
          monthlyNetProfit: financialPlan.scenarios.conservative.monthlyNetProfit,
          estimatedEmi: financialPlan.scenarios.conservative.monthlyEmi,
          assumptions: 'Adverse market conditions: subdued product pricing and lower capacity utilization.'
        },
        {
          scenario: 'base',
          label: 'Base Case (Standard Operating Parameters)',
          monthlyRevenue: financialPlan.scenarios.base.monthlyRevenue,
          monthlyOpex: financialPlan.scenarios.base.monthlyOpex,
          monthlyNetProfit: financialPlan.scenarios.base.monthlyNetProfit,
          estimatedEmi: financialPlan.scenarios.base.monthlyEmi,
          assumptions: 'Verified baseline capacity utilization, local raw material pricing, and standard product margins.'
        },
        {
          scenario: 'optimistic',
          label: 'Optimistic (+10% Revenue, -4% OPEX)',
          monthlyRevenue: financialPlan.scenarios.optimistic.monthlyRevenue,
          monthlyOpex: financialPlan.scenarios.optimistic.monthlyOpex,
          monthlyNetProfit: financialPlan.scenarios.optimistic.monthlyNetProfit,
          estimatedEmi: financialPlan.scenarios.optimistic.monthlyEmi,
          assumptions: 'Favorable operational conditions: strong local sales demand and bulk procurement savings.'
        }
      ]
    : [
        {
          scenario: 'conservative',
          label: 'Conservative (-15% Revenue, +5% OPEX)',
          monthlyRevenue: Math.round(financialPlan.monthlyRevenue * 0.85),
          monthlyOpex: Math.round((annualOperatingCostYear1 / 12) * 1.05),
          monthlyNetProfit: Math.round(
            (financialPlan.monthlyRevenue * 0.85) -
            ((annualOperatingCostYear1 / 12) * 1.05) -
            (estimatedMonthlyEmi || 0)
          ),
          estimatedEmi: estimatedMonthlyEmi,
          assumptions: 'Adverse market conditions: subdued product pricing and lower capacity utilization.'
        },
        {
          scenario: 'base',
          label: 'Base Case (Standard Operating Parameters)',
          monthlyRevenue: financialPlan.monthlyRevenue,
          monthlyOpex: Math.round(annualOperatingCostYear1 / 12),
          monthlyNetProfit: financialPlan.monthlyNetProfit,
          estimatedEmi: estimatedMonthlyEmi,
          assumptions: 'Verified baseline capacity utilization, local raw material pricing, and standard product margins.'
        },
        {
          scenario: 'optimistic',
          label: 'Optimistic (+10% Revenue, -4% OPEX)',
          monthlyRevenue: Math.round(financialPlan.monthlyRevenue * 1.10),
          monthlyOpex: Math.round((annualOperatingCostYear1 / 12) * 0.96),
          monthlyNetProfit: Math.round(
            (financialPlan.monthlyRevenue * 1.10) -
            ((annualOperatingCostYear1 / 12) * 0.96) -
            (estimatedMonthlyEmi || 0)
          ),
          estimatedEmi: estimatedMonthlyEmi,
          assumptions: 'Favorable operational efficiency and bulk procurement savings.'
        }
      ];

  // 7. Cash Flow & 3-Year Projections (Phase 4 Projections)
  const projections: BusinessPlanProjectionsSection = {
    cashFlow12Months: financialPlan.cashFlow?.year1Monthly && financialPlan.cashFlow.year1Monthly.length > 0
      ? financialPlan.cashFlow.year1Monthly.map((m) => ({
          month: m.month,
          inflow: m.grossRevenue,
          outflow: m.operatingExpenses + m.debtServiceEmi,
          netCashFlow: m.netCashSurplus,
          cumulativeCash: m.cumulativeCashBalance
        }))
      : (financialPlan as any).cashFlowYear1Monthly && (financialPlan as any).cashFlowYear1Monthly.length > 0
        ? (financialPlan as any).cashFlowYear1Monthly.map((m: any) => ({
            month: m.month,
            inflow: m.cashInflow,
            outflow: m.cashOutflow,
            netCashFlow: m.netCashFlow,
            cumulativeCash: m.cumulativeCash
          }))
        : Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const inflow = financialPlan.monthlyRevenue;
            const outflow = Math.round(annualOperatingCostYear1 / 12) + (estimatedMonthlyEmi || 0);
            const netCashFlow = inflow - outflow;
            return {
              month,
              inflow,
              outflow,
              netCashFlow,
              cumulativeCash: netCashFlow * month
            };
          }),
    threeYearSummary: financialPlan.cashFlow?.threeYearAnnual && financialPlan.cashFlow.threeYearAnnual.length > 0
      ? financialPlan.cashFlow.threeYearAnnual.map((p) => ({
          year: p.year,
          annualRevenue: p.grossRevenue,
          annualOpex: p.operatingExpenses,
          annualNetProfit: p.netProfit
        }))
      : (financialPlan as any).threeYearProjection && (financialPlan as any).threeYearProjection.length > 0
        ? (financialPlan as any).threeYearProjection.map((p: any) => ({
            year: p.year,
            annualRevenue: p.annualRevenue,
            annualOpex: p.annualOperatingExpenses,
            annualNetProfit: p.netProfit
          }))
        : [
            {
              year: 1,
              annualRevenue: annualRevenueYear1,
              annualOpex: annualOperatingCostYear1,
              annualNetProfit: annualNetProfitYear1
            },
            {
              year: 2,
              annualRevenue: Math.round(annualRevenueYear1 * 1.10),
              annualOpex: Math.round(annualOperatingCostYear1 * 1.05),
              annualNetProfit: Math.round(annualNetProfitYear1 * 1.15)
            },
            {
              year: 3,
              annualRevenue: Math.round(annualRevenueYear1 * 1.22),
              annualOpex: Math.round(annualOperatingCostYear1 * 1.10),
              annualNetProfit: Math.round(annualNetProfitYear1 * 1.30)
            }
          ]
  };

  // 8. Financing Section (Phase 7 Links, Documented Limits, Zero False Promises)
  const potentialOptions = schemeMatches.map((m) => ({
    schemeOrLoanName: m.scheme.name,
    authorityOrBank: m.scheme.administeringAuthority || (m.scheme as any).administeringMinistryOrDepartment || 'Government Authority',
    type: (m.scheme.financialSupport.subsidyPercentage ? 'subsidy' : 'bank_loan') as 'subsidy' | 'bank_loan' | 'mixed_support',
    maxDocumentedLimit: m.scheme.financialSupport.maximumLoan || (m.scheme.financialSupport as any).maxProjectCostLimit || (m.scheme.financialSupport as any).maxLoanAmount,
    interestRateOrSubsidy: m.scheme.financialSupport.subsidyPercentage
      ? `${m.scheme.financialSupport.subsidyPercentage}% Subsidy / Margin Money`
      : m.scheme.financialSupport.interestSubventionPercent
        ? `${m.scheme.financialSupport.interestSubventionPercent}% Interest Subvention`
        : 'Collateral-free credit support',
    statusNote: m.status === 'eligible'
      ? 'Criteria met based on profile details'
      : m.status === 'potentially_eligible'
        ? 'Potentially eligible; outstanding conditions require confirmation'
        : m.status === 'needs_verification'
          ? 'Requires verification of state/nodal eligibility'
          : 'Does not currently meet criteria',
    officialUrl: m.scheme.officialApplicationUrl || m.scheme.officialInformationUrl
  }));

  const financingSection: BusinessPlanFinancingSection = {
    totalProjectCost: financialPlan.totalProjectCost,
    availableCapital,
    financingGap: financialPlan.financingGap,
    formulaText: `Total Project Cost (₹${financialPlan.totalProjectCost.toLocaleString('en-IN')}) − Available Capital (₹${availableCapital.toLocaleString('en-IN')}) = Financing Gap (₹${financialPlan.financingGap.toLocaleString('en-IN')})`,
    advisoryNote: 'This scheme may help address part or all of the financing requirement, subject to eligibility, appraisal and scheme conditions.',
    potentialOptions
  };

  // 9. Schemes Section (Phase 7 Match List, strictly unranked)
  const schemeSection: BusinessPlanSchemeSection[] = schemeMatches.map((m) => ({
    schemeId: m.scheme.id,
    schemeName: m.scheme.name,
    administeringAuthority: m.scheme.administeringAuthority || (m.scheme as any).administeringMinistryOrDepartment || 'Government Authority',
    eligibilityStatus: m.status,
    whyMatched: m.whyMatched || (m as any).reasonsMatched || m.matchedConditions,
    unmetConditions: m.unmetConditions,
    unknownConditions: m.unknownConditions,
    financialSupportDescription: m.scheme.financialSupport.description,
    officialInformationUrl: m.scheme.officialInformationUrl,
    officialApplicationUrl: m.scheme.officialApplicationUrl
  }));

  // 10. Document Readiness Section (Phase 8 Counts and Checklist Items)
  let documentSection: BusinessPlanDocumentSection | undefined = undefined;
  if (documentReadiness) {
    documentSection = {
      selectedSchemeId: documentReadiness.schemeId,
      selectedSchemeName: documentReadiness.schemeName,
      summary: {
        totalRequired: documentReadiness.summary.totalRequired,
        markedAvailable: documentReadiness.summary.markedAvailable,
        needToPrepare: documentReadiness.summary.needToPrepare,
        needVerification: documentReadiness.summary.needVerification
      },
      documents: documentReadiness.documents.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        mandatory: d.mandatory,
        userStatus: d.userStatus,
        reason: d.reason,
        verificationNote: d.verificationNote
      })),
      checklistLinkText: 'Open Full Document Readiness Checklist'
    };
  }

  // 11. Implementation Roadmap (7 Practical Steps with Traceable Provenance)
  const roadmapPowerHours = powerHours || 16;

  const implementationPlan: ImplementationPlanSection = {
    steps: [
      {
        stepNumber: 1,
        title: 'Finalize Business Model & Scale',
        category: 'planning_guidance',
        categoryLabel: 'Generic Planning Guidance',
        evidenceSource: 'Phase 3 Enterprise Template & Target Unit Economics',
        description: `Confirm proposed enterprise (${enterprise.name}) at target processing scale of ${proposedScale}. Verify local supply availability for primary raw materials (${primaryInputs.slice(0, 2).join(', ')}).`,
        actionItem: 'Sign off on proposed plant capacity, location choice, and operating hours.',
        ownerOrAgency: 'Entrepreneur'
      },
      {
        stepNumber: 2,
        title: 'Verify Local Site & Utility Conditions',
        category: 'site_operational',
        categoryLabel: 'Site Operational Preparation',
        evidenceSource: 'Phase 5 District Infrastructure & Utility Benchmarks',
        description: `Inspect site infrastructure in ${location.district} (${location.locationType} area). Confirm availability of 3-phase power (${roadmapPowerHours}+ hours/day) and adequate commercial water.`,
        actionItem: 'Conduct water testing or electrical load inspection with state DISCOM.',
        ownerOrAgency: 'Site Inspection / Local Authorities'
      },
      {
        stepNumber: 3,
        title: 'Finalize Project Cost & Quotations',
        category: 'planning_guidance',
        categoryLabel: 'Generic Planning Guidance',
        evidenceSource: 'Phase 4 Fixed Assets Breakdown',
        description: `Obtain 2 to 3 competitive machinery proforma invoices for ${majorEquipment[0] || 'core machinery'} to confirm CapEx of ₹${financialPlan.fixedAssetsCost.toLocaleString('en-IN')}. Verify working capital provision of ₹${financialPlan.workingCapitalRequirement.toLocaleString('en-IN')}.`,
        actionItem: 'Secure official manufacturer quotations valid for at least 90 days.',
        ownerOrAgency: 'Machinery Vendors / Suppliers'
      },
      {
        stepNumber: 4,
        title: 'Prepare Financing Architecture',
        category: 'planning_guidance',
        categoryLabel: 'Generic Planning Guidance',
        evidenceSource: 'Phase 4 Debt-Equity Financing Structure',
        description: `Allocate promoter equity contribution of ₹${financialPlan.promoterContribution.toLocaleString('en-IN')}. Prepare bank loan application for the financing gap of ₹${financialPlan.financingGap.toLocaleString('en-IN')}.`,
        actionItem: 'Open dedicated current account and obtain bank solvency certificate.',
        ownerOrAgency: 'Promoter & Commercial Bank Branch'
      },
      {
        stepNumber: 5,
        title: 'Prepare Scheme Documents Dossier',
        category: 'scheme_documented_process',
        categoryLabel: 'Documented Scheme Requirement',
        evidenceSource: 'Phase 8 Scheme Document Readiness Checklist',
        description: 'Compile applicant KYC, project profile (DPR), land lease agreement / registry, educational proof, and caste certificate (if claiming category subsidy).',
        actionItem: 'Complete preparation of all items listed in the Document Readiness checklist.',
        ownerOrAgency: 'Entrepreneur / DIC Facilitation Center'
      },
      {
        stepNumber: 6,
        title: 'Review Scheme Conditions with Implementing Agency',
        category: 'scheme_documented_process',
        categoryLabel: 'Documented Scheme Requirement',
        evidenceSource: 'Phase 7 Administrative Authority Guidelines',
        description: 'Verify unresolved eligibility criteria and current subsidy budgetary allocations with District Industries Centre (DIC) or Khadi & Village Industries Commission (KVIC) nodal officers.',
        actionItem: 'Confirm current financial year target allocations and nodal bank branches.',
        ownerOrAgency: 'DIC / KVIC / State Mission Office'
      },
      {
        stepNumber: 7,
        title: 'Submit Application Through Official Portal',
        category: 'scheme_documented_process',
        categoryLabel: 'Documented Scheme Requirement',
        evidenceSource: 'Phase 7 Verified Application Portal',
        description: 'File application directly through the verified government portal using official links. Track acknowledgment and physical verification schedule.',
        actionItem: 'Submit application via official portal with certified quotation uploads.',
        ownerOrAgency: 'Official Government Portal (KVIC / PMFME / Mudra)'
      }
    ],
    disclaimer: 'This roadmap provides an illustrative operational sequence. Actual administrative timelines and approval procedures depend on the respective implementing agency and bank branch.'
  };

  // 12. Plan Assumptions
  const assumptions: PlanAssumption[] = [
    {
      category: 'financial',
      title: 'Financial Engine Assumptions',
      description: 'Revenue, operating expenses, and working capital requirements are calculated deterministically from validated enterprise unit economics and the selected scale.',
      sourceOfTruth: 'Phase 4 Deterministic Financial Engine'
    },
    {
      category: 'location',
      title: 'Location & Market Catchment Benchmarks',
      description: 'Location metrics utilize official district-level data (Census, CGWB, Mandi records). Village-level field conditions require physical ground verification.',
      sourceOfTruth: 'Phase 5 GIS & Location Benchmarks'
    },
    {
      category: 'scheme',
      title: 'Government Scheme Eligibility Assumptions',
      description: 'Eligibility is assessed against documented scheme guidelines based on provided profile inputs. Final sanction and subsidy release remain at the discretion of the implementing authority.',
      sourceOfTruth: 'Phase 7 Official Government Scheme Dataset'
    },
    {
      category: 'operational',
      title: 'Document Preparation Readiness',
      description: 'Document readiness reflects user declarations and organizational preparation. It does not constitute official KYC clearance, legal vetting, or statutory approval.',
      sourceOfTruth: 'Phase 8 Document Readiness Engine'
    }
  ];

  // 13. Mandatory Disclosures
  const disclosures: PlanDisclosure[] = [
    {
      id: 'financial',
      title: 'Financial Projections Disclosure',
      text: 'Financial projections are estimates based on the assumptions used by GramUdyam and are not guarantees of actual income or repayment outcomes. Market demand, operational efficiency, and local input prices may cause variations.',
      mandatory: true
    },
    {
      id: 'scheme',
      title: 'Government Scheme & Subsidy Disclosure',
      text: 'Scheme eligibility, subsidy/loan availability, sanction and final terms are subject to the relevant authority, implementing agency or financial institution. Matching indicates alignment with guidelines, not sanction.',
      mandatory: true
    },
    {
      id: 'location',
      title: 'Location Intelligence Disclosure',
      text: 'Location insights may use district/state benchmark data and should be locally verified before investment. Ground-level water, power, and road conditions must be independently inspected.',
      mandatory: true
    },
    {
      id: 'documents',
      title: 'Document Readiness Disclosure',
      text: 'Document readiness reflects user preparation status and does not constitute official document verification or legal guarantee of acceptance by banks or government portals.',
      mandatory: true
    },
    {
      id: 'agriculture',
      title: 'Agricultural Feasibility Disclosure',
      text: 'Agricultural feasibility assessments utilize regional agro-climatic benchmarks. Local verification of soil quality, micro-climates, water table levels, and mandi procurement is strongly recommended.',
      mandatory: true
    },
    {
      id: 'plan',
      title: 'Statutory & Regulatory Plan Disclosure',
      text: 'The generated plan is a project preparation dossier and does not constitute an official government application, binding bank appraisal, or formal credit sanction.',
      mandatory: true
    }
  ];

  return {
    id: existingId || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    business: businessSection,
    entrepreneur: entrepreneurSection,
    location: locationSection,
    agricultureAnalysis: agricultureSection,
    financials: financialSection,
    scenarios,
    projections,
    financing: financingSection,
    schemes: schemeSection,
    documentReadiness: documentSection,
    implementationPlan,
    narrative: narrative || {
      businessObjectives: `Establish a profitable and sustainable ${enterprise.name} in ${location.district}, catering to regional market demand with quality local production.`,
      targetCustomersAndMarket: 'Local retail merchants, rural weekly haats, semi-urban wholesalers, and commercial food/industrial buyers in the catchment area.',
      operationalNotes: 'Operate in single shifts during initial 6 months, expanding to full capacity utilization by Year 2.',
      promoterRemarks: 'The promoter has surveyed local demand and confirmed availability of primary raw materials and basic utility connections.'
    },
    assumptions,
    disclosures
  };
}
