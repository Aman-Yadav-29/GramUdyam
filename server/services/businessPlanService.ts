/**
 * Phase 9: Business Plan Service
 * 
 * Central orchestration service for Business & Financing Plan generation,
 * retrieval, and persistence.
 * 
 * Strict architectural rules:
 * - Sourced directly from Phases 3-8 without financial recalculation.
 * - Server-side authorization: users cannot access or mutate plans belonging to other users.
 * - Narrative fields are user-editable; calculated financial values are immutable.
 * - Guest mode fully supported.
 */

import crypto from 'crypto';
import { BusinessPlan, SavedBusinessPlanRecord, BusinessPlanNarrativeSection } from '../../src/types/businessPlan.ts';
import { assembleBusinessPlan, AssembleBusinessPlanParams } from '../../src/utils/businessPlanGenerator.ts';

export class BusinessPlanService {
  private savedPlans: Map<string, SavedBusinessPlanRecord> = new Map();

  /**
   * Assembles a consolidated BusinessPlan from Phase 3-8 parameters.
   */
  public generatePlan(params: AssembleBusinessPlanParams): BusinessPlan {
    return assembleBusinessPlan(params);
  }

  /**
   * Persists a business plan with server-side ownership.
   */
  public savePlan(
    userId: string | undefined,
    isGuest: boolean,
    plan: BusinessPlan,
    title?: string
  ): SavedBusinessPlanRecord {
    if (!plan || !plan.id) {
      throw new Error('Invalid plan: Plan must have a valid identifier and payload.');
    }

    const now = new Date().toISOString();
    const existing = this.savedPlans.get(plan.id);

    // If existing, enforce ownership
    if (existing) {
      if (existing.userId && existing.userId !== userId) {
        throw new Error('Forbidden: You do not have permission to update this business plan.');
      }
    }

    const cleanTitle = (typeof title === 'string' && title.trim().length > 0)
      ? title.trim().substring(0, 120)
      : existing?.title || `${plan.business.businessName} — ₹${plan.financials.availableCapital.toLocaleString('en-IN')} Capital`;

    const record: SavedBusinessPlanRecord = {
      id: plan.id,
      userId: isGuest ? undefined : userId,
      isGuest,
      title: cleanTitle,
      status: existing?.status || 'active',
      planVersion: plan.version || '1.0.0',
      narrativeEditable: true,
      shareSettings: existing?.shareSettings || { isShared: false },
      businessId: plan.business.businessId,
      businessName: plan.business.businessName,
      projectCost: plan.financials.totalProjectCost,
      availableCapital: plan.financials.availableCapital,
      financingGap: plan.financials.financingGap,
      state: plan.location?.state || '',
      district: plan.location?.district || '',
      plan,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    };

    this.savedPlans.set(plan.id, record);
    return record;
  }

  /**
   * Retrieves a business plan by ID, enforcing user authorization.
   */
  public getPlanById(planId: string, userId: string | undefined, isGuest: boolean): SavedBusinessPlanRecord {
    const record = this.savedPlans.get(planId);
    if (!record) {
      throw new Error(`Business plan with ID '${planId}' not found.`);
    }

    // Authorization check: if plan belongs to an authenticated user, only that user may view it
    if (!record.isGuest && record.userId && record.userId !== userId) {
      throw new Error('Forbidden: You do not have permission to access this business plan.');
    }

    return record;
  }

  /**
   * Retrieves all saved plans belonging to a given user.
   */
  public getUserPlans(userId: string, statusFilter?: 'all' | 'active' | 'archived'): SavedBusinessPlanRecord[] {
    if (!userId) return [];
    const plans = Array.from(this.savedPlans.values()).filter((r) => r.userId === userId);
    if (statusFilter && statusFilter !== 'all') {
      return plans.filter((p) => (p.status || 'active') === statusFilter);
    }
    return plans;
  }

