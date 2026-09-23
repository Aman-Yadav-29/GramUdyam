import { LoanProduct } from '../types/loans.ts';

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'loan_mudra_shishu',
    name: 'PMMY Shishu Micro Loan',
    lenderType: 'public_sector_bank',
    category: 'mudra_shishu',
    minLoanAmount: 10000,
    maxLoanAmount: 50000,
    indicativeInterestRateMin: 8.5,
    indicativeInterestRateMax: 10.5,
    maxTenureMonths: 36,
    moratoriumMonths: 3,
    collateralRequired: false,
    creditGuaranteeCover: 'CGFMU (100% Credit Guarantee)',
    processingFeePercent: 0,
    requiredDocuments: [
      'Aadhaar Card / Voter ID',
      'Proof of Residence',
      'Quotation of machinery/items to be purchased',
      'Bank Account Statement (6 months)'
    ]
  },
  {
    id: 'loan_mudra_kishore',
    name: 'PMMY Kishore Business Loan',
    lenderType: 'public_sector_bank',
    category: 'mudra_kishore',
    minLoanAmount: 50001,
    maxLoanAmount: 500000,
    indicativeInterestRateMin: 9.0,
    indicativeInterestRateMax: 11.5,
    maxTenureMonths: 60,
    moratoriumMonths: 6,
    collateralRequired: false,
    creditGuaranteeCover: 'CGFMU (Credit Guarantee Fund for Micro Units)',
    processingFeePercent: 0.5,
    requiredDocuments: [
      'KYC documents & PAN Card',
      'Business Registration / Udyam Certificate',
      'Past 6 months bank statement',
      'Machinery supplier quotation & estimated balance sheet'
    ]
  },
  {
    id: 'loan_mudra_tarun',
    name: 'PMMY Tarun Enterprise Term Loan',
    lenderType: 'public_sector_bank',
    category: 'mudra_tarun',
    minLoanAmount: 500001,
    maxLoanAmount: 2000000,
    indicativeInterestRateMin: 9.5,
    indicativeInterestRateMax: 12.0,
    maxTenureMonths: 84,
    moratoriumMonths: 6,
    collateralRequired: false,
    creditGuaranteeCover: 'CGFMU Coverage up to ₹20 Lakhs',
    processingFeePercent: 0.5,
    requiredDocuments: [
      'Udyam Registration',
      'Last 2 years ITR / Projected financials',
      'Detailed Project Profile',
      'Tax registration (GST if applicable)',
      '12-month operative bank statement'
    ]
  },
  {
    id: 'loan_rrb_msme',
    name: 'Regional Rural Bank (RRB) Enterprise Credit',
    lenderType: 'regional_rural_bank',
    category: 'msme_term_loan',
    minLoanAmount: 200000,
    maxLoanAmount: 5000000,
    indicativeInterestRateMin: 9.25,
    indicativeInterestRateMax: 11.75,
    maxTenureMonths: 84,
    moratoriumMonths: 12,
    collateralRequired: false,
    creditGuaranteeCover: 'CGTMSE Coverage (up to 85%)',
    processingFeePercent: 0.75,
    requiredDocuments: [
      'Proof of identity & residence',
      'Detailed Project Report (DPR)',
      'Quotations for plant & machinery',
      'Village Panchayat / Municipal NOC',
      'Land revenue records / Lease deed'
    ]
  },
  {
    id: 'loan_standup_bank',
    name: 'Stand-Up India Composite Bank Loan',
    lenderType: 'public_sector_bank',
    category: 'stand_up_india',
    minLoanAmount: 1000000,
    maxLoanAmount: 10000000,
    indicativeInterestRateMin: 8.75,
    indicativeInterestRateMax: 10.75,
    maxTenureMonths: 84,
    moratoriumMonths: 18,
    collateralRequired: false,
    creditGuaranteeCover: 'NCGTC Stand-Up India Guarantee Scheme',
    processingFeePercent: 0.5,
    requiredDocuments: [
      'Caste Certificate (for SC/ST) or Proof of Woman Entrepreneurship',
      'Comprehensive Detailed Project Report (DPR)',
      'Udyam Registration Certificate',
      'Audited Financials / CA Net Worth Certificate',
      'Pollution Control Board NOC (if applicable)'
    ]
  }
];
