import { LoanProduct } from '../types/loans.ts';
import { LOAN_PRODUCTS } from '../data/loanProductsData.ts';
import { calculateEmi } from './financialEngine.ts';
import {
  BankAppraisalDossier,
  BankAppraisalRequest,
  BankBranchInterviewPrompt,
  BankMatchedLoan,
  CreditGuaranteeAssessment,
  DisbursementMilestone,
  DscrComfortBand,
  PromoterMarginAssessment,
  StatutoryClearanceItem
} from '../types/bankAppraisal.ts';

/**
 * 1. Promoter Margin Assessment
 * Evaluates promoter equity compliance against RBI MSME guidelines and PMEGP/MUDRA norms.
 */
export function assessPromoterMargin(
  totalProjectCost: number,
  actualPromoterContribution: number,
  isSpecialCategory = false
): PromoterMarginAssessment {
  const safeCost = Math.max(0, totalProjectCost);
  const safeContribution = Math.max(0, actualPromoterContribution);

  // Governing benchmark:
  // - Special Category (Women, SC, ST, OBC, Ex-Servicemen, PwD, North-East) or micro <= 5L: 10%
  // - General Category micro projects <= 10L: 15%
  // - General Category projects > 10L: 20%
  let requiredMarginPercent = 15;
  let normCitation = 'RBI Master Direction on MSME Lending (FIDD.MSME.BC.No.20/06.02.031/2017-18) — General Micro Project Margin';

  if (isSpecialCategory) {
    requiredMarginPercent = 10;
    normCitation = 'PMEGP & RBI Priority Sector Guidelines — Special Category / Women / SC / ST (10% Minimum Margin)';
  } else if (safeCost > 1000000) {
    requiredMarginPercent = 20;
    normCitation = 'RBI / Commercial Bank MSME Credit Policy — General Category Projects above ₹10 Lakhs (20% Minimum Margin)';
  } else {
    requiredMarginPercent = 15;
    normCitation = 'RBI MSME Master Direction — Micro Enterprises General Category (15% Minimum Margin)';
  }

  const requiredMarginAmount = Math.round((safeCost * requiredMarginPercent) / 100);
  const actualMarginPercent = safeCost > 0 ? Number(((safeContribution / safeCost) * 100).toFixed(1)) : 100;
  const isCompliant = safeContribution >= requiredMarginAmount;
  const shortfallAmount = isCompliant ? 0 : requiredMarginAmount - safeContribution;

  let complianceNote = '';
  if (isCompliant) {
    complianceNote = `Promoter equity of ₹${safeContribution.toLocaleString('en-IN')} (${actualMarginPercent}%) satisfies the mandatory ${requiredMarginPercent}% margin requirement (₹${requiredMarginAmount.toLocaleString('en-IN')}).`;
  } else {
    complianceNote = `Shortfall of ₹${shortfallAmount.toLocaleString('en-IN')}. Bank branch will require increasing equity to at least ₹${requiredMarginAmount.toLocaleString('en-IN')} (${requiredMarginPercent}%) before sanction.`;
  }

  return {
    requiredMarginPercent,
    requiredMarginAmount,
    actualPromoterContribution: safeContribution,
    actualMarginPercent,
    isCompliant,
    shortfallAmount,
    governingNorm: normCitation,
    complianceNote
  };
}

/**
 * 2. Debt Service Coverage Ratio (DSCR) Comfort Assessment
 * Benchmarked against commercial Indian banking credit appraisal standards.
 */
export function assessDscrComfort(
  dscr: number | null | undefined,
  loanAmount: number
): { band: DscrComfortBand; analysis: string } {
  if (loanAmount <= 0 || dscr === null || dscr === undefined) {
    return {
      band: 'no_debt',
      analysis: 'Zero external bank debt required. The enterprise is 100% equity-funded, carrying no debt-servicing liability or loan default risk.'
    };
  }

  if (dscr >= 1.50) {
    return {
      band: 'comfortable',
      analysis: `Debt Service Coverage Ratio (${dscr.toFixed(2)}x) meets and exceeds the commercial bank appraisal benchmark (≥ 1.50x). Projected operating net profit provides a substantial safety buffer to comfortably service monthly interest and principal obligations even under moderate economic downturns.`
    };
  }

  if (dscr >= 1.25) {
    return {
      band: 'marginal',
      analysis: `Debt Service Coverage Ratio (${dscr.toFixed(2)}x) falls into the marginal bankability range (1.25x - 1.49x). While acceptable to most public sector banks under credit-guaranteed schemes (CGTMSE/CGFMU), the credit officer may scrutinize working capital assumptions and request a longer repayment tenure to improve cash coverage.`
    };
  }

  return {
    band: 'high_risk',
    analysis: `Debt Service Coverage Ratio (${dscr.toFixed(2)}x) is below the standard commercial banking acceptance threshold (< 1.25x). High probability of credit appraisal objection. Recommendation: Increase promoter equity or scale down CapEx to reduce the term loan requirement.`
  };
}

