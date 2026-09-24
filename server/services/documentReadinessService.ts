/**
 * Phase 8: Document Readiness & Application Workflow Service
 *
 * Rules:
 * - Deterministic conversion of Phase 7 scheme documents into structured requirements.
 * - Zero invented documents; every document originates from scheme.requiredDocuments.
 * - Strict document ID validation to prevent client-side spoofing.
 * - Reuses Phase 4 financial metrics for DPR financial summary assistance without mutation.
 * - Zero composite scores or success probabilities.
 */

import { GOVERNMENT_SCHEMES_DATASET } from '../../src/data/governmentSchemes.ts';
import { GovernmentScheme, SchemeEligibilityStatus } from '../../src/types/scheme.ts';
import {
  DocumentCategory,
  DocumentRequirement,
  DocumentReadinessSummary,
  DprFinancialSummary,
  SchemeReadinessPlan,
  UserDocumentDeclaration
} from '../../src/types/documentReadiness.ts';

// In-memory store for user document readiness declarations
// Key: `${userId || 'guest'}_${schemeId}`
const readinessStore = new Map<string, Record<string, UserDocumentDeclaration>>();

export class DocumentReadinessService {
  private schemes: GovernmentScheme[] = GOVERNMENT_SCHEMES_DATASET;

  /**
   * Resolves a scheme by its unique identifier.
   */
  public getSchemeById(schemeId: string): GovernmentScheme | undefined {
    const normalized = schemeId.toLowerCase().trim();
    return this.schemes.find(
      (s) => s.id === schemeId ||
             s.id.toLowerCase() === normalized ||
             s.id === `scheme_${normalized}` ||
             s.code?.toLowerCase() === normalized ||
             s.shortName?.toLowerCase() === normalized
    );
  }

  /**
   * Infers document category based on authentic keywords in the documented requirement.
   */
  public inferCategory(docText: string): DocumentCategory {
    const text = docText.toLowerCase();

    if (
      text.includes('aadhaar') ||
      text.includes('pan card') ||
      text.includes('voter') ||
      text.includes('passport') ||
      text.includes('identity') ||
      text.includes('photograph')
    ) {
      return 'identity';
    }

    if (
      text.includes('project report') ||
      text.includes('dpr') ||
      text.includes('feasibility') ||
      text.includes('proposal') ||
      text.includes('layout plan') ||
      text.includes('water testing') ||
      text.includes('soil testing')
    ) {
      return 'project';
    }

    if (
      text.includes('quotation') ||
      text.includes('bank statement') ||
      text.includes('financial statement') ||
      text.includes('net worth') ||
      text.includes('passbook') ||
      text.includes('sanction letter') ||
      text.includes('loan account') ||
      text.includes('cost breakup') ||
      text.includes('cheque')
    ) {
      return 'financial';
    }

    if (
      text.includes('land') ||
      text.includes('lease') ||
      text.includes('shed') ||
      text.includes('registry') ||
      text.includes('khatauni') ||
      text.includes('jamabandi') ||
      text.includes('fard') ||
      text.includes('possession') ||
      text.includes('pond site') ||
      text.includes('premises')
    ) {
      return 'property_location';
    }

    if (
      text.includes('caste') ||
      text.includes('domicile') ||
      text.includes('resident') ||
      text.includes('educational') ||
      text.includes('marksheet') ||
      text.includes('training certificate') ||
      text.includes('affidavit') ||
      text.includes('declaration') ||
      text.includes('farmer') ||
      text.includes('proof of woman') ||
      text.includes('non-defaulter') ||
      text.includes('adhivs')
    ) {
      return 'eligibility';
    }

    if (
      text.includes('udyam') ||
      text.includes('registration certificate') ||
      text.includes('incorporation') ||
      text.includes('partnership deed') ||
      text.includes('articles of association') ||
      text.includes('madhukranti') ||
      text.includes('fpo')
    ) {
      return 'business';
    }

    return 'other';
  }

