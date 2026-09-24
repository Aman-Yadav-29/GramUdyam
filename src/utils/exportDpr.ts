/**
 * DPR Export Engine
 * 
 * Generates standalone, print-ready, professional bank-format exports
 * for the 25-section Detailed Project Report (DPR).
 * 
 * Formats supported:
 * 1. Printable HTML (.html) — formatted for A4 printing / PDF export.
 * 2. Structured Text (.txt) — structured for copy-paste or word processor import.
 * 3. Clipboard copy.
 */

import { DetailedProjectReport } from '../types/dpr.ts';
import { formatINR } from './formatters.ts';

export function downloadDprBlob(filename: string, content: string, mimeType: string): void {
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

export function generateDprHtml(dpr: DetailedProjectReport): string {
  const escape = (str?: string | number) => (str !== undefined && str !== null ? String(str) : '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const { metadata, financialSummary, sections, disclosures } = dpr;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(metadata.projectTitle)}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
      @bottom-right {
        content: counter(page);
        font-size: 8pt;
        color: #6b7280;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1c1917;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
      margin: 0;
      padding: 24px;
    }
    .print-actions {
      margin-bottom: 24px;
      display: flex;
      gap: 10px;
    }
    .btn {
      background: #047857;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      border-radius: 6px;
      font-size: 9.5pt;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    .report-cover {
      border-bottom: 3px solid #065f46;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .top-badge {
      display: inline-block;
      background: #d1fae5;
      color: #064e3b;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 20pt;
      margin: 4px 0 8px 0;
      color: #111827;
      line-height: 1.25;
    }
    .meta-line {
      font-size: 9.5pt;
      color: #4b5563;
      margin-bottom: 4px;
    }
    .meta-line strong {
      color: #111827;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0 28px 0;
    }
    .kpi-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .kpi-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 13pt;
      font-weight: 800;
      color: #065f46;
      margin-top: 3px;
    }
    .kpi-sub {
      font-size: 7.5pt;
      color: #9ca3af;
      margin-top: 2px;
    }
    .toc-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 30px;
      page-break-after: always;
    }
    .toc-title {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .toc-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 24px;
      font-size: 8.5pt;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      color: #334155;
    }
    .section-card {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .section-header {
      border-bottom: 1.5px solid #065f46;
      padding-bottom: 4px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    h2 {
      font-size: 12.5pt;
      color: #065f46;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .section-cat {
      font-size: 7.5pt;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 2px 6px;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .section-subtitle {
      font-size: 9pt;
      font-weight: 600;
      color: #4b5563;
      margin: -4px 0 8px 0;
    }
    p {
      margin: 6px 0;
      line-height: 1.55;
      text-align: justify;
    }
    ul, ol {
      margin: 6px 0 10px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 8.5pt;
    }
    th, td {
      padding: 6px 10px;
      border: 1px solid #e5e7eb;
      text-align: left;
    }
    th {
      background: #f3f4f6;
      font-weight: 700;
      color: #1f2937;
    }
    tfoot td {
      background: #f9fafb;
      font-weight: 700;
      color: #111827;
      border-top: 2px solid #9ca3af;
    }
    .metric-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 10px 0;
    }
    .metric-badge {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 8pt;
    }
    .metric-badge strong {
      color: #065f46;
    }
    .disclaimer-container {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #d97706;
      border-radius: 6px;
      padding: 12px 16px;
      margin-top: 30px;
      font-size: 8pt;
      color: #78350f;
      page-break-inside: avoid;
    }
    .disclaimer-container h3 {
      font-size: 9pt;
      margin: 0 0 6px 0;
      color: #92400e;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 0; }
      .print-actions { display: none; }
      .section-card { page-break-inside: avoid; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="report-cover">
    <span class="top-badge">Detailed Project Report (DPR) — DIC &amp; Banking Format</span>
    <h1>${escape(metadata.projectTitle)}</h1>
    <div class="meta-line">
      Enterprise Activity: <strong>${escape(metadata.enterpriseCategory.replace('_', ' ').toUpperCase())}</strong> &bull; Proposed Scale: <strong>${escape(metadata.scale)}</strong>
    </div>
    <div class="meta-line">
      Proposed Location: <strong>${escape(metadata.location.district)}, ${escape(metadata.location.state)} (${escape(metadata.location.locationType.toUpperCase())})</strong>
    </div>
    <div class="meta-line">
      Promoter: <strong>${escape(metadata.promoterName)} (${escape(metadata.promoterCategory)})</strong> &bull; Generated: <strong>${new Date(metadata.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> &bull; Report ID: <strong>${escape(metadata.reportId)}</strong>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Capital Outlay</div>
      <div class="kpi-value">${escape(formatINR(financialSummary.totalProjectCost))}</div>
      <div class="kpi-sub">CapEx + Working Capital</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Promoter Equity (${escape(financialSummary.promoterContributionPercent)}%)</div>
      <div class="kpi-value">${escape(formatINR(financialSummary.promoterContribution))}</div>
      <div class="kpi-sub">Available Own Funds</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Financing Gap (Debt)</div>
      <div class="kpi-value">${escape(formatINR(financialSummary.financingGap))}</div>
      <div class="kpi-sub">Bank Loan / Subsidy Linkage</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Monthly Net Profit (PAT)</div>
      <div class="kpi-value">${escape(formatINR(financialSummary.monthlyNetProfit))}</div>
      <div class="kpi-sub">DSCR: ${financialSummary.debtServiceCoverageRatio ? `${financialSummary.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}</div>
    </div>
  </div>

  <div class="toc-box">
    <div class="toc-title">Table of Contents (25 Standardized DPR Chapters)</div>
    <div class="toc-grid">
      ${sections.map((s) => `
        <div class="toc-item">
          <span>${escape(s.title)}</span>
          <span style="color:#94a3b8;">${escape(s.categoryLabel)}</span>
        </div>
      `).join('')}
    </div>
  </div>

  ${sections.map((s) => `
    <div class="section-card" id="${escape(s.id)}">
      <div class="section-header">
        <h2>${escape(s.title)}</h2>
        <span class="section-cat">${escape(s.categoryLabel)}</span>
      </div>
      <div class="section-subtitle">${escape(s.subtitle)}</div>
      
      ${s.paragraphs.map((p) => `<p>${escape(p)}</p>`).join('')}

      ${s.bulletPoints && s.bulletPoints.length > 0 ? `
        <ul>
          ${s.bulletPoints.map((b) => `<li>${escape(b)}</li>`).join('')}
        </ul>
      ` : ''}

      ${s.metrics && s.metrics.length > 0 ? `
        <div class="metric-row">
          ${s.metrics.map((m) => `
            <div class="metric-badge">
              <span>${escape(m.label)}:</span> <strong>${escape(m.value)}</strong>
              ${m.note ? `<span style="color:#6b7280;">(${escape(m.note)})</span>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${s.tables && s.tables.length > 0 ? s.tables.map((t) => `
        <table>
          <thead>
            <tr>
              ${t.headers.map((h) => `<th>${escape(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${t.rows.map((row) => `
              <tr>
                ${row.map((cell) => `<td>${escape(cell)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
          ${t.footers && t.footers.length > 0 ? `
            <tfoot>
              <tr>
                ${t.footers.map((f) => `<td>${escape(f)}</td>`).join('')}
              </tr>
            </tfoot>
          ` : ''}
        </table>
        ${t.notes ? `<div style="font-size:7.5pt;color:#6b7280;margin-top:-6px;margin-bottom:8px;"><em>Note: ${escape(t.notes)}</em></div>` : ''}
      `).join('') : ''}
    </div>
  `).join('')}

  <div class="disclaimer-container">
    <h3>Statutory Banking &amp; Regulatory Disclosures</h3>
    ${disclosures.map((d) => `
      <p style="margin:4px 0;"><strong>[${escape(d.title)}]:</strong> ${escape(d.text)}</p>
    `).join('')}
  </div>
</body>
</html>`;
}

export function generateDprText(dpr: DetailedProjectReport): string {
  const { metadata, financialSummary, sections, disclosures } = dpr;
  const lines: string[] = [];

  lines.push('================================================================================');
  lines.push('                  GRAMUDYAM — DETAILED PROJECT REPORT (DPR)');
  lines.push('            Standardized 25-Section Project Report for Bank & DIC');
  lines.push('================================================================================');
  lines.push(`Project Title: ${metadata.projectTitle}`);
  lines.push(`Activity: ${metadata.enterpriseCategory.toUpperCase()} | Scale: ${metadata.scale}`);
  lines.push(`Location: ${metadata.location.district}, ${metadata.location.state} (${metadata.location.locationType.toUpperCase()})`);
  lines.push(`Promoter: ${metadata.promoterName} (${metadata.promoterCategory})`);
  lines.push(`Generated: ${new Date(metadata.generatedAt).toLocaleString('en-IN')} | Report ID: ${metadata.reportId}`);
  lines.push('================================================================================');
  lines.push('');
  lines.push('EXECUTIVE CAPITAL SUMMARY:');
  lines.push(`• Total Project Outlay: ${formatINR(financialSummary.totalProjectCost)}`);
  lines.push(`• Promoter Margin (${financialSummary.promoterContributionPercent}%): ${formatINR(financialSummary.promoterContribution)}`);
  lines.push(`• Bank Debt Requirement (Financing Gap): ${formatINR(financialSummary.financingGap)}`);
  lines.push(`• Projected Monthly Revenue: ${formatINR(financialSummary.monthlyRevenue)}`);
  lines.push(`• Projected Monthly Net Profit: ${formatINR(financialSummary.monthlyNetProfit)}`);
  lines.push(`• Debt Service Coverage Ratio (DSCR): ${financialSummary.debtServiceCoverageRatio ? `${financialSummary.debtServiceCoverageRatio.toFixed(2)}x` : 'N/A'}`);
  lines.push(`• Break-Even Capacity: ${financialSummary.breakEvenCapacityPercent ? `${financialSummary.breakEvenCapacityPercent.toFixed(1)}%` : 'N/A'}`);
  lines.push('');
  lines.push('================================================================================');
  lines.push('                             REPORT SECTIONS (1 TO 25)');
  lines.push('================================================================================');
  lines.push('');

  sections.forEach((sec) => {
    lines.push('--------------------------------------------------------------------------------');
    lines.push(`${sec.title.toUpperCase()} [${sec.categoryLabel.toUpperCase()}]`);
    lines.push(`Subtitle: ${sec.subtitle}`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push('');
    sec.paragraphs.forEach((p) => {
      lines.push(p);
      lines.push('');
    });

    if (sec.bulletPoints && sec.bulletPoints.length > 0) {
      sec.bulletPoints.forEach((b) => lines.push(`• ${b}`));
      lines.push('');
    }

    if (sec.metrics && sec.metrics.length > 0) {
      lines.push('KEY METRICS:');
      sec.metrics.forEach((m) => {
        lines.push(`  - ${m.label}: ${m.value}${m.note ? ` (${m.note})` : ''}`);
      });
      lines.push('');
    }

    if (sec.tables && sec.tables.length > 0) {
      sec.tables.forEach((t) => {
        lines.push(`TABLE: ${t.title}`);
        lines.push(`  ${t.headers.join(' | ')}`);
        lines.push(`  ${t.headers.map(() => '----------------').join(' | ')}`);
        t.rows.forEach((row) => {
          lines.push(`  ${row.join(' | ')}`);
        });
        if (t.footers && t.footers.length > 0) {
          lines.push(`  ${t.footers.join(' | ')}`);
        }
        lines.push('');
      });
    }

    lines.push(`Source of Truth: ${sec.sourceOfTruth}`);
    lines.push('');
  });

  lines.push('================================================================================');
  lines.push('                       STATUTORY & BANKING DISCLOSURES');
  lines.push('================================================================================');
  disclosures.forEach((d) => {
    lines.push(`[${d.title}]`);
    lines.push(d.text);
    lines.push('');
  });
  lines.push('================================================================================');
  lines.push('DISCLAIMER: Formatted by GramUdyam. Suitable for bank appraisal and DIC filing.');
  lines.push('================================================================================');

  return lines.join('\n');
}

export function downloadDprAsHtml(dpr: DetailedProjectReport): void {
  const html = generateDprHtml(dpr);
  const cleanTitle = dpr.metadata.enterpriseId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadDprBlob(`${cleanTitle}_dpr_business_plan.html`, html, 'text/html;charset=utf-8');
}

export function downloadDprAsText(dpr: DetailedProjectReport): void {
  const text = generateDprText(dpr);
  const cleanTitle = dpr.metadata.enterpriseId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadDprBlob(`${cleanTitle}_dpr_business_plan.txt`, text, 'text/plain;charset=utf-8');
}

export async function copyDprToClipboard(dpr: DetailedProjectReport): Promise<boolean> {
  try {
    const text = generateDprText(dpr);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy DPR to clipboard:', err);
    return false;
  }
}
