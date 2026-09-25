/**
 * Phase 15: Submission Package Export Engine
 * 
 * Supports:
 * - Structured Plain Text (.txt)
 * - Standalone Print-Friendly HTML (.html) with CSS @media print
 * - Defensive XSS sanitization for all user-entered inputs
 * - Enforces immutable provenance and prominent statutory notices
 */

import type { SubmissionPackage } from '../types/submissionPackage.ts';

export function escapeHtml(str?: string | number | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function downloadSubmissionBlob(filename: string, content: string, mimeType: string): void {
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

export function generateSubmissionPackageText(pkg: SubmissionPackage): string {
  const { metadata, completeness, financialSummary, userInputs, sections, disclaimers } = pkg;
  const lines: string[] = [];

  const addHeader = (title: string) => {
    lines.push('================================================================================');
    lines.push(title.toUpperCase());
    lines.push('================================================================================');
  };

  const addSubHeader = (title: string) => {
    lines.push('--------------------------------------------------------------------------------');
    lines.push(title);
    lines.push('--------------------------------------------------------------------------------');
  };

  // 1. Cover & Institutional Notice
  addHeader(`GRAMUDYAM — ${metadata.packageType === 'bank_submission' ? 'BANK CREDIT APPRAISAL DOSSIER' : 'GOVERNMENT SCHEME SUBMISSION PACKAGE'}`);
  lines.push(`Enterprise Name   : ${metadata.businessName}`);
  lines.push(`Promoter Name     : ${metadata.promoterName} (${metadata.promoterSocialCategory})`);
  lines.push(`Location          : ${metadata.location.district}, ${metadata.location.state} (${metadata.location.locationType})`);
  lines.push(`Package Status    : ${pkg.status.toUpperCase()} (Factual inventory count)`);
  lines.push(`Generated Date    : ${metadata.generatedAt}`);
  lines.push(`Snapshot Notice   : ${metadata.snapshotNotice}`);
  lines.push('');
  lines.push('NOTICE: Prepared using information recorded in GramUdyam.');
  lines.push('This package is an information-preparation aid and does not constitute approval, sanction, certification, or government/bank verification.');
  lines.push('');

  // 2. Target Institution (if specified)
  if (userInputs.targetInstitutionName || userInputs.institutionalContactPerson) {
    addSubHeader('TARGET INSTITUTIONAL RECIPIENT');
    if (userInputs.targetInstitutionName) lines.push(`Institution Name : ${userInputs.targetInstitutionName}`);
    if (userInputs.targetBranchName) lines.push(`Branch           : ${userInputs.targetBranchName}`);
    if (userInputs.institutionalContactPerson) lines.push(`Contact Person   : ${userInputs.institutionalContactPerson}`);
    if (userInputs.institutionalDesignation) lines.push(`Designation      : ${userInputs.institutionalDesignation}`);
    lines.push('');
  }

  // 3. Completeness Overview
  addSubHeader('PACKAGE COMPLETENESS SUMMARY (FACTUAL COUNTS)');
  lines.push(`Sections Total            : ${completeness.sectionsTotal}`);
  lines.push(`Sections Populated        : ${completeness.sectionsPopulated}`);
  lines.push(`Sections Incomplete       : ${completeness.sectionsIncomplete}`);
  lines.push(`Required Documents Total  : ${completeness.requiredDocumentsTotal}`);
  lines.push(`Documents Marked Available: ${completeness.requiredDocumentsAvailable}`);
  lines.push(`Documents to Prepare      : ${completeness.documentsToPrepare}`);
  lines.push(`Documents Needing Verif.  : ${completeness.documentsNeedingVerification}`);
  if (completeness.missingInformationItems.length > 0) {
    lines.push('Pending Plan Items:');
    completeness.missingInformationItems.forEach(item => lines.push(`  * ${item}`));
  }
  lines.push('');

  // 4. Financial Summary
  addSubHeader('FINANCIAL ENGINE SUMMARY (PHASE 4 DETERMINISTIC SOURCE)');
  lines.push(`Total Project Cost        : ${financialSummary.totalProjectCost !== null ? `₹${financialSummary.totalProjectCost.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Fixed Assets Cost (CapEx) : ${financialSummary.fixedAssetsCost !== null ? `₹${financialSummary.fixedAssetsCost.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Working Capital Req.      : ${financialSummary.workingCapitalRequirement !== null ? `₹${financialSummary.workingCapitalRequirement.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Promoter Margin Equity    : ${financialSummary.promoterContribution !== null ? `₹${financialSummary.promoterContribution.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Bank Term Loan Required   : ${financialSummary.bankTermLoanRequired !== null ? `₹${financialSummary.bankTermLoanRequired.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Projected Monthly Revenue : ${financialSummary.monthlyRevenue !== null ? `₹${financialSummary.monthlyRevenue.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Projected Monthly OPEX    : ${financialSummary.monthlyOperatingExpenses !== null ? `₹${financialSummary.monthlyOperatingExpenses.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Projected Monthly Profit  : ${financialSummary.monthlyNetProfit !== null ? `₹${financialSummary.monthlyNetProfit.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Debt Service Ratio (DSCR) : ${financialSummary.debtServiceCoverageRatio !== null ? financialSummary.debtServiceCoverageRatio.toFixed(2) : 'Not available in the current plan.'}`);
  lines.push(`Estimated Monthly EMI     : ${financialSummary.estimatedMonthlyEmi !== null ? `₹${financialSummary.estimatedMonthlyEmi.toLocaleString('en-IN')}` : 'Not available in the current plan.'}`);
  lines.push(`Break-Even Capacity       : ${financialSummary.breakEvenSalesPercent !== null ? `${financialSummary.breakEvenSalesPercent.toFixed(1)}%` : 'Not available in the current plan.'}`);
  lines.push(`Capital Payback Period    : ${financialSummary.paybackPeriodYears !== null ? `${financialSummary.paybackPeriodYears.toFixed(1)} Years` : 'Not available in the current plan.'}`);
  lines.push('');

  // 5. Sections Content
  for (const sec of sections) {
    if (!sec.included) continue;
    addHeader(sec.title);
    lines.push(`Source Provenance: ${sec.sourceReference} [${sec.sourcePhase}]`);
    lines.push(`Section Status   : ${sec.status.toUpperCase()}`);
    lines.push('');

    if (sec.summary) {
      lines.push(`SUMMARY: ${sec.summary}`);
      lines.push('');
    }

    for (const para of sec.paragraphs) {
      lines.push(para);
      lines.push('');
    }

    if (sec.bulletPoints && sec.bulletPoints.length > 0) {
      for (const bp of sec.bulletPoints) {
        lines.push(`  • ${bp}`);
      }
      lines.push('');
    }

    if (sec.metrics && sec.metrics.length > 0) {
      lines.push('Key Metrics:');
      for (const m of sec.metrics) {
        lines.push(`  - ${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ''}`);
      }
      lines.push('');
    }

    if (sec.tables && sec.tables.length > 0) {
      for (const t of sec.tables) {
        lines.push(`Table: ${t.title}`);
        lines.push(t.headers.join(' | '));
        lines.push(t.headers.map(() => '---').join(' | '));
        for (const row of t.rows) {
          lines.push(row.join(' | '));
        }
        lines.push('');
      }
    }

    if (sec.notes && sec.notes.length > 0) {
      for (const n of sec.notes) {
        lines.push(n);
      }
      lines.push('');
    }
  }

  // 6. Disclaimers
  addHeader('STATUTORY & REGULATORY DISCLAIMERS');
  for (const d of disclaimers) {
    lines.push(`[${d.title}]`);
    lines.push(d.text);
    lines.push('');
  }

  return lines.join('\n');
}

export function generateSubmissionPackageHtml(pkg: SubmissionPackage): string {
  const { metadata, completeness, financialSummary, userInputs, sections, disclaimers } = pkg;

  const escape = escapeHtml;

  const sectionsHtml = sections
    .filter(s => s.included)
    .map(sec => {
      const metricsHtml = sec.metrics && sec.metrics.length > 0
        ? `<div class="metrics-grid">
            ${sec.metrics.map(m => `
              <div class="metric-card">
                <div class="metric-label">${escape(m.label)}</div>
                <div class="metric-val">${escape(m.value)}${m.unit ? ` ${escape(m.unit)}` : ''}</div>
                ${m.note ? `<div class="metric-note">${escape(m.note)}</div>` : ''}
              </div>
            `).join('')}
          </div>`
        : '';

      const bulletHtml = sec.bulletPoints && sec.bulletPoints.length > 0
        ? `<ul class="bullet-list">
            ${sec.bulletPoints.map(bp => `<li>${escape(bp)}</li>`).join('')}
          </ul>`
        : '';

      const tablesHtml = sec.tables && sec.tables.length > 0
        ? sec.tables.map(t => `
            <div class="table-container">
              <div class="table-title">${escape(t.title)}</div>
              <table>
                <thead>
                  <tr>
                    ${t.headers.map(h => `<th>${escape(h)}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${t.rows.map(row => `
                    <tr>
                      ${row.map(cell => `<td>${escape(cell)}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')
        : '';

      const notesHtml = sec.notes && sec.notes.length > 0
        ? `<div class="notes-block">
            ${sec.notes.map(n => `<p>${escape(n)}</p>`).join('')}
          </div>`
        : '';

      return `
        <div class="section-container">
          <div class="section-header">
            <div>
              <h2 class="section-title">${escape(sec.title)}</h2>
              ${sec.subtitle ? `<div class="section-sub">${escape(sec.subtitle)}</div>` : ''}
            </div>
            <div class="section-badge ${sec.status === 'populated' ? 'badge-pop' : 'badge-inc'}">
              ${escape(sec.status.toUpperCase())}
            </div>
          </div>
          <div class="section-meta">
            <span><strong>Source Provenance:</strong> ${escape(sec.sourceReference)} [${escape(sec.sourcePhase)}]</span>
          </div>
          ${sec.summary ? `<div class="section-summary"><strong>Summary:</strong> ${escape(sec.summary)}</div>` : ''}
          ${sec.paragraphs.map(p => `<p class="section-para">${escape(p)}</p>`).join('')}
          ${metricsHtml}
          ${bulletHtml}
          ${tablesHtml}
          ${notesHtml}
        </div>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(metadata.businessName)} — Submission Package</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
        font-size: 8pt;
        color: #71717a;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1c1917;
      background: #fafaf9;
      line-height: 1.5;
      font-size: 9.5pt;
      margin: 0;
      padding: 24px;
    }
    .wrapper {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px 40px;
      border: 1px solid #e7e5e4;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .actions-bar {
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      background: #047857;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 600;
      cursor: pointer;
    }
    .btn:hover { background: #065f46; }
    .cover-card {
      border-bottom: 2px solid #047857;
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .doc-type-pill {
      display: inline-block;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #047857;
      background: #ecfdf5;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    h1.main-title {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .meta-line {
      font-size: 9pt;
      color: #57534e;
      margin-bottom: 12px;
    }
    .notice-box {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 8.5pt;
      color: #854d0e;
      margin-top: 14px;
      line-height: 1.45;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 14px;
    }
    .info-card-title {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 8.5pt;
    }
    .info-row:last-child { border-bottom: none; }
    .section-container {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1.5px solid #e7e5e4;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .section-sub {
      font-size: 8pt;
      color: #64748b;
      margin-top: 2px;
    }
    .section-badge {
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge-pop { background: #dcfce7; color: #15803d; }
    .badge-inc { background: #fee2e2; color: #b91c1c; }
    .section-meta {
      font-size: 7.5pt;
      color: #78716c;
      margin-bottom: 8px;
    }
    .section-summary {
      background: #f1f5f9;
      border-left: 3px solid #047857;
      padding: 6px 12px;
      font-size: 8.5pt;
      margin-bottom: 10px;
      color: #334155;
    }
    .section-para {
      font-size: 9pt;
      margin: 0 0 8px 0;
      color: #334155;
      text-align: justify;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }
    .metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .metric-label { font-size: 7.5pt; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .metric-val { font-size: 10.5pt; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .metric-note { font-size: 7pt; color: #94a3b8; margin-top: 2px; }
    .bullet-list {
      margin: 8px 0 12px 18px;
      padding: 0;
      font-size: 8.5pt;
      color: #334155;
    }
    .bullet-list li { margin-bottom: 4px; }
    .table-container { margin: 12px 0; overflow-x: auto; }
    .table-title { font-size: 8.5pt; font-weight: 700; color: #334155; margin-bottom: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    tr:nth-child(even) { background: #f8fafc; }
    .notes-block {
      background: #fffbeb;
      border: 1px dashed #fcd34d;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 8pt;
      color: #92400e;
      margin-top: 12px;
    }
    .notes-block p { margin: 4px 0; }
    .disclaimer-card {
      margin-top: 36px;
      border-top: 2px solid #cbd5e1;
      padding-top: 16px;
    }
    .disclaimer-item {
      margin-bottom: 12px;
      font-size: 7.5pt;
      color: #64748b;
      line-height: 1.4;
    }
    .disclaimer-title { font-weight: 700; color: #334155; margin-bottom: 2px; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .wrapper { border: none; box-shadow: none; padding: 0; }
      .actions-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button class="btn" onclick="window.print()">Print Dossier</button>
  </div>
  <div class="wrapper">
    <!-- Cover Card -->
    <div class="cover-card">
      <div class="doc-type-pill">${metadata.packageType === 'bank_submission' ? 'Bank Credit Appraisal Dossier' : 'Government Scheme Submission Dossier'}</div>
      <h1 class="main-title">${escape(metadata.businessName)}</h1>
      <div class="meta-line">
        <strong>Promoter:</strong> ${escape(metadata.promoterName)} (${escape(metadata.promoterSocialCategory)}) &nbsp;|&nbsp;
        <strong>Location:</strong> ${escape(metadata.location.district)}, ${escape(metadata.location.state)} (${escape(metadata.location.locationType)}) &nbsp;|&nbsp;
        <strong>Generated:</strong> ${escape(metadata.generatedAt.substring(0, 10))}
      </div>
      <div class="notice-box">
        <strong>Statutory Notice:</strong> Prepared using information recorded in GramUdyam. This package is an information-preparation aid and does not constitute approval, sanction, certification, or government/bank verification.<br>
        <em>${escape(metadata.snapshotNotice)}</em>
      </div>
    </div>

    <!-- 2 Column Overview -->
    <div class="grid-2">
      <!-- Completeness Factual Summary -->
      <div class="info-card">
        <div class="info-card-title">Package Completeness (Factual Counts)</div>
        <div class="info-row"><span>Sections Populated</span><strong>${completeness.sectionsPopulated} / ${completeness.sectionsTotal}</strong></div>
        <div class="info-row"><span>Sections Incomplete</span><strong>${completeness.sectionsIncomplete}</strong></div>
        <div class="info-row"><span>Required Documents Available</span><strong>${completeness.requiredDocumentsAvailable} / ${completeness.requiredDocumentsTotal}</strong></div>
        <div class="info-row"><span>Documents to Prepare</span><strong>${completeness.documentsToPrepare}</strong></div>
        <div class="info-row"><span>Package Status</span><strong>${escape(pkg.status.toUpperCase())}</strong></div>
      </div>

      <!-- Financial Metrics Summary -->
      <div class="info-card">
        <div class="info-card-title">Financial Summary (Phase 4 Invariant)</div>
        <div class="info-row"><span>Total Project Cost</span><strong>${financialSummary.totalProjectCost !== null ? `₹${financialSummary.totalProjectCost.toLocaleString('en-IN')}` : 'Not available'}</strong></div>
        <div class="info-row"><span>Promoter Margin Equity</span><strong>${financialSummary.promoterContribution !== null ? `₹${financialSummary.promoterContribution.toLocaleString('en-IN')}` : 'Not available'}</strong></div>
        <div class="info-row"><span>Bank Term Loan</span><strong>${financialSummary.bankTermLoanRequired !== null ? `₹${financialSummary.bankTermLoanRequired.toLocaleString('en-IN')}` : 'Not available'}</strong></div>
        <div class="info-row"><span>Monthly Revenue</span><strong>${financialSummary.monthlyRevenue !== null ? `₹${financialSummary.monthlyRevenue.toLocaleString('en-IN')}` : 'Not available'}</strong></div>
        <div class="info-row"><span>DSCR Ratio</span><strong>${financialSummary.debtServiceCoverageRatio !== null ? financialSummary.debtServiceCoverageRatio.toFixed(2) : 'Not available'}</strong></div>
      </div>
    </div>

    <!-- Sections -->
    <div class="sections-wrap">
      ${sectionsHtml}
    </div>

    <!-- Disclaimers -->
    <div class="disclaimer-card">
      <div class="info-card-title" style="margin-bottom: 10px;">Statutory Disclaimers & Institutional Disclosures</div>
      ${disclaimers.map(d => `
        <div class="disclaimer-item">
          <div class="disclaimer-title">${escape(d.title)}</div>
          <div>${escape(d.text)}</div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
`;
}
