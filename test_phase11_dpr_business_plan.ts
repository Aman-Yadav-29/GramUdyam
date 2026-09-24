/**
 * Test Suite: Phase 11 — DPR / Business Plan Generator
 * 
 * Verifies:
 * 1. Strict generation of all 25 numbered DPR sections in exact order:
 *    1. Executive Summary
 *    2. Business Idea
 *    3. Location
 *    4. Local Market Analysis
 *    5. Business Model
 *    6. Products/Services
 *    7. Infrastructure
 *    8. Equipment
 *    9. Raw Materials
 *    10. Labour
 *    11. Startup Cost
 *    12. Working Capital
 *    13. Monthly Expenses
 *    14. Revenue Projection
 *    15. Profit Projection
 *    16. Break-even
 *    17. Financing Requirement
 *    18. Government Schemes
 *    19. Loan Options
 *    20. Eligibility
 *    21. Documents
 *    22. Risks
 *    23. Mitigation
 *    24. Timeline
 *    25. Next Steps
 * 
 * 2. Strict Financial Number Invariance:
 *    - All numbers originate strictly from the deterministic Financial Engine (Phase 4).
 *    - AI does not independently invent figures.
 *    - Audited across all 13 enterprise templates.
 * 
 * 3. Suitability for Viewing & Export:
 *    - Standalone printable HTML generator.
 *    - Structured text generator.
 *    - Backend service integration.
 */

import { generateDetailedProjectReport } from './src/utils/dprGenerator.ts';
import { generateDprHtml, generateDprText } from './src/utils/exportDpr.ts';
import { businessPlanService } from './server/services/businessPlanService.ts';
import { DprSectionKey } from './src/types/dpr.ts';
import { ENTERPRISE_TEMPLATES } from './src/data/enterpriseTemplatesData.ts';
import { financialEngineService } from './server/services/financialEngineService.ts';
import { locationGisService } from './server/services/locationGisService.ts';
import { agriLocationService } from './server/services/agriLocationService.ts';
import { schemeMatchingService } from './server/services/schemeMatchingService.ts';
import { documentReadinessService } from './server/services/documentReadinessService.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

const EXPECTED_25_SECTIONS = [
  { num: 1, key: 'executiveSummary', titlePrefix: '1. Executive Summary' },
  { num: 2, key: 'businessIdea', titlePrefix: '2. Business Idea' },
  { num: 3, key: 'location', titlePrefix: '3. Location' },
  { num: 4, key: 'localMarketAnalysis', titlePrefix: '4. Local Market Analysis' },
  { num: 5, key: 'businessModel', titlePrefix: '5. Business Model' },
  { num: 6, key: 'productsServices', titlePrefix: '6. Products/Services' },
  { num: 7, key: 'infrastructure', titlePrefix: '7. Infrastructure' },
  { num: 8, key: 'equipment', titlePrefix: '8. Equipment' },
  { num: 9, key: 'rawMaterials', titlePrefix: '9. Raw Materials' },
  { num: 10, key: 'labour', titlePrefix: '10. Labour' },
  { num: 11, key: 'startupCost', titlePrefix: '11. Startup Cost' },
  { num: 12, key: 'workingCapital', titlePrefix: '12. Working Capital' },
  { num: 13, key: 'monthlyExpenses', titlePrefix: '13. Monthly Expenses' },
  { num: 14, key: 'revenueProjection', titlePrefix: '14. Revenue Projection' },
  { num: 15, key: 'profitProjection', titlePrefix: '15. Profit Projection' },
  { num: 16, key: 'breakEven', titlePrefix: '16. Break-even' },
  { num: 17, key: 'financingRequirement', titlePrefix: '17. Financing Requirement' },
  { num: 18, key: 'governmentSchemes', titlePrefix: '18. Government Schemes' },
  { num: 19, key: 'loanOptions', titlePrefix: '19. Loan Options' },
  { num: 20, key: 'eligibility', titlePrefix: '20. Eligibility' },
  { num: 21, key: 'documents', titlePrefix: '21. Documents' },
  { num: 22, key: 'risks', titlePrefix: '22. Risks' },
  { num: 23, key: 'mitigation', titlePrefix: '23. Mitigation' },
  { num: 24, key: 'timeline', titlePrefix: '24. Timeline' },
  { num: 25, key: 'nextSteps', titlePrefix: '25. Next Steps' }
];