  /**
   * Generates practical preparation guidance and notes for a document.
   */
  public generatePreparationGuidance(category: DocumentCategory, docText: string, schemeName: string): {
    reason: string;
    verificationNote: string;
    preparationSteps: string[];
  } {
    const text = docText.toLowerCase();

    if (category === 'project') {
      return {
        reason: `Required to evaluate technical feasibility, commercial viability, and bank credit assessment under ${schemeName}.`,
        verificationNote: 'Self-prepared report; verify specific DPR format and bank requirements with the implementing agency.',
        preparationSteps: [
          'Compile detailed list of machinery, civil works, and tools with supplier quotations.',
          'Include input raw material assumptions, monthly utilities, and operating labor expenses.',
          'Incorporate revenue projections and debt service repayment calculations from your financial plan.',
          'Ensure the project cost matches the amount requested in your loan/subsidy application.'
        ]
      };
    }

    if (category === 'identity') {
      return {
        reason: 'Mandatory KYC identification for applicant/promoters as per Government of India DBT guidelines.',
        verificationNote: 'Marked by you; ensure name, date of birth, and father/husband name match all documents identically.',
        preparationSteps: [
          'Ensure Aadhaar is linked with active mobile number for portal OTP verification.',
          'Keep clear, self-attested color photocopies and original cards ready for inspection.',
          'Check that PAN card details match Aadhaar records.'
        ]
      };
    }

    if (category === 'financial') {
      return {
        reason: `Mandatory for bank appraisal, machinery cost validation, and subsidy computation under ${schemeName}.`,
        verificationNote: 'Issued by commercial bank or equipment vendor; verify validity period of quotations.',
        preparationSteps: [
          'Obtain formal commercial quotations with GST numbers from authorized machinery/asset vendors.',
          'Request bank account statement for the past 6 months stamped by the home branch.',
          'Ensure quotations contain detailed equipment specifications and delivery/installation charges.'
        ]
      };
    }

    if (category === 'property_location') {
      return {
        reason: 'Verification that the proposed enterprise has verifiable, unencumbered site possession with water/power access.',
        verificationNote: 'Revenue record or legal agreement; verify registration status and lease tenure.',
        preparationSteps: [
          'If self-owned: obtain latest certified copy of land record (e.g. Khatauni, Jamabandi, Registry).',
          'If rented/leased: execute registered lease agreement for required minimum duration (typically 5 to 10 years).',
          'Obtain site possession certificate or electricity bill showing premises address.'
        ]
      };
    }

    if (category === 'eligibility') {
      return {
        reason: `Establishes entitlement for age, category, domicile, or special subsidy slab under ${schemeName}.`,
        verificationNote: 'Government-issued certificate; verify digital validity and barcode/QR verification.',
        preparationSteps: [
          text.includes('caste')
            ? 'Ensure caste/community certificate is issued by designated revenue officer (SDM/Tehsildar).'
            : text.includes('domicile') || text.includes('resident')
            ? 'Ensure domicile/residence certificate is digitally verified on state e-district portal.'
            : 'Keep original educational marksheet/certificate ready to confirm age and qualification eligibility.'
        ]
      };
    }

    if (category === 'business') {
      return {
        reason: 'Formal legal recognition of enterprise entity under MSME / Ministry guidelines.',
        verificationNote: 'Portal registration; download latest digital certificate from official portal.',
        preparationSteps: [
          'Complete free online registration on Udyam Portal (udyamregistration.gov.in) if not already registered.',
          'Keep entity constitution documents (partnership deed, FPO bylaws, certificate of incorporation) organized.'
        ]
      };
    }

    return {
      reason: `Document required per official operational guidelines of ${schemeName}.`,
      verificationNote: 'Verify exact compliance format with the district implementing authority.',
      preparationSteps: [
        'Check specific format requirements published on the official scheme portal.',
        'Consult District Industries Centre (DIC) or nodal department office if clarity is needed.'
      ]
    };
  }

  /**
   * Builds structured DocumentRequirement objects strictly from the scheme's documented requirements.
   */
  public getDocumentRequirements(
    schemeOrId: GovernmentScheme | string,
    userDeclarations: Record<string, UserDocumentDeclaration> = {}
  ): DocumentRequirement[] {
    const scheme = typeof schemeOrId === 'string' ? this.getSchemeById(schemeOrId) : schemeOrId;
    if (!scheme) return [];

    return scheme.requiredDocuments.map((docText, index) => {
      const id = `${scheme.id}_doc_${index}`;
      const category = this.inferCategory(docText);
      const isConditional =
        docText.toLowerCase().includes('if applicable') ||
        docText.toLowerCase().includes('where applicable') ||
        docText.toLowerCase().includes('if debt financed') ||
        docText.toLowerCase().includes('if existing') ||
        docText.toLowerCase().includes('if claiming');

      const initialStatus = isConditional ? 'conditional' : 'required';
      const declaredStatus = userDeclarations[id];
      const userStatus = declaredStatus || initialStatus;

      const guidance = this.generatePreparationGuidance(category, docText, scheme.name);

      return {
        id,
        schemeId: scheme.id,
        name: docText,
        category,
        initialStatus,
        userStatus,
        mandatory: !isConditional,
        reason: guidance.reason,
        schemeSpecific:
          docText.includes('RIICO') ||
          docText.includes('Madhukranti') ||
          docText.includes('MIDH') ||
          docText.includes('KVIC') ||
          docText.includes('DIC') ||
          docText.includes('Fard') ||
          docText.includes('Jamabandi') ||
          docText.includes('Adhivs') ||
          docText.includes('Niwas'),
        officialSource: scheme.officialInformationUrl,
        verificationNote: guidance.verificationNote,
        preparationSteps: guidance.preparationSteps
      };
    });
  }

