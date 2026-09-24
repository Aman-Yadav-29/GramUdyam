import { BusinessPlan } from '../types/businessPlan.ts';
import { formatINR } from './formatters.ts';

export function downloadBlob(filename: string, content: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to trigger download:', err);
  }
}

export function generatePlanHtml(plan: BusinessPlan, customTitle?: string): string {
  const docTitle = customTitle || `${plan.business.businessName} - Business & Financing Plan`;
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
      padding: 24px;
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
      font-size: 11pt;
      color: #065f46;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-top: 22px;
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
      ${escape(plan.business.businessCategory)} &bull; Scale: <strong>${escape(plan.business.proposedScale)}</strong> &bull; Location: <strong>${escape(plan.business.selectedLocation)}</strong>
    </div>
  </div>

  <h2>1. Unit Economics &amp; Project Investment</h2>
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
      <div class="stat-label">Financing Gap (Credit/Subsidy)</div>
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
        <th>Financial Element</th>
        <th>Value (INR)</th>
        <th>Derived Formula / Note</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Fixed Assets (CapEx)</td>
        <td>&#8377;${plan.financials.fixedAssetsCost.toLocaleString('en-IN')}</td>
        <td>Machinery, equipment, civil structure</td>
      </tr>
      <tr>
        <td>Working Capital (Pre-Op &amp; Inventory)</td>
        <td>&#8377;${plan.financials.workingCapital.toLocaleString('en-IN')}</td>
        <td>Raw materials, utilities, operating buffer</td>
      </tr>
      <tr>
        <td>Promoter Equity Contribution</td>
        <td>&#8377;${plan.financials.promoterContribution.toLocaleString('en-IN')}</td>
        <td>Entrepreneur own funds (capped at available capital)</td>
      </tr>
      <tr>
        <td>Bank Term Loan Required</td>
        <td>&#8377;${plan.financials.bankTermLoan.toLocaleString('en-IN')}</td>
        <td>Project Cost minus Promoter Contribution</td>
      </tr>
      <tr>
        <td>Estimated Monthly Revenue</td>
        <td>&#8377;${plan.financials.monthlyRevenue.toLocaleString('en-IN')}</td>
        <td>At normal operating capacity</td>
      </tr>
      <tr>
        <td>Monthly Operating Expenses (OPEX)</td>
        <td>&#8377;${plan.financials.monthlyOpex.toLocaleString('en-IN')}</td>
        <td>Raw materials, labor, power, logistics</td>
      </tr>
      <tr>
        <td>Monthly Debt Service (EMI)</td>
        <td>${plan.financials.monthlyEmi ? `&#8377;${plan.financials.monthlyEmi.toLocaleString('en-IN')}` : 'No Debt Required'}</td>
        <td>Calculated standard term loan (5 yrs @ 9.5% p.a.)</td>
      </tr>
      <tr>
        <td>Debt Service Coverage Ratio (DSCR)</td>
        <td>${plan.financials.debtServiceCoverageRatio ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A (Zero Debt)'}</td>
        <td>Cash Available for Debt Service / Debt Service (Threshold &ge; 1.5x)</td>
      </tr>
      <tr>
        <td>Affordability Classification</td>
        <td><strong>${escape(plan.financials.affordabilityClassification)}</strong></td>
        <td>${escape(plan.financials.affordabilityReason)}</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Proposed Location &amp; Local Intelligence</h2>
  <p><strong>Location:</strong> ${escape(plan.location?.district)}, ${escape(plan.location?.state)} (${escape(plan.location?.locationType?.toUpperCase())})</p>
  <p><strong>Power Supply Benchmark:</strong> ${plan.location?.powerAvailabilityHours || 16} hrs/day &bull; <strong>Catchment:</strong> ${escape(plan.location?.marketCatchmentInfo)}</p>
  <p class="meta"><em>${escape(plan.location?.benchmarkDisclosure)}</em></p>

  ${plan.schemes && plan.schemes.length > 0 ? `
  <h2>4. Matched Government Schemes</h2>
  <table>
    <thead>
      <tr>
        <th>Scheme Name</th>
        <th>Eligibility Status</th>
        <th>Financial Support</th>
        <th>Official Portal</th>
      </tr>
    </thead>
    <tbody>
      ${plan.schemes.map(s => `
        <tr>
          <td><strong>${escape(s.schemeName)}</strong><br><span class="meta">${escape(s.administeringAuthority)}</span></td>
          <td><span class="badge" style="background:#e0f2fe;color:#0369a1;">${escape(s.eligibilityStatus.toUpperCase())}</span></td>
          <td>${escape(s.financialSupportDescription)}</td>
          <td><a href="${escape(s.officialApplicationUrl || s.officialInformationUrl)}" target="_blank" rel="noopener noreferrer">${escape(s.officialApplicationUrl ? 'Official Application Portal' : 'Information Portal')}</a></td>
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

  <h2>7. Statutory Disclosures</h2>
  <div class="disclaimer-box">
    ${plan.disclosures.map(d => `<p style="margin: 4px 0;"><strong>[${escape(d.title)}]:</strong> ${escape(d.text)}</p>`).join('')}
  </div>
</body>
</html>`;
}

export function generatePlanText(plan: BusinessPlan): string {
  const lines: string[] = [];
  lines.push('================================================================================');
  lines.push('GRAMUDYAM - BUSINESS & FINANCING PLAN (DPR PREPARATION)');
  lines.push(`Plan ID: ${plan.id} | Generated: ${new Date(plan.generatedAt).toLocaleString('en-IN')}`);
  lines.push('================================================================================');
  lines.push('');
  lines.push(`Enterprise: ${plan.business.businessName}`);
  lines.push(`Category: ${plan.business.businessCategory}`);
  lines.push(`Scale: ${plan.business.proposedScale}`);
  lines.push(`Location: ${plan.business.selectedLocation}`);
  lines.push('');
  lines.push('1. UNIT ECONOMICS & FEASIBILITY');
  lines.push(`• Total Project Cost: ${formatINR(plan.financials.totalProjectCost)}`);
  lines.push(`  - Fixed Assets: ${formatINR(plan.financials.fixedAssetsCost)}`);
  lines.push(`  - Working Capital: ${formatINR(plan.financials.workingCapital)}`);
  lines.push(`• Available Capital: ${formatINR(plan.financials.availableCapital)}`);
  lines.push(`• Promoter Equity: ${formatINR(plan.financials.promoterContribution)}`);
  lines.push(`• Financing Gap: ${formatINR(plan.financials.financingGap)}`);
  lines.push(`• Bank Term Loan: ${formatINR(plan.financials.bankTermLoan)}`);
  lines.push(`• Estimated Monthly Revenue: ${formatINR(plan.financials.monthlyRevenue)}`);
  lines.push(`• Monthly OPEX: ${formatINR(plan.financials.monthlyOpex)}`);
  lines.push(`• Monthly Net Profit: ${formatINR(plan.financials.monthlyNetProfit)}`);
  lines.push(`• Monthly Debt Service (EMI): ${plan.financials.monthlyEmi ? formatINR(plan.financials.monthlyEmi) : 'No Debt'}`);
  lines.push(`• Debt Service Coverage Ratio (DSCR): ${plan.financials.debtServiceCoverageRatio ? `${plan.financials.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}`);
  lines.push(`• Affordability Classification: ${plan.financials.affordabilityClassification}`);
  lines.push(`• Classification Reason: ${plan.financials.affordabilityReason}`);
  lines.push('');
  lines.push('2. MATCHED GOVERNMENT SCHEMES');
  if (plan.schemes && plan.schemes.length > 0) {
    plan.schemes.forEach((s) => {
      lines.push(`• ${s.schemeName} (${s.administeringAuthority})`);
      lines.push(`  Status: ${s.eligibilityStatus.toUpperCase()}`);
      lines.push(`  Support: ${s.financialSupportDescription}`);
      lines.push(`  Portal: ${s.officialApplicationUrl || s.officialInformationUrl}`);
    });
  } else {
    lines.push('• No matched government schemes.');
  }
  lines.push('');
  lines.push('3. IMPLEMENTATION ROADMAP');
  plan.implementationPlan.steps.forEach((st) => {
    lines.push(`Step ${st.stepNumber}: ${st.title} [${st.categoryLabel}]`);
    lines.push(`  Source: ${st.evidenceSource}`);
    lines.push(`  Action: ${st.actionItem}`);
    lines.push(`  Lead: ${st.ownerOrAgency}`);
  });
  lines.push('');
  if (plan.narrative?.businessObjectives) {
    lines.push('4. PROMOTER NARRATIVE');
    lines.push(`• Objectives: ${plan.narrative.businessObjectives}`);
    if (plan.narrative.targetCustomersAndMarket) {
      lines.push(`• Market: ${plan.narrative.targetCustomersAndMarket}`);
    }
    if (plan.narrative.operationalNotes) {
      lines.push(`• Operations: ${plan.narrative.operationalNotes}`);
    }
    lines.push('');
  }
  lines.push('5. MANDATORY DISCLOSURES');
  plan.disclosures.forEach((d) => {
    lines.push(`• [${d.title}]: ${d.text}`);
  });
  lines.push('');
  lines.push('================================================================================');
  lines.push('DISCLAIMER: Generated by GramUdyam for planning and bank preparation purposes.');
  lines.push('================================================================================');
  return lines.join('\n');
}

export function downloadPlanAsHtml(plan: BusinessPlan, title?: string): void {
  const html = generatePlanHtml(plan, title);
  const cleanName = plan.business.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadBlob(`${cleanName}_business_plan.html`, html, 'text/html;charset=utf-8');
}

export function downloadPlanAsText(plan: BusinessPlan): void {
  const text = generatePlanText(plan);
  const cleanName = plan.business.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadBlob(`${cleanName}_business_plan.txt`, text, 'text/plain;charset=utf-8');
}
