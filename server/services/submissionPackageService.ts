/**
 * Phase 15: Submission Package Service
 * 
 * Strict architectural rules:
 * - Pure assembly service over existing audited Phases 3 to 14.
 * - Zero recalculation of financial metrics or scheme eligibility.
 * - Multi-tenant security with session bearer token verification.
 * - Ownership isolation: User B cannot access or modify User A's submission packages.
 * - Mass assignment prevention: User updates can ONLY modify user input fields.
 * - Full guest mode support.
 */

import type {
  SubmissionPackage,
  SubmissionPackageUserInputs,
  GenerateSubmissionPackageParams
} from '../../src/types/submissionPackage.ts';
import { generateSubmissionPackage } from '../../src/utils/submissionPackageGenerator.ts';
import {
  generateSubmissionPackageText,
  generateSubmissionPackageHtml
} from '../../src/utils/exportSubmissionPackage.ts';

export class SubmissionPackageService {
  private packagesStore: Map<string, SubmissionPackage> = new Map();
  // Map of packageId -> ownerUserId (undefined if guest)
  private packageOwners: Map<string, string | undefined> = new Map();
  // Map of planId -> packageId[]
  private planPackagesMap: Map<string, string[]> = new Map();

  /**
   * Resets in-memory state (useful for test runs)
   */
  public reset(): void {
    this.packagesStore.clear();
    this.packageOwners.clear();
    this.planPackagesMap.clear();
  }

  /**
   * Generates a new submission package for a plan and persists it.
   */
  public generate(
    params: GenerateSubmissionPackageParams,
    userId?: string
  ): SubmissionPackage {
    if (!params.planId || typeof params.planId !== 'string' || params.planId.trim().length === 0) {
      throw new Error('Invalid planId: planId is mandatory.');
    }
    if (!params.business || !params.business.id || !params.business.name) {
      throw new Error('Invalid business details: business id and name are mandatory.');
    }

    const pkg = generateSubmissionPackage(params);
    const packageId = pkg.metadata.packageId;

    this.packagesStore.set(packageId, pkg);
    this.packageOwners.set(packageId, userId);

    const existingList = this.planPackagesMap.get(params.planId) || [];
    existingList.push(packageId);
    this.planPackagesMap.set(params.planId, existingList);

    return pkg;
  }

  /**
   * Retrieves a package by ID with strict ownership validation.
   */
  public getById(packageId: string, userId?: string): SubmissionPackage {
    const pkg = this.packagesStore.get(packageId);
    if (!pkg) {
      throw new Error(`Submission package '${packageId}' not found.`);
    }

    this.verifyOwnership(packageId, userId);
    return pkg;
  }

  /**
   * Retrieves all packages associated with a plan.
   */
  public getByPlanId(planId: string, userId?: string): SubmissionPackage[] {
    const packageIds = this.planPackagesMap.get(planId) || [];
    const results: SubmissionPackage[] = [];

    for (const pkgId of packageIds) {
      const pkg = this.packagesStore.get(pkgId);
      if (pkg) {
        const owner = this.packageOwners.get(pkgId);
        // If owner is set and differs from userId, do not disclose
        if (owner && userId && owner !== userId) {
          continue;
        }
        results.push(pkg);
      }
    }

    return results;
  }