  /**
   * Calculates readiness summary counts without arbitrary scores or approval probabilities.
   */
  public calculateSummary(documents: DocumentRequirement[]): DocumentReadinessSummary {
    let markedAvailable = 0;
    let needToPrepare = 0;
    let needVerification = 0;

    for (const doc of documents) {
      if (doc.userStatus === 'available') {
        markedAvailable++;
      } else if (doc.userStatus === 'to_prepare' || doc.userStatus === 'missing') {
        needToPrepare++;
      } else {
        needVerification++;
      }
    }

    return {
      totalRequired: documents.length,
      markedAvailable,
      needToPrepare,
      needVerification
    };
  }

  /**
   * Formats Phase 4 financial metrics into an actionable project report / DPR summary.
   */
  public generateDprSummary(params: {
    businessName: string;
    businessCategory?: string;
    projectCost: number;
    availableCapital: number;
    financingGap: number;
    fixedAssets?: number;
    workingCapital?: number;
    monthlyRevenue?: number;
    monthlyOpex?: number;
    monthlyNetProfit?: number;
    estimatedEmi?: number;
    dscr?: number;
    repaymentMonths?: number;
  }): DprFinancialSummary {
    const {
      businessName,
      businessCategory,
      projectCost,
      availableCapital,
      financingGap,
      fixedAssets,
      workingCapital,
      monthlyRevenue,
      monthlyOpex,
      monthlyNetProfit,
      estimatedEmi,
      dscr,
      repaymentMonths = 60
    } = params;

    const formattedText = [
      `=============================================================`,
      `DETAILED PROJECT REPORT (DPR) — FINANCIAL ESTIMATES SUMMARY`,
      `GramUdyam Rural Enterprise Planning Engine`,
      `=============================================================`,
      `Enterprise: ${businessName}${businessCategory ? ` (${businessCategory})` : ''}`,
      `Date Generated: ${new Date().toISOString().split('T')[0]}`,
      ``,
      `1. CAPITAL EXPENDITURE & FINANCING STRUCTURE`,
      `-------------------------------------------------------------`,
      `• Total Project Outlay (A + B) : ₹${projectCost.toLocaleString('en-IN')}`,
      `  - Fixed Capital Assets (Machinery & Shed) : ₹${(fixedAssets ?? Math.round(projectCost * 0.75)).toLocaleString('en-IN')}`,
      `  - Working Capital Margin (1-3 Mo)         : ₹${(workingCapital ?? Math.round(projectCost * 0.25)).toLocaleString('en-IN')}`,
      `• Promoter Equity / Available Capital       : ₹${availableCapital.toLocaleString('en-IN')} (${((availableCapital / (projectCost || 1)) * 100).toFixed(1)}%)`,
      `• Bank Term Loan / Financing Gap Required   : ₹${financingGap.toLocaleString('en-IN')} (${((financingGap / (projectCost || 1)) * 100).toFixed(1)}%)`,
      ``,
      `2. ESTIMATED OPERATING ECONOMICS (MONTHLY BASELINE)`,
      `-------------------------------------------------------------`,
      `• Projected Gross Monthly Revenue : ₹${(monthlyRevenue ?? 0).toLocaleString('en-IN')}`,
      `• Projected Monthly Operating Exp : ₹${(monthlyOpex ?? 0).toLocaleString('en-IN')}`,
      `• Projected Net Operating Margin  : ₹${(monthlyNetProfit ?? 0).toLocaleString('en-IN')}`,
      ``,
      `3. DEBT SERVICING & VIABILITY INDICATORS`,
      `-------------------------------------------------------------`,
      `• Estimated Monthly EMI (Indicative) : ₹${(estimatedEmi ?? 0).toLocaleString('en-IN')}`,
      `• Projected Debt Service Coverage (DSCR) : ${dscr !== undefined && dscr !== null ? dscr.toFixed(2) : 'N/A (Full Equity)'}`,
      `• Proposed Repayment Tenure : ${repaymentMonths} Months (${Math.round(repaymentMonths / 12)} Years)`,
      ``,
      `=============================================================`,
      `NOTICE: Figures represent planning estimates based on standard rural`,
      `cost benchmarks. Final DPR formatting, interest rates, and loan sanction`,
      `are subject to appraisal by the designated lending bank branch.`,
      `=============================================================`
    ].join('\n');

    return {
      businessName,
      businessCategory,
      totalProjectCost: projectCost,
      availableCapital,
      financingGap,
      fixedAssetsEstimate: fixedAssets,
      workingCapitalEstimate: workingCapital,
      monthlyRevenueEstimate: monthlyRevenue,
      monthlyOpexEstimate: monthlyOpex,
      monthlyNetProfitEstimate: monthlyNetProfit,
      estimatedEmi,
      dscr,
      repaymentPeriodMonths: repaymentMonths,
      formattedText
    };
  }