/**
 * 3. Collateral-Free Credit Guarantee Assessment
 * Evaluates coverage under CGFMU (MUDRA), CGTMSE (MSME), or Stand-Up India.
 */
export function assessCreditGuarantee(
  loanAmount: number,
  isWomanOrSpecialCategory = false
): CreditGuaranteeAssessment {
  const safeLoan = Math.max(0, loanAmount);

  if (safeLoan === 0) {
    return {
      schemeName: 'None',
      isCollateralFreeEligible: true,
      maxEligibleCoveragePercent: 0,
      guaranteeFeeBenchmark: 'Not applicable (Zero bank debt)',
      statutoryReference: 'N/A',
      coverageCondition: 'Self-financed project. No institutional credit guarantee cover required.'
    };
  }

  // Loans up to 20 Lakhs under MUDRA / CGFMU
  if (safeLoan <= 2000000) {
    const isShishu = safeLoan <= 50000;
    return {
      schemeName: 'CGFMU',
      isCollateralFreeEligible: true,
      maxEligibleCoveragePercent: isShishu ? 100 : (isWomanOrSpecialCategory ? 85 : 75),
      guaranteeFeeBenchmark: isShishu ? '0% (Nil guarantee fee)' : '0.50% p.a. on sanctioned loan amount',
      statutoryReference: 'Credit Guarantee Fund for Micro Units (CGFMU) — Ministry of Finance / NCGTC Notification',
      coverageCondition: 'Mandatory collateral-free facility under RBI PMMY norms. Banks are prohibited from asking for collateral for loans up to ₹10 Lakhs (extendable to ₹20 Lakhs under CGFMU).'
    };
  }

  // Loans between 20 Lakhs and 500 Lakhs under CGTMSE
  if (safeLoan <= 50000000) {
    const coverage = isWomanOrSpecialCategory ? 85 : 75;
    return {
      schemeName: 'CGTMSE',
      isCollateralFreeEligible: true,
      maxEligibleCoveragePercent: coverage,
      guaranteeFeeBenchmark: isWomanOrSpecialCategory ? '0.37% to 0.75% p.a. (Concessional for Women/Special Category)' : '0.75% to 1.35% p.a. on outstanding balance',
      statutoryReference: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) — SIDBI & Ministry of MSME',
      coverageCondition: `Eligible for ${coverage}% collateral-free guarantee coverage under CGTMSE Scheme XIV. Third-party guarantor or immovable collateral is waived by participating member lending institutions (MLIs).`
    };
  }

  // Large commercial loan above ₹5 Crores
  return {
    schemeName: 'None',
    isCollateralFreeEligible: false,
    maxEligibleCoveragePercent: 0,
    guaranteeFeeBenchmark: 'Commercial bank lending norms apply',
    statutoryReference: 'RBI Commercial Credit Directives',
    coverageCondition: 'Loan amount exceeds standard collateral-free MSME credit guarantee thresholds. Primary hypothecation of assets and collateral/security will be required by the lending institution.'
  };
}

/**
 * 4. Loan Product Matching & Sizing
 */
export function matchLoanProductsForAppraisal(
  loanAmount: number,
  isWomanOrSpecialCategory = false
): BankMatchedLoan[] {
  if (loanAmount <= 0) return [];

  const matched = LOAN_PRODUCTS.filter((product) => {
    if (product.category === 'stand_up_india' && !isWomanOrSpecialCategory) {
      return false;
    }
    return loanAmount >= product.minLoanAmount && loanAmount <= product.maxLoanAmount;
  });

  return matched.map((product) => {
    const avgRate = (product.indicativeInterestRateMin + product.indicativeInterestRateMax) / 2;
    const emi = calculateEmi(loanAmount, avgRate, product.maxTenureMonths);

    let fitRationale = '';
    if (product.category === 'mudra_shishu') {
      fitRationale = 'Ideal for micro bootstrapping under ₹50,000 with 100% CGFMU guarantee and zero processing fees.';
    } else if (product.category === 'mudra_kishore') {
      fitRationale = 'Standard rural micro-enterprise credit line (₹50k - ₹5L) with collateral-free CGFMU cover and 6-month moratorium.';
    } else if (product.category === 'mudra_tarun') {
      fitRationale = 'Scaled micro-enterprise term loan (₹5L - ₹20L) for automated machinery and equipment expansion.';
    } else if (product.category === 'stand_up_india') {
      fitRationale = 'Priority composite term loan for greenfield enterprise promoted by Woman or SC/ST entrepreneur.';
    } else {
      fitRationale = 'Comprehensive term credit from Regional Rural Banks (RRB) or Public Sector Banks backed by CGTMSE credit guarantee.';
    }

    return {
      product,
      category: product.category,
      suggestedLoanAmount: loanAmount,
      estimatedMonthlyEmi: emi.monthlyEmi,
      indicativeTenureMonths: product.maxTenureMonths,
      moratoriumMonths: product.moratoriumMonths,
      interestRateRange: `${product.indicativeInterestRateMin}% - ${product.indicativeInterestRateMax}% p.a.`,
      fitRationale
    };
  });
}

