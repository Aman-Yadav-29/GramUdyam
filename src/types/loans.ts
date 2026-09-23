export type LenderCategory = 'public_sector_bank' | 'regional_rural_bank' | 'small_finance_bank' | 'mfi_nbfc';

export interface LoanProduct {
  id: string;
  name: string;
  lenderType: LenderCategory;
  category: 'mudra_shishu' | 'mudra_kishore' | 'mudra_tarun' | 'msme_term_loan' | 'stand_up_india' | 'kisan_credit_card_allied';
  minLoanAmount: number;
  maxLoanAmount: number;
  indicativeInterestRateMin: number;
  indicativeInterestRateMax: number;
  maxTenureMonths: number;
  moratoriumMonths: number;
  collateralRequired: boolean;
  creditGuaranteeCover: string; // e.g., "CGFMU (100% guarantee)" or "CGTMSE (up to 85%)"
  processingFeePercent: number;
  requiredDocuments: string[];
}

export interface LoanEmiCalculation {
  loanAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterestPayable: number;
  totalPayment: number;
}
