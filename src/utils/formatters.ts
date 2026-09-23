/**
 * Standard Indian Rupee (INR) formatters and presentation utilities.
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatINRLakhs(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(2)} Lakh`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k.toFixed(1)}k`;
  }
  return formatINR(amount);
}

export function formatPercent(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0%';
  }
  return `${value.toFixed(1)}%`;
}

export function formatRatio(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.00';
  }
  return value.toFixed(2);
}