  /**
   * Assembles a complete, auditable SchemeReadinessPlan.
   */
  public getSchemeReadinessPlan(params: {
    schemeId: string;
    eligibilityStatus?: SchemeEligibilityStatus;
    userDeclarations?: Record<string, UserDocumentDeclaration>;
    financialPlan?: {
      businessName: string;
      businessCategory?: string;
      projectCost: number;
      availableCapital: number;
      financingGap: number;
      fixedAssets?: number;
      workingCapital?: number;
      monthlyRevenue?: number;
      monthlyOpex?: number;
      monthlyNetProfit?: number;
      estimatedEmi?: number;
      dscr?: number;
    };
  }): SchemeReadinessPlan {
    const scheme = this.getSchemeById(params.schemeId);
    if (!scheme) {
      throw new Error(`Scheme with ID '${params.schemeId}' not found.`);
    }

    const documents = this.getDocumentRequirements(scheme, params.userDeclarations);
    const summary = this.calculateSummary(documents);

    const dprFinancialSummary = params.financialPlan
      ? this.generateDprSummary(params.financialPlan)
      : undefined;

    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      shortName: scheme.shortName,
      administeringAuthority: scheme.administeringAuthority,
      ministry: scheme.ministry,
      level: scheme.level,
      state: scheme.state,
      eligibilityStatus: params.eligibilityStatus || 'needs_verification',
      documents,
      userDeclarations: params.userDeclarations || {},
      summary,
      applicationSteps: scheme.applicationProcess,
      officialInformationUrl: scheme.officialInformationUrl,
      officialApplicationUrl: scheme.officialApplicationUrl,
      dprFinancialSummary,
      lastUpdated: new Date().toISOString(),
      disclaimer:
        'This readiness checklist is an organizational preparation tool for your records. It does NOT constitute official document verification, KYC clearance, loan sanction, or government subsidy guarantee. Final document acceptance is determined exclusively by the respective department or financing bank.'
    };
  }

  /**
   * Validates document declarations against the scheme's authentic documents.
   * Rejects arbitrary or non-existent document IDs.
   */
  public validateDeclarations(
    schemeId: string,
    declarations: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const scheme = this.getSchemeById(schemeId);
    const errors: string[] = [];

    if (!scheme) {
      errors.push(`Scheme with ID '${schemeId}' does not exist.`);
      return { valid: false, errors };
    }

    if (typeof declarations !== 'object' || declarations === null) {
      errors.push('Declarations must be a valid key-value object.');
      return { valid: false, errors };
    }

    const validDocIds = new Set(
      scheme.requiredDocuments.map((_, i) => `${scheme.id}_doc_${i}`)
    );

    const allowedStatuses: UserDocumentDeclaration[] = ['available', 'to_prepare', 'needs_verification'];

    for (const [docId, status] of Object.entries(declarations)) {
      if (!validDocIds.has(docId)) {
        errors.push(`Document ID '${docId}' does not belong to scheme '${schemeId}'.`);
      }
      if (!allowedStatuses.includes(status as UserDocumentDeclaration)) {
        errors.push(`Invalid status '${status}' for document '${docId}'. Allowed: ${allowedStatuses.join(', ')}.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Persists readiness declarations in the store.
   */
  public saveReadiness(
    userId: string | undefined,
    schemeId: string,
    declarations: Record<string, UserDocumentDeclaration>
  ): DocumentReadinessSummary {
    const validation = this.validateDeclarations(schemeId, declarations);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join('; ')}`);
    }

    const key = `${userId || 'guest'}_${schemeId}`;
    readinessStore.set(key, declarations);

    const scheme = this.getSchemeById(schemeId)!;
    const documents = this.getDocumentRequirements(scheme, declarations);
    return this.calculateSummary(documents);
  }

  /**
   * Retrieves saved declarations for a user/guest and scheme.
   */
  public getSavedDeclarations(
    userId: string | undefined,
    schemeId: string
  ): Record<string, UserDocumentDeclaration> {
    const key = `${userId || 'guest'}_${schemeId}`;
    return readinessStore.get(key) || {};
  }
}

export const documentReadinessService = new DocumentReadinessService();