  /**
   * Updates only the user-editable narrative fields of an existing plan.
   * Prohibits mutation of source-derived financial, location, or scheme values.
   */
  public updatePlanNarrative(
    planId: string,
    userId: string | undefined,
    narrative: BusinessPlanNarrativeSection,
    isGuest: boolean = false
  ): SavedBusinessPlanRecord {
    const record = this.getPlanById(planId, userId, isGuest);

    // Sanitize narrative updates (strings only, max length 1000, no code injection)
    const updatedNarrative: BusinessPlanNarrativeSection = {
      businessObjectives: typeof narrative.businessObjectives === 'string'
        ? narrative.businessObjectives.trim().substring(0, 1000)
        : record.plan.narrative?.businessObjectives,
      targetCustomersAndMarket: typeof narrative.targetCustomersAndMarket === 'string'
        ? narrative.targetCustomersAndMarket.trim().substring(0, 1000)
        : record.plan.narrative?.targetCustomersAndMarket,
      operationalNotes: typeof narrative.operationalNotes === 'string'
        ? narrative.operationalNotes.trim().substring(0, 1000)
        : record.plan.narrative?.operationalNotes,
      promoterRemarks: typeof narrative.promoterRemarks === 'string'
        ? narrative.promoterRemarks.trim().substring(0, 1000)
        : record.plan.narrative?.promoterRemarks,
      lastEditedAt: new Date().toISOString()
    };

    // Financial values in record.plan remain strictly untouched
    record.plan.narrative = updatedNarrative;
    record.updatedAt = new Date().toISOString();

    this.savedPlans.set(planId, record);
    return record;
  }

  /**
   * Updates plan status (active vs archived).
   */
  public updatePlanStatus(
    planId: string,
    userId: string | undefined,
    status: 'active' | 'archived',
    isGuest: boolean = false
  ): SavedBusinessPlanRecord {
    if (status !== 'active' && status !== 'archived') {
      throw new Error('Invalid status. Permitted values are active or archived.');
    }

    const record = this.getPlanById(planId, userId, isGuest);
    record.status = status;
    record.updatedAt = new Date().toISOString();

    this.savedPlans.set(planId, record);
    return record;
  }

  /**
   * Updates plan title.
   */
  public updatePlanTitle(
    planId: string,
    userId: string | undefined,
    title: string,
    isGuest: boolean = false
  ): SavedBusinessPlanRecord {
    if (typeof title !== 'string' || !title.trim()) {
      throw new Error('Title must be a non-empty string.');
    }

    const record = this.getPlanById(planId, userId, isGuest);
    record.title = title.trim().substring(0, 120);
    record.updatedAt = new Date().toISOString();

    this.savedPlans.set(planId, record);
    return record;
  }

  /**
   * Deletes a plan, verifying ownership.
   */
  public deletePlan(
    planId: string,
    userId: string | undefined,
    isGuest: boolean = false
  ): boolean {
    const record = this.getPlanById(planId, userId, isGuest);
    return this.savedPlans.delete(record.id);
  }

  /**
   * Creates or regenerates a cryptographically strong opaque share token.
   */
  public createShareToken(
    planId: string,
    userId: string | undefined,
    isGuest: boolean = false
  ): { shareToken: string; shareUrl: string } {
    const record = this.getPlanById(planId, userId, isGuest);

    // Generate 48-char cryptographically secure hex token
    const shareToken = crypto.randomBytes(24).toString('hex');
    const now = new Date().toISOString();

    record.shareSettings = {
      isShared: true,
      shareToken,
      sharedAt: now
    };
    record.updatedAt = now;

    this.savedPlans.set(planId, record);

    return {
      shareToken,
      shareUrl: `/share/plan/${shareToken}`
    };
  }

  /**
   * Revokes sharing for a plan.
   */
  public revokeShareToken(
    planId: string,
    userId: string | undefined,
    isGuest: boolean = false
  ): boolean {
    const record = this.getPlanById(planId, userId, isGuest);

    record.shareSettings = {
      isShared: false,
      shareToken: undefined,
      sharedAt: undefined
    };
    record.updatedAt = new Date().toISOString();

    this.savedPlans.set(planId, record);
    return true;
  }

