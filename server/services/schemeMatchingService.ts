/**
 * Phase 7: Deterministic Government Scheme & Loan Matching Engine
 *
 * Ground rules:
 * 1. NO hidden scheme scores, no rankings, no composite ratings.
 * 2. NO AI-invented eligibility or fabricated financial limits.
 * 3. Transparent categorization:
 *    - 'eligible' (all documented conditions met)
 *    - 'potentially_eligible' (compatible, pending standard field verification)
 *    - 'needs_verification' (critical profile or documentation unknowns)
 *    - 'not_eligible' (one or more documented mandatory criteria fail)
 * 4. Missing user data is NEVER assumed as ineligible; it is marked 'needs_verification'.
 * 5. Consumes Phase 4 financial outputs (Project Cost, Available Capital, Financing Gap) without modification.
 */

import {
  GovernmentScheme,
  SchemeMatchingInput,
  SchemeMatchingResult,
  SchemeMatch,
  SchemeFinancialFit,
  SchemeEligibilityStatus
} from '../../src/types/scheme.ts';
import { GOVERNMENT_SCHEMES_DATASET } from '../../src/data/governmentSchemes.ts';
import { BUSINESS_TEMPLATES } from '../../src/data/businessTemplates.ts';

export class SchemeMatchingService {
  private schemes: GovernmentScheme[] = GOVERNMENT_SCHEMES_DATASET;

  /**
   * Evaluates all schemes against the user's business plan, capital gap, location, and entrepreneur profile.
   */
  public matchSchemes(input: SchemeMatchingInput): SchemeMatchingResult {
    // 1. Resolve business template details
    const business = BUSINESS_TEMPLATES.find((b) => b.id === input.businessId);
    const businessName = business?.name || input.businessId;
    const businessCategory = business?.category;

    const availableCapital = Math.max(0, input.availableCapital);
    const projectCost = Math.max(0, input.projectCost);
    // Ensure financing gap is consistent with project cost - capital
    const financingGap = input.financingGap !== undefined
      ? Math.max(0, input.financingGap)
      : Math.max(0, projectCost - availableCapital);

    const profile = input.entrepreneurProfile || {};
    const location = input.location;
    const stateName = location.state.trim();

    const matches: SchemeMatch[] = [];

    for (const scheme of this.schemes) {
      const match = this.evaluateSingleScheme({
        scheme,
        businessId: input.businessId,
        businessName,
        businessCategory,
        projectCost,
        availableCapital,
        financingGap,
        location,
        profile
      });

      matches.push(match);
    }

    // Partition into categories (No score ranking!)
    const eligible = matches.filter((m) => m.status === 'eligible');
    const potentiallyEligible = matches.filter((m) => m.status === 'potentially_eligible');
    const needsVerification = matches.filter((m) => m.status === 'needs_verification');
    const notEligible = matches.filter((m) => m.status === 'not_eligible');

    return {
      businessId: input.businessId,
      businessName,
      financingRequirement: {
        projectCost,
        availableCapital,
        financingGap
      },
      location: {
        state: stateName,
        district: location.district,
        ruralUrban: location.ruralUrban
      },
      entrepreneurProfile: profile,
      totalEvaluated: this.schemes.length,
      matches,
      categorized: {
        eligible,
        potentiallyEligible,
        needsVerification,
        notEligible
      },
      disclosure:
        'Government scheme information is provided for transparent guidance based on official government sources. Eligibility, credit appraisal, subsidy availability, and limits are determined exclusively by the respective implementing departments and financing banks. Please verify the latest operational terms on the official portal before applying.'
    };
  }