async function runDprTestSuite() {
  console.log('\n================================================================');
  console.log('STARTING PHASE 11: DPR / BUSINESS PLAN GENERATOR TEST SUITE');
  console.log('================================================================\n');

  // TEST GROUP 1: Verification of Exact 25 Standardized Sections
  console.log('--- TEST GROUP 1: ALL 25 REQUIRED SECTIONS GENERATION ---');
  {
    const template = ENTERPRISE_TEMPLATES[0]; // Vermicompost
    const capitalAvailable = 20000;
    const finResult = financialEngineService.generateFinancialProjections({
      enterpriseId: template.id,
      capitalAvailable,
      promoterCategory: 'general',
      locationType: 'rural',
      state: 'Uttar Pradesh',
      district: 'Varanasi'
    });
    const fp = finResult.plan;

    const dpr = generateDetailedProjectReport({
      enterprise: template,
      financialPlan: fp,
      availableCapital: capitalAvailable,
      location: {
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        locationType: 'rural'
      },
      promoterProfile: {
        name: 'Ramesh Kumar',
        age: 34,
        socialCategory: 'General Category',
        isRural: true,
        isNewBusiness: true
      }
    });

    assert(dpr !== null, 'DPR generated successfully');
    assert(dpr.sections.length === 25, `DPR has exactly 25 sections (actual: ${dpr.sections.length})`);

    // Verify each section exists in exact sequential order 1..25
    EXPECTED_25_SECTIONS.forEach((exp, idx) => {
      const sec = dpr.sections[idx];
      assert(sec.sectionNumber === exp.num, `Section ${exp.num} has sectionNumber ${exp.num}`);
      assert(sec.key === exp.key, `Section ${exp.num} has key '${exp.key}'`);
      assert(sec.title.startsWith(exp.titlePrefix), `Section ${exp.num} title matches '${exp.titlePrefix}' (actual: '${sec.title}')`);
      assert(sec.paragraphs.length > 0, `Section ${exp.num} has detailed narrative paragraphs`);
      assert(dpr.sectionMap[exp.key as DprSectionKey] !== undefined, `Section ${exp.num} is accessible via sectionMap['${exp.key}']`);
    });
  }

  // TEST GROUP 2: Strict Financial Engine Invariance Across All 13 Enterprise Templates
  console.log('\n--- TEST GROUP 2: FINANCIAL ENGINE INVARIANCE AUDIT (ALL 13 TEMPLATES) ---');
  {
    for (const template of ENTERPRISE_TEMPLATES) {
      const availableCapital = Math.round(template.minCapitalRequired * 0.25);
      const finResult = financialEngineService.generateFinancialProjections({
        enterpriseId: template.id,
        capitalAvailable: availableCapital,
        promoterCategory: 'general',
        locationType: 'rural',
        state: 'Bihar',
        district: 'Muzaffarpur'
      });
      const fp = finResult.plan;
      assert(fp !== null, `Financial projections generated for ${template.name}`);

      const dpr = generateDetailedProjectReport({
        enterprise: template,
        financialPlan: fp,
        availableCapital,
        location: {
          state: 'Bihar',
          district: 'Muzaffarpur',
          locationType: 'rural'
        }
      });

      // STRICT FINANCIAL INVARIANCE CHECKS:
      assert(dpr.financialSummary.totalProjectCost === fp.totalProjectCost,
        `${template.name}: totalProjectCost invariant (${dpr.financialSummary.totalProjectCost})`);
      assert(dpr.financialSummary.fixedAssetsCost === fp.fixedAssetsCost,
        `${template.name}: fixedAssetsCost invariant (${dpr.financialSummary.fixedAssetsCost})`);
      assert(dpr.financialSummary.workingCapitalRequirement === fp.workingCapitalRequirement,
        `${template.name}: workingCapitalRequirement invariant (${dpr.financialSummary.workingCapitalRequirement})`);
      assert(dpr.financialSummary.promoterContribution === fp.promoterContribution,
        `${template.name}: promoterContribution invariant (${dpr.financialSummary.promoterContribution})`);
      assert(dpr.financialSummary.financingGap === fp.financingGap,
        `${template.name}: financingGap invariant (${dpr.financialSummary.financingGap})`);
      assert(dpr.financialSummary.monthlyRevenue === fp.monthlyRevenue,
        `${template.name}: monthlyRevenue invariant (${dpr.financialSummary.monthlyRevenue})`);
      assert(dpr.financialSummary.monthlyOpex === fp.monthlyOperatingExpenses,
        `${template.name}: monthlyOpex invariant (${dpr.financialSummary.monthlyOpex})`);
      assert(dpr.financialSummary.monthlyNetProfit === fp.monthlyNetProfit,
        `${template.name}: monthlyNetProfit invariant (${dpr.financialSummary.monthlyNetProfit})`);
      assert(dpr.financialSummary.debtServiceCoverageRatio === fp.debtServiceCoverageRatio,
        `${template.name}: DSCR invariant (${dpr.financialSummary.debtServiceCoverageRatio})`);
      assert(dpr.financialSummary.breakEvenCapacityPercent === fp.breakEvenSalesPercent,
        `${template.name}: Break-Even % invariant (${dpr.financialSummary.breakEvenCapacityPercent})`);

      // Section-level financial consistency checks:
      // Section 11 (Startup cost)
      const sec11 = dpr.sectionMap.startupCost;
      assert(sec11.tables !== undefined && sec11.tables.length > 0, `${template.name}: Section 11 has startup cost table`);

      // Section 12 (Working capital)
      const sec12 = dpr.sectionMap.workingCapital;
      assert(sec12.tables !== undefined && sec12.tables[0].footers![2].toString().includes(fp.workingCapitalRequirement.toLocaleString('en-IN')),
        `${template.name}: Section 12 table footer matches workingCapitalRequirement`);

      // Section 13 (Monthly expenses)
      const sec13 = dpr.sectionMap.monthlyExpenses;
      assert(sec13.tables !== undefined && sec13.tables[0].footers![2].toString().includes(fp.monthlyOperatingExpenses.toLocaleString('en-IN')),
        `${template.name}: Section 13 table footer matches monthlyOperatingExpenses`);

      // Section 17 (Financing requirement means of finance)
      const sec17 = dpr.sectionMap.financingRequirement;
      assert(sec17.tables !== undefined && sec17.tables[0].footers![2].toString().includes(fp.totalProjectCost.toLocaleString('en-IN')),
        `${template.name}: Section 17 means of finance equals totalProjectCost`);
    }
  }

  // TEST GROUP 3: Viewing & Export Suitability (Printable HTML & Structured Text)
  console.log('\n--- TEST GROUP 3: VIEWING & EXPORT ENGINE ---');
  {
    const template = ENTERPRISE_TEMPLATES.find((e) => e.id === 'ent_oil_expeller')!;
    const finResult = financialEngineService.generateFinancialProjections({
      enterpriseId: template.id,
      capitalAvailable: 350000,
      promoterCategory: 'general',
      locationType: 'rural',
      state: 'Rajasthan',
      district: 'Alwar'
    });
    const fp = finResult.plan;

    const dpr = generateDetailedProjectReport({
      enterprise: template,
      financialPlan: fp,
      availableCapital: 350000,
      location: {
        state: 'Rajasthan',
        district: 'Alwar',
        locationType: 'rural'
      },
      promoterProfile: {
        name: 'Sunita Devi',
        socialCategory: 'Women Entrepreneur',
        isRural: true
      }
    });

    // 1. Standalone HTML Export Test
    const htmlExport = generateDprHtml(dpr);
    assert(htmlExport.startsWith('<!DOCTYPE html>'), 'HTML export has valid HTML5 doctype');
    assert(htmlExport.includes('<title>Detailed Project Report (DPR) for'), 'HTML export has title tag');
    assert(htmlExport.includes('Table of Contents (25 Standardized DPR Chapters)'), 'HTML export includes Table of Contents');
    assert(htmlExport.includes('window.print()'), 'HTML export includes print trigger button');
    assert(htmlExport.includes('Statutory Banking &amp; Regulatory Disclosures'), 'HTML export includes statutory disclosures');

    // Verify all 25 section titles appear in the exported HTML
    EXPECTED_25_SECTIONS.forEach((exp) => {
      assert(htmlExport.includes(exp.titlePrefix), `HTML export contains chapter '${exp.titlePrefix}'`);
    });

    // 2. Structured Text Export Test
    const textExport = generateDprText(dpr);
    assert(textExport.includes('GRAMUDYAM — DETAILED PROJECT REPORT (DPR)'), 'Text export contains master header');
    assert(textExport.includes('REPORT SECTIONS (1 TO 25)'), 'Text export contains sections marker');

    // Verify all 25 section titles appear in the text export
    EXPECTED_25_SECTIONS.forEach((exp) => {
      assert(textExport.includes(exp.titlePrefix.toUpperCase()), `Text export contains chapter '${exp.titlePrefix.toUpperCase()}'`);
    });
  }

  // TEST GROUP 4: Backend Service & Integration
  console.log('\n--- TEST GROUP 4: BACKEND SERVICE VERIFICATION ---');
  {
    const template = ENTERPRISE_TEMPLATES[1]; // Mushroom
    const finResult = financialEngineService.generateFinancialProjections({
      enterpriseId: template.id,
      capitalAvailable: 30000,
      promoterCategory: 'special',
      locationType: 'rural',
      state: 'Uttarakhand',
      district: 'Dehradun'
    });
    const fp = finResult.plan;

    const serviceDpr = businessPlanService.generateDpr({
      enterprise: template,
      financialPlan: fp,
      availableCapital: 30000,
      location: {
        state: 'Uttarakhand',
        district: 'Dehradun',
        locationType: 'rural'
      }
    });

    assert(serviceDpr !== null, 'Service generates valid 25-section DPR');
    assert(serviceDpr.sections.length === 25, 'Service DPR contains exactly 25 sections');

    const serviceHtml = businessPlanService.exportDprAsHtml(serviceDpr);
    assert(serviceHtml.length > 1000, 'Service exports comprehensive HTML');

    const serviceText = businessPlanService.exportDprAsText(serviceDpr);
    assert(serviceText.length > 1000, 'Service exports comprehensive plain text');
  }

  console.log('\n================================================================');
  console.log(`PHASE 11 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runDprTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
