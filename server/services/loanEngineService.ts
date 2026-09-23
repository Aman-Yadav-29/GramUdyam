import { entityRepository } from '../models/schema.ts';
import { LoanProduct } from '../../src/types/loans.ts';
import { calculateEmi } from '../../src/utils/financialEngine.ts';

export class LoanEngineService {
  public getAllLoans(): LoanProduct[] {
    return entityRepository.getAllLoanProducts();
  }

  public matchLoanProducts(loanAmount: number, isWomanOrScSt = false): Array<LoanProduct & { estimatedEmi: number }> {
    const loans = entityRepository.getAllLoanProducts();
    const matched = loans.filter((l) => {
      // Must be within loan bounds
      const fitsAmount = loanAmount >= l.minLoanAmount && loanAmount <= l.maxLoanAmount;
      if (!fitsAmount) return false;
      if (l.category === 'stand_up_india' && !isWomanOrScSt) return false;
      return true;
    });

    return matched.map((product) => {
      const avgRate = (product.indicativeInterestRateMin + product.indicativeInterestRateMax) / 2;
      const emi = calculateEmi(loanAmount, avgRate, product.maxTenureMonths);
      return {
        ...product,
        estimatedEmi: emi.monthlyEmi
      };
    });
  }
}

export const loanEngineService = new LoanEngineService();