  /**
   * Evaluates a single scheme against the profile and financing constraints.
   */
  public evaluateSingleScheme(params: {
    scheme: GovernmentScheme;
    businessId: string;
    businessName: string;
    businessCategory?: string;
    projectCost: number;
    availableCapital: number;
    financingGap: number;
    location: SchemeMatchingInput['location'];
    profile: NonNullable<SchemeMatchingInput['entrepreneurProfile']>;
  }): SchemeMatch {
    const { scheme, businessId, businessName, businessCategory, projectCost, availableCapital, financingGap, location, profile } = params;

    const matchedConditions: string[] = [];
    const unmetConditions: string[] = [];
    const unknownConditions: string[] = [];
    const whyMatched: string[] = [];
    const whyNotMatched: string[] = [];
    const missingInformation: string[] = [];
    const verificationSteps: string[] = [];

    // -------------------------------------------------------------------------
    // 1. BUSINESS APPLICABILITY
    // -------------------------------------------------------------------------
    const isDirectlyApplicable =
      scheme.applicableBusinessIds.includes('all') ||
      scheme.applicableBusinessIds.includes(businessId);

    // Normalize category comparison
    const normCategory = (businessCategory || '').toLowerCase().replace(/[-_]/g, ' ');
    const isCategoryApplicable =
      Boolean(businessCategory) &&
      scheme.applicableBusinessCategories &&
      scheme.applicableBusinessCategories.some((cat) => {
        const normSchemeCat = cat.toLowerCase().replace(/[-_]/g, ' ');
        return (
          normSchemeCat === normCategory ||
          normSchemeCat.includes(normCategory) ||
          normCategory.includes(normSchemeCat) ||
          (normCategory.includes('agro') && (normSchemeCat.includes('agro') || normSchemeCat.includes('food') || normSchemeCat.includes('agriculture'))) ||
          (normCategory.includes('food') && normSchemeCat.includes('food')) ||
          (normCategory.includes('livestock') && (normSchemeCat.includes('animal') || normSchemeCat.includes('livestock')))
        );
      });

    if (isDirectlyApplicable || isCategoryApplicable) {
      matchedConditions.push(`Business activity (${businessName}) is compatible with scheme coverage.`);
      whyMatched.push(`Eligible for ${businessName} under ${scheme.applicableBusinessCategories?.join(' / ') || 'scheme'} guidelines.`);
    } else {
      unmetConditions.push(`Business activity (${businessName}) is not included under this scheme's target sectors.`);
      whyNotMatched.push(`This scheme targets ${scheme.applicableBusinessCategories?.join(', ') || 'other specific sectors'}, which does not include ${businessName}.`);
    }

    // -------------------------------------------------------------------------
    // 2. JURISDICTION / STATE APPLICABILITY
    // -------------------------------------------------------------------------
    if (scheme.level === 'central') {
      matchedConditions.push(`Central scheme accessible nationwide across ${location.state}.`);
      whyMatched.push(`Operates pan-India across all states and UTs.`);
    } else if (scheme.level === 'state') {
      if (scheme.state && location.state) {
        if (scheme.state.trim().toLowerCase() === location.state.trim().toLowerCase()) {
          matchedConditions.push(`State-specific initiative applicable in ${scheme.state}.`);
          whyMatched.push(`Location matches scheme operational jurisdiction in ${scheme.state}.`);
        } else {
          unmetConditions.push(`Scheme is restricted to residents of ${scheme.state} (selected location: ${location.state}).`);
          whyNotMatched.push(`Not applicable outside ${scheme.state}.`);
        }
      } else {
        unknownConditions.push(`State jurisdiction requires verification for location "${location.state}".`);
        missingInformation.push(`State confirmation`);
      }
    }

    // -------------------------------------------------------------------------
    // 3. RURAL / URBAN REQUIREMENT
    // -------------------------------------------------------------------------
    if (scheme.eligibility.ruralRequirement === true) {
      if (location.ruralUrban === 'rural') {
        matchedConditions.push(`Rural location requirement met (${location.ruralUrban}).`);
      } else if (location.ruralUrban === 'urban') {
        unmetConditions.push(`Scheme requires project to be located in a designated rural area.`);
        whyNotMatched.push(`Not eligible in urban locations.`);
      } else if (location.ruralUrban === 'semi_urban') {
        unknownConditions.push(`Semi-urban classification requires Gram Panchayat / Census Town verification with DIC.`);
        verificationSteps.push(`Verify whether project site falls under Gram Panchayat jurisdiction for rural status.`);
      } else {
        unknownConditions.push(`Rural/Urban designation not specified for site location.`);
        missingInformation.push(`Project site location type (Rural or Urban)`);
      }
    } else if (scheme.eligibility.urbanRequirement === true) {
      if (location.ruralUrban === 'urban') {
        matchedConditions.push(`Urban location requirement met.`);
      } else if (location.ruralUrban === 'rural') {
        unmetConditions.push(`Scheme requires project to be located in a notified urban municipal area.`);
        whyNotMatched.push(`Not eligible in rural locations.`);
      } else {
        unknownConditions.push(`Urban classification requires verification.`);
        missingInformation.push(`Project site location type (Rural or Urban)`);
      }
    }

    // -------------------------------------------------------------------------
    // 4. FINANCIAL FIT EVALUATION
    // -------------------------------------------------------------------------
    const financialFit = this.evaluateFinancialFit({
      scheme,
      projectCost,
      availableCapital,
      financingGap
    });

    if (financialFit.fitsDocumentedRange === true) {
      matchedConditions.push(financialFit.explanation);
      whyMatched.push(`Financing requirement (₹${financingGap.toLocaleString('en-IN')}) fits within documented scheme limits.`);
    } else if (financialFit.fitsDocumentedRange === false) {
      unmetConditions.push(financialFit.explanation);
      whyNotMatched.push(financialFit.explanation);
    } else {
      unknownConditions.push(financialFit.explanation);
      verificationSteps.push(`Confirm loan ceiling and credit appraisal guidelines with participating bank branch.`);
    }

    // -------------------------------------------------------------------------
    // 5. AGE CRITERIA
    // -------------------------------------------------------------------------
    const { minimumAge, maximumAge } = scheme.eligibility;
    if ((minimumAge !== null && minimumAge !== undefined) || (maximumAge !== null && maximumAge !== undefined)) {
      if (profile.age !== undefined && profile.age !== null) {
        let ageOk = true;
        if (minimumAge !== null && minimumAge !== undefined && profile.age < minimumAge) {
          ageOk = false;
          unmetConditions.push(`Applicant age (${profile.age} years) is below minimum required age of ${minimumAge} years.`);
          whyNotMatched.push(`Applicant must be at least ${minimumAge} years old.`);
        }
        if (maximumAge !== null && maximumAge !== undefined && profile.age > maximumAge) {
          ageOk = false;
          unmetConditions.push(`Applicant age (${profile.age} years) exceeds maximum eligible age of ${maximumAge} years.`);
          whyNotMatched.push(`Applicant age exceeds scheme limit of ${maximumAge} years.`);
        }
        if (ageOk) {
          matchedConditions.push(`Applicant age (${profile.age} years) satisfies scheme age criteria.`);
        }
      } else {
        unknownConditions.push(`Age eligibility (${minimumAge ? `min ${minimumAge} yrs` : ''}${maximumAge ? `, max ${maximumAge} yrs` : ''}) requires verification.`);
        missingInformation.push(`Applicant age (required to confirm age criteria)`);
      }
    }

    // -------------------------------------------------------------------------
    // 6. GENDER & SPECIAL BENEFICIARY RESTRICTIONS
    // -------------------------------------------------------------------------
    // Special check for Stand-Up India (SC / ST or Women)
    if (scheme.id === 'scheme_standup_india') {
      const isWoman = profile.isWomanEntrepreneur === true || profile.gender?.toLowerCase() === 'female';
      const isScSt = profile.socialCategory?.toLowerCase() === 'sc' || profile.socialCategory?.toLowerCase() === 'st';

      if (isWoman || isScSt) {
        matchedConditions.push(`Qualifies under Stand-Up India priority criteria (${isWoman ? 'Woman Entrepreneur' : 'SC/ST Entrepreneur'}).`);
        whyMatched.push(`Target beneficiary criteria satisfied (${isWoman ? 'Women-led enterprise' : 'SC/ST promoter'}).`);
      } else if (
        profile.gender !== undefined &&
        profile.gender !== null &&
        profile.socialCategory !== undefined &&
        profile.socialCategory !== null
      ) {
        unmetConditions.push(`Stand-Up India is exclusively reserved for Women or SC/ST entrepreneurs.`);
        whyNotMatched.push(`Applicant profile is not registered as SC, ST, or Woman entrepreneur.`);
      } else {
        unknownConditions.push(`Confirmation of Woman or SC/ST entrepreneur status required.`);
        missingInformation.push(`Gender / Social Category (to confirm Stand-Up India eligibility)`);
      }
    }

    // -------------------------------------------------------------------------
    // 7. BUSINESS STAGE (NEW VS EXISTING)
    // -------------------------------------------------------------------------
    if (scheme.eligibility.businessStage && scheme.eligibility.businessStage.length > 0) {
      const allowsNew = scheme.eligibility.businessStage.includes('new');
      const allowsExisting = scheme.eligibility.businessStage.includes('existing');

      if (profile.isNewBusiness === true) {
        if (allowsNew) {
          matchedConditions.push(`Eligible as a new / greenfield enterprise.`);
        } else {
          unmetConditions.push(`Scheme only supports existing operational units.`);
          whyNotMatched.push(`Not applicable for newly founded units.`);
        }
      } else if (profile.isExistingBusiness === true) {
        if (allowsExisting) {
          matchedConditions.push(`Eligible as an existing enterprise.`);
        } else {
          unmetConditions.push(`Scheme strictly supports new / greenfield enterprises; expansion is not eligible.`);
          whyNotMatched.push(`Not applicable for existing enterprise expansion.`);
        }
      } else {
        unknownConditions.push(`Business stage (new unit or existing expansion) needs confirmation.`);
        missingInformation.push(`Whether this is a new setup or expansion of an existing enterprise`);
      }
    }

    // -------------------------------------------------------------------------
    // 8. FARMER STATUS (IF MANDATED)
    // -------------------------------------------------------------------------
    if (scheme.eligibility.requiresFarmerStatus === true) {
      if (profile.isFarmer === true) {
        matchedConditions.push(`Farmer / Landholder status confirmed.`);
      } else if (profile.isFarmer === false) {
        unmetConditions.push(`Scheme requires applicant to be an active farmer / agricultural landholder.`);
        whyNotMatched.push(`Applicant is not registered as a farmer / cultivator.`);
      } else {
        unknownConditions.push(`Agricultural landholding / farmer status requires verification.`);
        missingInformation.push(`Farmer status / agricultural land ownership`);
      }
    }

    // -------------------------------------------------------------------------
    // 9. SCHEME-SPECIFIC DOCUMENT VERIFICATION REQUIREMENTS
    // -------------------------------------------------------------------------
    for (const condition of scheme.eligibility.otherConditions) {
      verificationSteps.push(condition);
    }

    if (scheme.verificationStatus === 'needs_verification') {
      unknownConditions.push(`Scheme guidelines are subject to periodic state/department notifications.`);
    }

    // -------------------------------------------------------------------------
    // 10. OVERALL ELIGIBILITY STATUS RESOLUTION
    // -------------------------------------------------------------------------
    let status: SchemeEligibilityStatus;
    let statusCategory: SchemeMatch['statusCategory'];

    if (unmetConditions.length > 0) {
      // Clear failure on documented mandatory conditions
      status = 'not_eligible';
      statusCategory = 'not_eligible';
    } else if (missingInformation.length > 0 || unknownConditions.length > 0) {
      // Missing info: check if critical
      if (unknownConditions.length > 2 || missingInformation.length >= 2) {
        status = 'needs_verification';
        statusCategory = 'needs_verification';
      } else {
        status = 'potentially_eligible';
        statusCategory = 'potentially_eligible';
      }
    } else {
      // All documented conditions met
      status = 'eligible';
      statusCategory = 'eligible';
    }

    return {
      scheme,
      status,
      statusCategory,
      matchedConditions,
      unmetConditions,
      unknownConditions,
      whyMatched,
      whyNotMatched,
      missingInformation,
      financialFit,
      requiredDocuments: scheme.requiredDocuments,
      verificationSteps,
      officialInformationUrl: scheme.officialInformationUrl,
      officialApplicationUrl: scheme.officialApplicationUrl,
      lastVerifiedDate: scheme.lastVerifiedDate
    };
  }