/**
 * 5. Statutory Clearances & Regulatory Compliance Matrix
 */
export function deriveStatutoryClearances(
  category: string,
  annualTurnover: number,
  groundwaterConcern = false
): StatutoryClearanceItem[] {
  const clearances: StatutoryClearanceItem[] = [
    {
      id: 'stat_udyam',
      name: 'Udyam MSME Registration Certificate',
      authority: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
      stage: 'pre_sanction',
      mandatory: true,
      portalUrl: 'https://udyamregistration.gov.in',
      citation: 'Micro, Small and Medium Enterprises Development (MSMED) Act, 2006',
      applicabilityNote: 'Mandatory zero-fee online registration required by banks to extend Priority Sector Lending (PSL) interest rates and CGTMSE cover.'
    },
    {
      id: 'stat_pan_current_acc',
      name: 'Business PAN & Commercial Bank Current Account',
      authority: 'Central Board of Direct Taxes & Commercial Bank',
      stage: 'pre_sanction',
      mandatory: true,
      citation: 'Income Tax Act 1961 & RBI KYC Directives',
      applicabilityNote: 'Essential for disbursement of term loan proceeds and direct RTGS payment to machinery suppliers.'
    },
    {
      id: 'stat_panchayat_noc',
      name: 'Gram Panchayat Trade NOC / Site Clearance',
      authority: 'Local Gram Panchayat / Block Development Office',
      stage: 'pre_disbursement',
      mandatory: true,
      citation: 'State Panchayati Raj Acts & Rules',
      applicabilityNote: 'Confirms land use permissions and ensures no local objection for rural machinery installation.'
    }
  ];

  // Food / Agro Processing Clearances
  const isAgroFood = [
    'agro_processing',
    'oil_expeller',
    'spices_processing',
    'dal_mill',
    'dairy_chilling',
    'cattle_feed',
    'beekeeping',
    'mushroom',
    'food_processing'
  ].some((c) => category.toLowerCase().includes(c));

  if (isAgroFood) {
    const isStateLicense = annualTurnover > 1200000;
    clearances.push({
      id: 'stat_fssai',
      name: isStateLicense ? 'FSSAI State Manufacturing License' : 'FSSAI Basic Food Business Registration',
      authority: 'Food Safety and Standards Authority of India (FSSAI)',
      stage: 'pre_disbursement',
      mandatory: true,
      portalUrl: 'https://foscos.fssai.gov.in',
      citation: 'Food Safety and Standards Act, 2006 & Regulations 2011',
      applicabilityNote: isStateLicense
        ? `Annual projected receipts of ₹${annualTurnover.toLocaleString('en-IN')} exceed the ₹12 Lakh threshold, requiring an FSSAI State Manufacturing License.`
        : 'Projected turnover falls within the micro food business registration threshold (FSSAI Basic).'
    });
  }

  // Environmental / Pollution Category (CPCB Guidelines)
  const isFlyAsh = category.toLowerCase().includes('flyash') || category.toLowerCase().includes('bricks');
  const isSolarOrHoney = category.toLowerCase().includes('solar') || category.toLowerCase().includes('beekeeping');

  if (isSolarOrHoney) {
    clearances.push({
      id: 'stat_cpcb_white',
      name: 'CPCB White Category Pollution Exemption Intimation',
      authority: 'State Pollution Control Board (SPCB)',
      stage: 'pre_disbursement',
      mandatory: false,
      citation: 'CPCB Categorization of Industrial Sectors (Notification 2016)',
      applicabilityNote: 'Classified as non-polluting White Category. Only submission of simple online intimation required; no Consent to Operate (CTO) fees.'
    });
  } else if (isFlyAsh) {
    clearances.push({
      id: 'stat_cpcb_orange',
      name: 'Consent to Establish (CTE) & Consent to Operate (CTO)',
      authority: 'State Pollution Control Board (SPCB)',
      stage: 'pre_disbursement',
      mandatory: true,
      citation: 'Water (Prevention and Control of Pollution) Act 1974 & Air Act 1981',
      applicabilityNote: 'Mandatory environmental clearance for building material manufacturing prior to machine trial run.'
    });
  } else {
    clearances.push({
      id: 'stat_cpcb_green',
      name: 'Consent to Establish (CTE) — Green Category',
      authority: 'State Pollution Control Board (SPCB)',
      stage: 'pre_disbursement',
      mandatory: true,
      citation: 'CPCB Harmonized Classification of Industrial Sectors, 2016',
      applicabilityNote: 'Agro/manufacturing units with low effluent discharge qualify for fast-track Green Category consent.'
    });
  }

  // GST Registration
  const isGstMandatory = annualTurnover >= 4000000;
  clearances.push({
    id: 'stat_gst',
    name: 'Goods & Services Tax (GSTIN) Registration',
    authority: 'Goods and Services Tax Network (GSTN)',
    stage: isGstMandatory ? 'pre_disbursement' : 'post_commercial',
    mandatory: isGstMandatory,
    portalUrl: 'https://www.gst.gov.in',
    citation: 'Central Goods and Services Tax (CGST) Act, 2017',
    applicabilityNote: isGstMandatory
      ? `Projected turnover of ₹${annualTurnover.toLocaleString('en-IN')} exceeds the ₹40 Lakh threshold for manufacturing goods, making GSTIN mandatory.`
      : 'Turnover is within threshold exemption; voluntary GSTIN registration recommended if seeking Input Tax Credit (ITC) on machinery purchase.'
  });

  // Groundwater Extraction NOC (Phase 6 Hydrogeology linkage)
  if (groundwaterConcern) {
    clearances.push({
      id: 'stat_cgwa_noc',
      name: 'Central Ground Water Authority (CGWA) Abstraction NOC',
      authority: 'Central Ground Water Board / State Ground Water Authority',
      stage: 'pre_disbursement',
      mandatory: true,
      portalUrl: 'https://cgwa-noc.gov.in',
      citation: 'Environment (Protection) Act, 1986 & CGWA Guidelines 2020',
      applicabilityNote: 'Mandatory groundwater abstraction permission because the unit is located in a notified critical/over-exploited hydrogeological block.'
    });
  }

  return clearances;
}