  /**
   * Retrieves a shared plan publicly by opaque share token.
   * Strips out user credentials, user IDs, and private session attributes.
   */
  public getSharedPlan(shareToken: string): {
    title: string;
    createdAt: string;
    updatedAt: string;
    plan: BusinessPlan;
    shareToken: string;
  } {
    if (!shareToken || typeof shareToken !== 'string') {
      throw new Error('Invalid share token.');
    }

    let found: SavedBusinessPlanRecord | undefined;
    for (const record of this.savedPlans.values()) {
      if (record.shareSettings?.isShared === true && record.shareSettings.shareToken === shareToken) {
        found = record;
        break;
      }
    }

    if (!found) {
      throw new Error('Shared plan not found or share link has been revoked.');
    }

    // Return sanitized public snapshot (no userId, no passwords, no tokens)
    return {
      title: found.title || found.businessName,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
      plan: found.plan,
      shareToken
    };
  }

  /**
   * Formats the business plan as clean, printable / copyable text.
   */
  public formatPlanAsText(plan: BusinessPlan): string {
    const lines: string[] = [];
    lines.push('================================================================================');
    lines.push('                          GRAMUDYAM BUSINESS & FINANCING PLAN');
    lines.push('           Deterministic Rural & Semi-Urban Enterprise Planning Dossier');
    lines.push('================================================================================');
    lines.push(`Plan ID: ${plan.id} | Version: ${plan.version} | Generated: ${plan.generatedAt}`);
    lines.push('');
    lines.push('1. BUSINESS OVERVIEW');
    lines.push(`• Enterprise Name: ${plan.business.businessName}`);
    lines.push(`• Category: ${plan.business.businessCategory} (${plan.business.businessType})`);
    lines.push(`• Proposed Scale: ${plan.business.proposedScale}`);
    lines.push(`• Proposed Location: ${plan.business.selectedLocation}`);
    lines.push(`• Available Capital: ₹${plan.business.availableCapital.toLocaleString('en-IN')}`);
    lines.push(`• Primary Output: ${plan.business.primaryOutput}`);
    lines.push(`• Key Inputs: ${plan.business.primaryInputs.join(', ')}`);
    lines.push(`• Core Equipment: ${plan.business.majorEquipment.join(', ')}`);
    lines.push(`• Infrastructure: ${plan.business.infrastructureRequirements}`);
    lines.push('');
    if (plan.entrepreneur?.hasDeclaredDetails) {
      lines.push('2. ENTREPRENEUR PROFILE');
      if (plan.entrepreneur.age) lines.push(`• Age: ${plan.entrepreneur.age} years`);
      if (plan.entrepreneur.gender) lines.push(`• Gender: ${plan.entrepreneur.gender}`);
      if (plan.entrepreneur.socialCategory) lines.push(`• Category: ${plan.entrepreneur.socialCategory}`);
      if (plan.entrepreneur.isFarmer !== undefined) lines.push(`• Farmer / Agri Background: ${plan.entrepreneur.isFarmer ? 'Yes' : 'No'}`);
      if (plan.entrepreneur.isRural !== undefined) lines.push(`• Area: ${plan.entrepreneur.isRural ? 'Rural Area' : 'Urban Area'}`);
      lines.push('');
    }
    lines.push('3. PROPOSED LOCATION & CATCHMENT');
    lines.push(`• District & State: ${plan.location?.district}, ${plan.location?.state}`);
    lines.push(`• Area Type: ${plan.location?.locationType.toUpperCase()} | Resolution: ${plan.location?.resolution}`);
    lines.push(`• Market & Catchment: ${plan.location?.marketCatchmentInfo}`);
    lines.push(`• Power Availability: ${plan.location?.powerAvailabilityHours || 'Local benchmark'} hrs/day`);
    lines.push(`• Location Benchmark Disclosure: ${plan.location?.benchmarkDisclosure}`);
    lines.push('');
    if (plan.agricultureAnalysis?.applicable) {
      lines.push('4. AGRICULTURE LOCATION ANALYSIS');
      lines.push(`• Agricultural Activity: ${plan.agricultureAnalysis.businessKind}`);
      lines.push('• Supportive Factors (Why This Location May Suit):');
      plan.agricultureAnalysis.whyMaySuit.forEach((s) => lines.push(`  + ${s}`));
      if (plan.agricultureAnalysis.whyMayNotSuit.length > 0) {
        lines.push('• Concerns & Risk Factors (Why It May Not Suit / Requires Management):');
        plan.agricultureAnalysis.whyMayNotSuit.forEach((c) => lines.push(`  - ${c}`));
      }
      if (plan.agricultureAnalysis.unknownFactors.length > 0) {
        lines.push('• Unassessed Factors (Data Not Recorded):');
        plan.agricultureAnalysis.unknownFactors.forEach((u) => lines.push(`  ? ${u}`));
      }
      lines.push('• Priority Local Ground Verification Steps:');
      plan.agricultureAnalysis.priorityVerificationSteps.forEach((v, idx) => lines.push(`  ${idx + 1}. ${v}`));
      lines.push(`• Disclosure: ${plan.agricultureAnalysis.scoreDisclosure}`);
      lines.push('');
    }
    lines.push('5. PROJECT COST & CAPITAL ARCHITECTURE (PHASE 4 SOURCE OF TRUTH)');
    lines.push(`• Fixed Asset Investment (CapEx): ₹${plan.financials.fixedAssetsCost.toLocaleString('en-IN')}`);
    lines.push(`• Working Capital Requirement: ₹${plan.financials.workingCapitalRequirement.toLocaleString('en-IN')}`);
    lines.push(`• TOTAL PROJECT OUTLAY: ₹${plan.financials.totalProjectCost.toLocaleString('en-IN')}`);
    lines.push(`• Available Capital (Promoter Margin): ₹${plan.financials.availableCapital.toLocaleString('en-IN')}`);
    lines.push(`• FINANCING GAP: ₹${plan.financials.financingGap.toLocaleString('en-IN')}`);
    lines.push(`• Classification: ${plan.financials.affordabilityClassification}`);
    lines.push(`• Interpretation: ${plan.financials.plainLanguageInterpretation}`);
    lines.push('');
    lines.push('6. FINANCIAL OUTLOOK & OPERATIONAL FEASIBILITY');
    lines.push(`• Estimated Monthly Gross Revenue: ₹${(plan.financials.monthlyRevenue ?? 0).toLocaleString('en-IN')}`);
    lines.push(`• Estimated Monthly OPEX: ₹${Math.round(plan.financials.monthlyOpex ?? 0).toLocaleString('en-IN')}`);
    lines.push(`• Estimated Monthly Net Profit: ₹${(plan.financials.monthlyNetProfit ?? 0).toLocaleString('en-IN')}`);
    lines.push(`• Projected Year 1 Revenue: ₹${(plan.financials.annualRevenueYear1 ?? 0).toLocaleString('en-IN')}`);
    lines.push(`• Projected Year 1 Net Profit: ₹${(plan.financials.annualNetProfitYear1 ?? 0).toLocaleString('en-IN')}`);
    lines.push(`• Debt Service Coverage Ratio (DSCR): ${plan.financials.debtServiceCoverageRatio !== null && plan.financials.debtServiceCoverageRatio !== undefined ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'No debt required'}`);
    lines.push(`• Estimated Monthly Loan EMI: ${plan.financials.estimatedMonthlyEmi !== null && plan.financials.estimatedMonthlyEmi !== undefined ? `₹${plan.financials.estimatedMonthlyEmi.toLocaleString('en-IN')}` : '₹0'}`);
    lines.push(`• Break-Even Capacity: ${plan.financials.breakEvenCapacityPercent !== null && plan.financials.breakEvenCapacityPercent !== undefined ? `${plan.financials.breakEvenCapacityPercent.toFixed(1)}%` : 'N/A'}`);
    lines.push(`• Estimated Payback Period: ${plan.financials.paybackYears ?? 'N/A'} Years`);
    lines.push('');
    if (plan.scenarios && plan.scenarios.length > 0) {
      lines.push('7. SCENARIO SENSITIVITY ANALYSIS');
      plan.scenarios.forEach((sc) => {
        lines.push(`• [${sc.label}]: Rev: ₹${sc.monthlyRevenue.toLocaleString('en-IN')}/mo | OPEX: ₹${sc.monthlyOpex.toLocaleString('en-IN')}/mo | Net Profit: ₹${sc.monthlyNetProfit.toLocaleString('en-IN')}/mo`);
      });
      lines.push('');
    }
    lines.push('8. FINANCING PLAN & MATCHED SCHEMES');
    lines.push(`• ${plan.financing.formulaText}`);
    lines.push(`• Advisory Note: ${plan.financing.advisoryNote}`);
    if (plan.schemes && plan.schemes.length > 0) {
      plan.schemes.forEach((s) => {
        lines.push(`  - ${s.schemeName} (${s.administeringAuthority})`);
        lines.push(`    Status: ${s.eligibilityStatus.toUpperCase()}`);
        lines.push(`    Support: ${s.financialSupportDescription}`);
        lines.push(`    Official Info: ${s.officialInformationUrl}`);
        if (s.officialApplicationUrl) {
          lines.push(`    Official Application Portal: ${s.officialApplicationUrl}`);
        }
      });
    } else {
      lines.push('  - No matched government schemes for this criteria.');
    }
    lines.push('');
    if (plan.documentReadiness) {
      lines.push('9. DOCUMENT PREPARATION STATUS');
      lines.push(`• Target Scheme: ${plan.documentReadiness.selectedSchemeName || 'General Scheme Dossier'}`);
      lines.push(`• Requirements: Total: ${plan.documentReadiness.summary.totalRequired} | User Available: ${plan.documentReadiness.summary.markedAvailable} | To Prepare: ${plan.documentReadiness.summary.needToPrepare} | Need Verification: ${plan.documentReadiness.summary.needVerification}`);
      lines.push('');
    }
    lines.push('10. IMPLEMENTATION ROADMAP');
    plan.implementationPlan.steps.forEach((st) => {
      lines.push(`Step ${st.stepNumber}: ${st.title} [${st.categoryLabel}]`);
      lines.push(`  Evidence Source: ${st.evidenceSource}`);
      lines.push(`  Details: ${st.description}`);
      lines.push(`  Action: ${st.actionItem}`);
      lines.push(`  Lead: ${st.ownerOrAgency}`);
    });
    lines.push('');
    if (plan.narrative?.businessObjectives) {
      lines.push('11. PROMOTER NARRATIVE & OPERATIONAL STRATEGY');
      lines.push(`• Business Objectives: ${plan.narrative.businessObjectives}`);
      if (plan.narrative.targetCustomersAndMarket) {
        lines.push(`• Target Customers: ${plan.narrative.targetCustomersAndMarket}`);
      }
      if (plan.narrative.operationalNotes) {
        lines.push(`• Operational Plan: ${plan.narrative.operationalNotes}`);
      }
      lines.push('');
    }
    lines.push('12. ASSUMPTIONS & MANDATORY STATUTORY DISCLOSURES');
    plan.disclosures.forEach((d) => {
      lines.push(`• [${d.title}]: ${d.text}`);
    });
    lines.push('');
    lines.push('================================================================================');
    lines.push('DISCLAIMER: Generated by GramUdyam for planning and preparation. It is not an');
    lines.push('official government application or sanction document.');
    lines.push('================================================================================');
    return lines.join('\n');
  }