  /**
   * Deterministically evaluates financial fit against documented scheme limits.
   */
  private evaluateFinancialFit(params: {
    scheme: GovernmentScheme;
    projectCost: number;
    availableCapital: number;
    financingGap: number;
  }): SchemeFinancialFit {
    const { scheme, projectCost, availableCapital, financingGap } = params;
    const minLoan = scheme.financialSupport.minimumLoan;
    const maxLoan = scheme.financialSupport.maximumLoan;

    // If scheme limits are unknown or not documented
    if (minLoan === null && maxLoan === null) {
      return {
        projectCost,
        availableCapital,
        financingGap,
        documentedMinimumLoan: null,
        documentedMaximumLoan: null,
        fitsDocumentedRange: null,
        explanation: 'Scheme financial limits vary by district quota or project scale; requires bank verification.'
      };
    }

    // Check maximum ceiling
    if (maxLoan !== null && maxLoan !== undefined && financingGap > maxLoan) {
      return {
        projectCost,
        availableCapital,
        financingGap,
        documentedMinimumLoan: minLoan,
        documentedMaximumLoan: maxLoan,
        fitsDocumentedRange: false,
        explanation: `Financing gap (₹${financingGap.toLocaleString('en-IN')}) exceeds maximum documented scheme limit of ₹${maxLoan.toLocaleString('en-IN')}.`
      };
    }

    // Check minimum threshold (only if user actually needs financing)
    if (minLoan !== null && minLoan !== undefined && financingGap > 0 && financingGap < minLoan) {
      return {
        projectCost,
        availableCapital,
        financingGap,
        documentedMinimumLoan: minLoan,
        documentedMaximumLoan: maxLoan,
        fitsDocumentedRange: false,
        explanation: `Financing gap (₹${financingGap.toLocaleString('en-IN')}) is below documented scheme minimum loan threshold of ₹${minLoan.toLocaleString('en-IN')}.`
      };
    }

    // Fits documented range
    return {
      projectCost,
      availableCapital,
      financingGap,
      documentedMinimumLoan: minLoan,
      documentedMaximumLoan: maxLoan,
      fitsDocumentedRange: true,
      explanation: `Financing requirement (₹${financingGap.toLocaleString('en-IN')}) is within documented scheme limit (${minLoan ? `min ₹${minLoan.toLocaleString('en-IN')}` : ''}${maxLoan ? `, max ₹${maxLoan.toLocaleString('en-IN')}` : ''}).`
    };
  }
}

export const schemeMatchingService = new SchemeMatchingService();