  /**
   * Updates only permitted user input fields.
   * Strictly prevents mass-assignment overwriting of:
   * - packageId
   * - ownerId
   * - financialSummary
   * - completeness
   * - disclaimers
   * - source provenance
   */
  public updateUserInputs(
    packageId: string,
    inputs: SubmissionPackageUserInputs,
    userId?: string
  ): SubmissionPackage {
    const pkg = this.getById(packageId, userId);

    // Sanitize and isolate allowed user input strings
    const sanitizedInputs: SubmissionPackageUserInputs = {
      applicantStatement: typeof inputs.applicantStatement === 'string'
        ? inputs.applicantStatement.trim().substring(0, 2000)
        : pkg.userInputs.applicantStatement,
      businessDescription: typeof inputs.businessDescription === 'string'
        ? inputs.businessDescription.trim().substring(0, 2000)
        : pkg.userInputs.businessDescription,
      coverNote: typeof inputs.coverNote === 'string'
        ? inputs.coverNote.trim().substring(0, 2000)
        : pkg.userInputs.coverNote,
      targetInstitutionName: typeof inputs.targetInstitutionName === 'string'
        ? inputs.targetInstitutionName.trim().substring(0, 150)
        : pkg.userInputs.targetInstitutionName,
      targetBranchName: typeof inputs.targetBranchName === 'string'
        ? inputs.targetBranchName.trim().substring(0, 150)
        : pkg.userInputs.targetBranchName,
      institutionalContactPerson: typeof inputs.institutionalContactPerson === 'string'
        ? inputs.institutionalContactPerson.trim().substring(0, 150)
        : pkg.userInputs.institutionalContactPerson,
      institutionalDesignation: typeof inputs.institutionalDesignation === 'string'
        ? inputs.institutionalDesignation.trim().substring(0, 150)
        : pkg.userInputs.institutionalDesignation,
      packageNotes: typeof inputs.packageNotes === 'string'
        ? inputs.packageNotes.trim().substring(0, 2000)
        : pkg.userInputs.packageNotes,
      submissionChecklistNotes: typeof inputs.submissionChecklistNotes === 'string'
        ? inputs.submissionChecklistNotes.trim().substring(0, 2000)
        : pkg.userInputs.submissionChecklistNotes
    };

    // Update package while preserving protected source data
    pkg.userInputs = sanitizedInputs;

    // Update cover page & sections where promoter input is displayed
    const coverSec = pkg.sections.find(s => s.id === 'sec_cover' || s.id === 'sec_gov_cover');
    if (coverSec && sanitizedInputs.coverNote) {
      coverSec.paragraphs[1] = sanitizedInputs.coverNote;
    }
    const promoterSec = pkg.sections.find(s => s.id === 'sec_promoter_info' || s.id === 'sec_gov_enterprise_profile');
    if (promoterSec && sanitizedInputs.applicantStatement) {
      promoterSec.paragraphs[1] = sanitizedInputs.applicantStatement;
    }

    this.packagesStore.set(packageId, pkg);
    return pkg;
  }

  /**
   * Deletes a package with ownership verification.
   */
  public delete(packageId: string, userId?: string): boolean {
    const pkg = this.packagesStore.get(packageId);
    if (!pkg) {
      return false;
    }

    this.verifyOwnership(packageId, userId);

    this.packagesStore.delete(packageId);
    this.packageOwners.delete(packageId);

    const planId = pkg.metadata.planId;
    const existing = this.planPackagesMap.get(planId);
    if (existing) {
      this.planPackagesMap.set(
        planId,
        existing.filter(id => id !== packageId)
      );
    }

    return true;
  }

  /**
   * Generates formatted plain text export.
   */
  public exportAsText(packageId: string, userId?: string): string {
    const pkg = this.getById(packageId, userId);
    return generateSubmissionPackageText(pkg);
  }

  /**
   * Generates formatted print-ready HTML export.
   */
  public exportAsHtml(packageId: string, userId?: string): string {
    const pkg = this.getById(packageId, userId);
    return generateSubmissionPackageHtml(pkg);
  }

  /**
   * Verifies that the requesting user owns the submission package.
   */
  private verifyOwnership(packageId: string, userId?: string): void {
    const owner = this.packageOwners.get(packageId);
    if (owner && userId && owner !== userId) {
      throw new Error('Forbidden: You do not have permission to access or modify this submission package.');
    }
    if (owner && !userId) {
      throw new Error('Forbidden: Authentication required to access this submission package.');
    }
  }
}

export const submissionPackageService = new SubmissionPackageService();