/**
 * 6. Bank Branch Interview & Due Diligence Preparation Prompts
 */
export function generateBankInterviewPrompts(
  category: string,
  dscr: number | null,
  isMarginCompliant: boolean
): BankBranchInterviewPrompt[] {
  const prompts: BankBranchInterviewPrompt[] = [
    {
      topic: 'Equity Margin & Source of Capital',
      question: 'Where has the promoter contribution been arranged from, and is it available in liquid bank balance?',
      recommendedResponse: isMarginCompliant
        ? 'Confirm that own equity is parked in bank account or term deposit and provide 6 months bank statement verifying genuine promoter savings without unverified unsecured loans.'
        : 'Explain the concrete timeline and verified family/promoter assets being liquidated to bridge the equity margin shortfall before the sanction date.',
      riskMitigationContext: 'Credit officers must ensure equity is not funded via short-term informal debt that would drain project cash flow.'
    },
    {
      topic: 'Working Capital Turnaround & Receivable Cycles',
      question: 'How many days of debtor credit are typical in this local mandi/market, and how will operational expenses be met during collection delays?',
      recommendedResponse: 'State the built-in 30-45 day working capital cushion included in the project report. Highlight cash-and-carry local retail sales and documented supplier agreements for raw material credit.',
      riskMitigationContext: 'Banks are sensitive to working capital stress causing early loan delinquency.'
    },
    {
      topic: 'Machinery Selection & Supplier Reliability',
      question: 'Why did you select this specific machinery supplier, and what warranty, AMC, and on-site training terms are contracted?',
      recommendedResponse: 'Present 2-3 competitive proforma quotations. Emphasize manufacturer reputation, minimum 1-year comprehensive replacement warranty, and free operator training provided at installation.',
      riskMitigationContext: 'Prevents diversion of funds and ensures capital equipment can achieve target capacity without prolonged breakdown.'
    },
    {
      topic: 'Debt Service Capacity & Seasonal Downside',
      question: 'What happens to loan repayment during seasonal off-months or unexpected crop harvest failure?',
      recommendedResponse: (dscr && dscr >= 1.5)
        ? `Point to the robust ${dscr.toFixed(2)}x DSCR which maintains cash surplus even during off-peak periods, alongside the 6-month loan moratorium built into the repayment plan.`
        : 'Highlight the conservative scenario stress-test demonstrating positive net operating margin, along with multi-commodity raw material flexibility to smooth out seasonal variances.',
      riskMitigationContext: 'Evaluates promoter resilience and understanding of agricultural seasonal cash flow fluctuations.'
    },
    {
      topic: 'Management Commitment & Operational Presence',
      question: 'Will the promoter manage operations on-site full-time, and what technical or commercial background does the team possess?',
      recommendedResponse: 'Confirm full-time operational leadership at the project site. Mention relevant farming, trade, or local market experience and any EDP (Entrepreneurship Development Program) certifications completed.',
      riskMitigationContext: 'Absentee ownership has a high correlation with micro-enterprise failure; credit officers prioritize dedicated full-time operators.'
    }
  ];

  return prompts;
}

