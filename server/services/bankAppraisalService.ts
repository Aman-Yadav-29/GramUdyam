import {
  BankAppraisalDossier,
  BankAppraisalRequest
} from '../../src/types/bankAppraisal.ts';
import {
  generateBankAppraisalDossier,
  generateBankDossierPlainText,
  generateBankDossierHtml
} from '../../src/utils/bankAppraisalEngine.ts';

export class BankAppraisalService {
  /**
   * Generates a deterministic bank credit appraisal dossier
   * strictly consuming Phase 4 financial metrics as immutable truth.
   */
  public generateAppraisal(req: BankAppraisalRequest): BankAppraisalDossier {
    return generateBankAppraisalDossier(req);
  }

  /**
   * Exports plain text banker's appraisal summary for clipboard or terminal output.
   */
  public exportText(dossier: BankAppraisalDossier): string {
    return generateBankDossierPlainText(dossier);
  }

  /**
   * Exports printable HTML banker's desk review document.
   */
  public exportHtml(dossier: BankAppraisalDossier): string {
    return generateBankDossierHtml(dossier);
  }
}

export const bankAppraisalService = new BankAppraisalService();