  /**
   * Generates a complete standalone printable HTML document with embedded CSS.
   * Suitable for printing, saving as PDF, or offline reference.
   */
  public exportPlanAsHtml(plan: BusinessPlan, title?: string): string {
    const docTitle = title || `${plan.business.businessName} - Business & Financing Plan`;
    const escape = (str?: string) => (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(docTitle)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1c1917;
      background: #ffffff;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 20px;
    }
    .header {
      border-bottom: 2px solid #065f46;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background: #d1fae5;
      color: #064e3b;
      font-size: 8pt;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 { font-size: 18pt; margin: 8px 0 4px 0; color: #111827; }
    h2 {
      font-size: 12pt;
      color: #065f46;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta { font-size: 9pt; color: #6b7280; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px; }
    .stat-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 14px;
    }
    .stat-label { font-size: 8pt; text-transform: uppercase; color: #6b7280; font-weight: 600; }
    .stat-value { font-size: 13pt; font-weight: 700; color: #111827; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 14px; font-size: 9.5pt; }
    th, td { padding: 6px 10px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    .step {
      border: 1px solid #e5e7eb;
      border-left: 3px solid #059669;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .step-title { font-weight: 700; font-size: 10pt; color: #111827; }
    .step-cat { font-size: 8pt; color: #047857; font-weight: 600; }
    .step-ev { font-size: 8pt; color: #6b7280; font-style: italic; }
    .disclaimer-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 3px solid #d97706;
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 8.5pt;
      color: #78350f;
      margin-top: 20px;
    }
    .print-button {
      background: #047857;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 10pt;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
    }
    @media print {
      body { padding: 0; }
      .print-button { display: none; }
      .step { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <span class="badge">GramUdyam Business &amp; Financing Plan</span>
    <span class="meta" style="margin-left: 10px;">Version ${escape(plan.version)} | Generated: ${new Date(plan.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    <h1>${escape(plan.business.businessName)}</h1>
    <div class="meta">
      ${escape(plan.business.businessCategory)} &bull; Proposed Scale: <strong>${escape(plan.business.proposedScale)}</strong> &bull; Location: <strong>${escape(plan.business.selectedLocation)}</strong>
    </div>
  </div>

  <h2>1. Executive Summary &amp; Unit Economics</h2>
  <div class="grid">
    <div class="stat-box">
      <div class="stat-label">Total Project Cost</div>
      <div class="stat-value">&#8377;${plan.financials.totalProjectCost.toLocaleString('en-IN')}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Promoter Capital Available</div>
      <div class="stat-value">&#8377;${plan.financials.availableCapital.toLocaleString('en-IN')}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Financing Gap (Bank/Subsidy Need)</div>
      <div class="stat-value">&#8377;${plan.financials.financingGap.toLocaleString('en-IN')}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Estimated Monthly Net Profit</div>
      <div class="stat-value">&#8377;${plan.financials.monthlyNetProfit.toLocaleString('en-IN')}</div>
    </div>
  </div>

  <h2>2. Financial Feasibility Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Notes / Assumptions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Fixed Assets (CapEx)</td>
        <td>&#8377;${plan.financials.fixedAssetsCost.toLocaleString('en-IN')}</td>
        <td>Machinery, sheds, installations</td>
      </tr>
      <tr>
        <td>Working Capital (Pre-Op &amp; Inventory)</td>
        <td>&#8377;${plan.financials.workingCapital.toLocaleString('en-IN')}</td>
        <td>Raw materials and operating reserves</td>
      </tr>
      <tr>
        <td>Promoter Equity Contribution</td>
        <td>&#8377;${plan.financials.promoterContribution.toLocaleString('en-IN')}</td>
        <td>Actual entrepreneur capital</td>
      </tr>
      <tr>
        <td>Bank Term Loan Required</td>
        <td>&#8377;${plan.financials.bankTermLoan.toLocaleString('en-IN')}</td>
        <td>Debt financing component</td>
      </tr>
      <tr>
        <td>Estimated Monthly Revenue</td>
        <td>&#8377;${plan.financials.monthlyRevenue.toLocaleString('en-IN')}</td>
        <td>At target operational scale</td>
      </tr>
      <tr>
        <td>Monthly Operating Expenses (OPEX)</td>
        <td>&#8377;${plan.financials.monthlyOpex.toLocaleString('en-IN')}</td>
        <td>Inputs, utilities, labor, logistics</td>
      </tr>
      <tr>
        <td>Monthly Debt Service (EMI)</td>
        <td>${plan.financials.monthlyEmi ? `&#8377;${plan.financials.monthlyEmi.toLocaleString('en-IN')}` : 'No Debt Required'}</td>
        <td>Benchmark: 5 years @ 9.5% p.a.</td>
      </tr>
      <tr>
        <td>Debt Service Coverage Ratio (DSCR)</td>
        <td>${plan.financials.debtServiceCoverageRatio ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A (Zero Debt)'}</td>
        <td>Benchmark threshold: &ge; 1.5x</td>
      </tr>
      <tr>
        <td>Affordability Classification</td>
        <td><strong>${escape(plan.financials.affordabilityClassification)}</strong></td>
        <td>${escape(plan.financials.affordabilityReason)}</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Proposed Location &amp; Benchmarks</h2>
  <p><strong>District &amp; State:</strong> ${escape(plan.location?.district)}, ${escape(plan.location?.state)} (${escape(plan.location?.locationType?.toUpperCase())})</p>
  <p><strong>Power Availability:</strong> ${plan.location?.powerAvailabilityHours || 16} hrs/day &bull; <strong>Catchment:</strong> ${escape(plan.location?.marketCatchmentInfo)}</p>
  <p class="meta"><em>${escape(plan.location?.benchmarkDisclosure)}</em></p>

  ${plan.schemes && plan.schemes.length > 0 ? `
  <h2>4. Matched Government Schemes</h2>
  <table>
    <thead>
      <tr>
        <th>Scheme Name</th>
        <th>Status</th>
        <th>Financial Support Description</th>
        <th>Official Portal</th>
      </tr>
    </thead>
    <tbody>
      ${plan.schemes.map(s => `
        <tr>
          <td><strong>${escape(s.schemeName)}</strong><br><span class="meta">${escape(s.administeringAuthority)}</span></td>
          <td><span class="badge" style="background:#e0f2fe;color:#0369a1;">${escape(s.eligibilityStatus.toUpperCase())}</span></td>
          <td>${escape(s.financialSupportDescription)}</td>
          <td><a href="${escape(s.officialApplicationUrl || s.officialInformationUrl)}" target="_blank" rel="noopener noreferrer">${escape(s.officialApplicationUrl ? 'Application Portal' : 'Info Portal')}</a></td>
        </tr>
      `).join('')}
    </tbody>
  </table>` : ''}

  <h2>5. Implementation Roadmap</h2>
  ${plan.implementationPlan.steps.map(st => `
    <div class="step">
      <div class="step-title">Step ${st.stepNumber}: ${escape(st.title)} <span class="step-cat">[${escape(st.categoryLabel)}]</span></div>
      <div class="step-ev">Evidence Source: ${escape(st.evidenceSource)}</div>
      <p style="margin:4px 0;font-size:9pt;">${escape(st.description)}</p>
      <p style="margin:2px 0;font-size:8.5pt;"><strong>Action:</strong> ${escape(st.actionItem)} &bull; <strong>Lead:</strong> ${escape(st.ownerOrAgency)}</p>
    </div>
  `).join('')}

  ${plan.narrative?.businessObjectives ? `
  <h2>6. Promoter Narrative &amp; Strategy</h2>
  <p><strong>Business Objectives:</strong> ${escape(plan.narrative.businessObjectives)}</p>
  ${plan.narrative.targetCustomersAndMarket ? `<p><strong>Target Customers:</strong> ${escape(plan.narrative.targetCustomersAndMarket)}</p>` : ''}
  ${plan.narrative.operationalNotes ? `<p><strong>Operational Notes:</strong> ${escape(plan.narrative.operationalNotes)}</p>` : ''}
  ` : ''}

  <h2>7. Mandatory Disclosures &amp; Statutory Notes</h2>
  <div class="disclaimer-box">
    ${plan.disclosures.map(d => `<p style="margin: 4px 0;"><strong>[${escape(d.title)}]:</strong> ${escape(d.text)}</p>`).join('')}
  </div>
</body>
</html>`;
  }
}

export const businessPlanService = new BusinessPlanService();