/**
 * 7. Milestone-Based Disbursement Schedule (Capital Drawdown)
 * Strictly verifies that the sum of estimatedTrancheAmount across stages equals totalProjectCost.
 */
export function deriveDisbursementMilestones(
  totalProjectCost: number,
  promoterContribution: number,
  bankTermLoanRequired: number
): DisbursementMilestone[] {
  const safeTotal = Math.max(0, totalProjectCost);
  const safeEquity = Math.max(0, promoterContribution);
  const safeLoan = Math.max(0, bankTermLoanRequired);

  // 4 standard banking disbursement stages:
  // Stage 1: Site Prep, Civil Works & Shed (20% of cost)
  // Stage 2: Plant & Machinery Advance (40% of cost)
  // Stage 3: Equipment Delivery, Erection & Trial Run (25% of cost)
  // Stage 4: Initial Working Capital & Commercial Launch (15% of cost)
  const stage1Cost = Math.round(safeTotal * 0.20);
  const stage2Cost = Math.round(safeTotal * 0.40);
  const stage3Cost = Math.round(safeTotal * 0.25);
  // Ensure the 4th stage absorbs any rounding differences so the exact sum equals safeTotal
  const stage4Cost = safeTotal - (stage1Cost + stage2Cost + stage3Cost);

  return [
    {
      stageNumber: 1,
      milestoneName: 'Site Preparation, Civil Foundation & Utility Infrastructure',
      description: 'Completion of shed flooring, boundary work, 3-phase power line application, and borewell/utility connection.',
      promoterEquitySharePercent: 60,
      termLoanSharePercent: 40,
      estimatedTrancheAmount: stage1Cost,
      verificationRequired: 'Site inspection report by bank field officer and Gram Panchayat NOC.'
    },
    {
      stageNumber: 2,
      milestoneName: 'Plant & Machinery Supplier Order Advance',
      description: 'Payment of manufacturer advance for fabrication of core processing equipment and motors.',
      promoterEquitySharePercent: 15,
      termLoanSharePercent: 85,
      estimatedTrancheAmount: stage2Cost,
      verificationRequired: 'Direct RTGS to verified machinery vendor against stamped proforma invoice and purchase order.'
    },
    {
      stageNumber: 3,
      milestoneName: 'Machinery Delivery, Installation & Trial Run Commissioning',
      description: 'Receipt of machinery on-site, mechanical erection, trial milling/production, and operator training.',
      promoterEquitySharePercent: 10,
      termLoanSharePercent: 90,
      estimatedTrancheAmount: stage3Cost,
      verificationRequired: 'Physical asset verification by bank manager, invoice stamped with bank hypothecation clause, and insurance cover.'
    },
    {
      stageNumber: 4,
      milestoneName: 'Initial Working Capital Drawdown & Commercial Operations',
      description: 'Procurement of raw material buffer, packaging containers, labor wages, and formal commercial launch.',
      promoterEquitySharePercent: 15,
      termLoanSharePercent: 85,
      estimatedTrancheAmount: stage4Cost,
      verificationRequired: 'First stock inspection statement, FSSAI / local trade registration proof, and power energization certificate.'
    }
  ];
}

/**
 * 8. Consolidated Bank Appraisal Dossier Assembly
 * Strictly consumes Phase 4 financial outputs as immutable truth.
 */
export function generateBankAppraisalDossier(req: BankAppraisalRequest): BankAppraisalDossier {
  const marginAssessment = assessPromoterMargin(
    req.totalProjectCost,
    req.promoterContribution,
    Boolean(req.isWomanOrSpecialCategory)
  );

  const dscrAssessment = assessDscrComfort(
    req.debtServiceCoverageRatio,
    req.bankTermLoanRequired
  );

  const creditGuarantee = assessCreditGuarantee(
    req.bankTermLoanRequired,
    Boolean(req.isWomanOrSpecialCategory)
  );

  const matchedLoans = matchLoanProductsForAppraisal(
    req.bankTermLoanRequired,
    Boolean(req.isWomanOrSpecialCategory)
  );

  const statutoryClearances = deriveStatutoryClearances(
    req.enterpriseCategory,
    req.monthlyRevenue * 12,
    Boolean(req.groundwaterConcern)
  );

  const interviewPrompts = generateBankInterviewPrompts(
    req.enterpriseCategory,
    req.debtServiceCoverageRatio,
    marginAssessment.isCompliant
  );

  const disbursementMilestones = deriveDisbursementMilestones(
    req.totalProjectCost,
    req.promoterContribution,
    req.bankTermLoanRequired
  );

  const statutoryDisclaimer =
    'BANK CREDIT APPRAISAL DISCLAIMER: This dossier provides an indicative pre-sanction evaluation structured according to published Reserve Bank of India (RBI) MSME Master Directions, Credit Guarantee Fund Trust (CGTMSE/CGFMU) frameworks, and standard commercial lending norms. It does NOT constitute a formal loan sanction, credit commitment, or legal guarantee of credit disbursement. Final loan approval, interest spread, moratorium, and collateral terms remain subject to the sole independent discretion and due diligence of the respective lending institution.';

  return {
    id: `appraisal_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    generatedAt: new Date().toISOString(),
    enterpriseId: req.enterpriseId,
    enterpriseName: req.enterpriseName,
    enterpriseCategory: req.enterpriseCategory,
    location: {
      state: req.state,
      district: req.district,
      locationType: req.locationType || 'rural'
    },
    // Pure invariant consumption of Phase 4 financial metrics
    totalProjectCost: req.totalProjectCost,
    fixedAssetsCost: req.fixedAssetsCost,
    workingCapitalRequirement: req.workingCapitalRequirement,
    availableCapital: req.availableCapital,
    promoterContribution: req.promoterContribution,
    bankTermLoanRequired: req.bankTermLoanRequired,
    financingGap: req.financingGap,
    monthlyRevenue: req.monthlyRevenue,
    monthlyOpex: req.monthlyOpex,
    monthlyNetProfit: req.monthlyNetProfit,
    debtServiceCoverageRatio: req.debtServiceCoverageRatio,
    dscrComfortBand: dscrAssessment.band,
    dscrAnalysis: dscrAssessment.analysis,
    marginAssessment,
    creditGuarantee,
    matchedLoans,
    statutoryClearances,
    interviewPrompts,
    disbursementMilestones,
    statutoryDisclaimer
  };
}

/**
 * 9. Plain Text Banker's Dossier Export
 */
export function generateBankDossierPlainText(dossier: BankAppraisalDossier): string {
  const lines: string[] = [
    '================================================================================',
    'GRAMUDYAM — BANK CREDIT APPRAISAL DOSSIER & LENDING FEASIBILITY REPORT',
    `Date Generated: ${new Date(dossier.generatedAt).toLocaleDateString('en-IN')}`,
    'Prepared For: Commercial Bank Credit Department / District Industries Centre (DIC)',
    '================================================================================',
    '',
    'SECTION 1: ENTERPRISE & PROMOTER PROFILE',
    `• Proposed Enterprise: ${dossier.enterpriseName}`,
    `• Industrial Sector: ${dossier.enterpriseCategory}`,
    `• Location: ${dossier.location.district}, ${dossier.location.state} (${dossier.location.locationType.toUpperCase()})`,
    '',
    'SECTION 2: CAPITAL STRUCTURE & PROMOTER MARGIN COMPLIANCE',
    `• Total Project Cost: ₹${dossier.totalProjectCost.toLocaleString('en-IN')}`,
    `  - Fixed Assets (CapEx): ₹${dossier.fixedAssetsCost.toLocaleString('en-IN')}`,
    `  - Working Capital Requirement: ₹${dossier.workingCapitalRequirement.toLocaleString('en-IN')}`,
    `• Proposed Promoter Equity: ₹${dossier.promoterContribution.toLocaleString('en-IN')} (${dossier.marginAssessment.actualMarginPercent}%)`,
    `• Mandatory Bank Margin Required: ₹${dossier.marginAssessment.requiredMarginAmount.toLocaleString('en-IN')} (${dossier.marginAssessment.requiredMarginPercent}%)`,
    `• Margin Compliance Status: ${dossier.marginAssessment.isCompliant ? 'COMPLIANT' : 'SHORTFALL DETECTED'}`,
    `• Margin Evaluation Note: ${dossier.marginAssessment.complianceNote}`,
    `• Governing Norm: ${dossier.marginAssessment.governingNorm}`,
    '',
    'SECTION 3: DEBT SERVICE & BANK REPAYMENT VIABILITY',
    `• Proposed Bank Term Loan: ₹${dossier.bankTermLoanRequired.toLocaleString('en-IN')}`,
    `• Monthly Net Operating Profit: ₹${dossier.monthlyNetProfit.toLocaleString('en-IN')}`,
    `• Debt Service Coverage Ratio (DSCR): ${dossier.debtServiceCoverageRatio !== null ? `${dossier.debtServiceCoverageRatio.toFixed(2)}x` : 'No Debt Required'}`,
    `• DSCR Comfort Band: ${dossier.dscrComfortBand.toUpperCase()}`,
    `• DSCR Credit Risk Analysis: ${dossier.dscrAnalysis}`,
    '',
    'SECTION 4: CREDIT GUARANTEE & COLLATERAL STRUCTURE',
    `• Applicable Guarantee Scheme: ${dossier.creditGuarantee.schemeName}`,
    `• Collateral-Free Eligible: ${dossier.creditGuarantee.isCollateralFreeEligible ? 'YES' : 'NO'}`,
    `• Maximum Guarantee Cover: ${dossier.creditGuarantee.maxEligibleCoveragePercent}%`,
    `• Benchmark Annual Guarantee Fee: ${dossier.creditGuarantee.guaranteeFeeBenchmark}`,
    `• Statutory Guarantee Basis: ${dossier.creditGuarantee.statutoryReference}`,
    `• Appraisal Condition: ${dossier.creditGuarantee.coverageCondition}`,
    '',
    'SECTION 5: MATCHED INSTITUTIONAL CREDIT FACILITIES',
    ...dossier.matchedLoans.map((l, i) => [
      `  [Facility ${i + 1}] ${l.product.name} (${l.product.lenderType.toUpperCase()})`,
      `  - Sanction Amount: ₹${l.suggestedLoanAmount.toLocaleString('en-IN')}`,
      `  - Indicative Interest Spread: ${l.interestRateRange}`,
      `  - Estimated Monthly EMI: ₹${l.estimatedMonthlyEmi.toLocaleString('en-IN')} / mo`,
      `  - Maximum Tenure / Moratorium: ${l.indicativeTenureMonths} months (${l.moratoriumMonths} months moratorium)`,
      `  - Appraisal Fit: ${l.fitRationale}`,
      ''
    ]).flat(),
    'SECTION 6: STATUTORY PRE-SANCTION & DISBURSEMENT CLEARANCES',
    ...dossier.statutoryClearances.map((c, i) => [
      `  ${i + 1}. [${c.stage.toUpperCase()}] ${c.name}`,
      `     Authority: ${c.authority} | Mandatory: ${c.mandatory ? 'YES' : 'CONDITIONAL'}`,
      `     Legal Citation: ${c.citation}`,
      `     Note: ${c.applicabilityNote}`
    ]).flat(),
    '',
    'SECTION 7: PHASED CAPITAL DRAWDOWN & DISBURSEMENT MILESTONES',
    ...dossier.disbursementMilestones.map((m) => [
      `  Stage ${m.stageNumber}: ${m.milestoneName}`,
      `  - Tranche Amount: ₹${m.estimatedTrancheAmount.toLocaleString('en-IN')}`,
      `  - Cost Sharing: ${m.promoterEquitySharePercent}% Promoter Equity / ${m.termLoanSharePercent}% Bank Term Loan`,
      `  - Scope: ${m.description}`,
      `  - Pre-Requisite Verification: ${m.verificationRequired}`,
      ''
    ]).flat(),
    'SECTION 8: BANK BRANCH DUE DILIGENCE & INTERVIEW Q&A PREPARATION',
    ...dossier.interviewPrompts.map((p, i) => [
      `  Q${i + 1} (${p.topic}): "${p.question}"`,
      `  Appraisal Context: ${p.riskMitigationContext}`,
      `  Recommended Evidence/Response: ${p.recommendedResponse}`,
      ''
    ]).flat(),
    '================================================================================',
    'STATUTORY REGULATORY DISCLAIMER',
    dossier.statutoryDisclaimer,
    '================================================================================'
  ];

  return lines.join('\n');
}

/**
 * 10. Printable HTML Banker's Dossier Export
 */
export function generateBankDossierHtml(dossier: BankAppraisalDossier): string {
  const plainText = generateBankDossierPlainText(dossier);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bank Credit Appraisal Dossier — ${dossier.enterpriseName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1c1917; padding: 32px; max-width: 900px; margin: 0 auto; background: #fafaf9; }
    h1 { font-size: 20px; font-weight: 800; border-bottom: 2px solid #059669; padding-bottom: 8px; color: #064e3b; margin-top: 0; }
    h2 { font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #292524; border-bottom: 1px solid #e7e5e4; padding-bottom: 4px; }
    p, li { font-size: 13px; color: #44403c; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .metric-card { background: #ffffff; border: 1px solid #e7e5e4; padding: 12px; border-radius: 8px; }
    .metric-label { font-size: 11px; color: #78716c; text-transform: uppercase; font-weight: 600; }
    .metric-value { font-size: 16px; font-weight: 800; color: #1c1917; margin-top: 4px; }
    .table-container { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    .table-container th, .table-container td { border: 1px solid #e7e5e4; padding: 8px 10px; text-align: left; }
    .table-container th { background: #f5f5f4; font-weight: 700; }
    .disclaimer-box { margin-top: 32px; padding: 16px; background: #f5f5f4; border-left: 4px solid #78716c; font-size: 11px; color: #57534e; }
    @media print { body { background: #ffffff; padding: 0; } }
  </style>
</head>
<body>
  <h1>BANK CREDIT APPRAISAL & DESK REVIEW DOSSIER</h1>
  <p><strong>Enterprise:</strong> ${dossier.enterpriseName} | <strong>Location:</strong> ${dossier.location.district}, ${dossier.location.state} | <strong>Date:</strong> ${new Date(dossier.generatedAt).toLocaleDateString('en-IN')}</p>
  
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-label">Total Outlay</div>
      <div class="metric-value">₹${dossier.totalProjectCost.toLocaleString('en-IN')}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Bank Term Loan</div>
      <div class="metric-value">₹${dossier.bankTermLoanRequired.toLocaleString('en-IN')}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">DSCR Coverage</div>
      <div class="metric-value">${dossier.debtServiceCoverageRatio !== null ? `${dossier.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}</div>
    </div>
  </div>

  <h2>1. Capital Structure & Promoter Margin Compliance</h2>
  <p>
    <strong>Actual Promoter Equity:</strong> ₹${dossier.promoterContribution.toLocaleString('en-IN')} (${dossier.marginAssessment.actualMarginPercent}%)<br/>
    <strong>Mandatory Benchmark:</strong> ₹${dossier.marginAssessment.requiredMarginAmount.toLocaleString('en-IN')} (${dossier.marginAssessment.requiredMarginPercent}%)<br/>
    <strong>Status:</strong> <span class="badge ${dossier.marginAssessment.isCompliant ? 'badge-green' : 'badge-red'}">${dossier.marginAssessment.isCompliant ? 'Compliant' : 'Shortfall'}</span><br/>
    ${dossier.marginAssessment.complianceNote}
  </p>

  <h2>2. Credit Guarantee Cover (Collateral-Free Facility)</h2>
  <p>
    <strong>Guarantee Scheme:</strong> ${dossier.creditGuarantee.schemeName}<br/>
    <strong>Collateral-Free Status:</strong> ${dossier.creditGuarantee.isCollateralFreeEligible ? 'Eligible' : 'Ineligible'}<br/>
    <strong>Statutory Authority:</strong> ${dossier.creditGuarantee.statutoryReference}<br/>
    ${dossier.creditGuarantee.coverageCondition}
  </p>

  <h2>3. Phased Capital Drawdown Milestones</h2>
  <table class="table-container">
    <thead>
      <tr>
        <th>Stage</th>
        <th>Milestone</th>
        <th>Tranche Amount</th>
        <th>Promoter %</th>
        <th>Bank %</th>
        <th>Verification Required</th>
      </tr>
    </thead>
    <tbody>
      ${dossier.disbursementMilestones.map((m) => `
        <tr>
          <td><strong>Stage ${m.stageNumber}</strong></td>
          <td>${m.milestoneName}</td>
          <td>₹${m.estimatedTrancheAmount.toLocaleString('en-IN')}</td>
          <td>${m.promoterEquitySharePercent}%</td>
          <td>${m.termLoanSharePercent}%</td>
          <td>${m.verificationRequired}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>4. Full Appraisal Transcript</h2>
  <pre style="background:#ffffff; border:1px solid #e7e5e4; padding:12px; font-size:11px; white-space:pre-wrap; font-family:monospace;">${plainText}</pre>

  <div class="disclaimer-box">
    <strong>STATUTORY REGULATORY DISCLAIMER:</strong><br/>
    ${dossier.statutoryDisclaimer}
  </div>
</body>
</html>`;
}
