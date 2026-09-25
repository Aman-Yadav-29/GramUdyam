import { Request, Response } from 'express';
import { loanEngineService } from '../services/loanEngineService.ts';
import { bankAppraisalService } from '../services/bankAppraisalService.ts';
import type { BankAppraisalRequest } from '../../src/types/bankAppraisal.ts';

export const getAllLoansHandler = async (_req: Request, res: Response) => {
  try {
    const loans = loanEngineService.getAllLoans();
    res.json({
      success: true,
      data: loans,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'LOAN_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const matchLoansHandler = async (req: Request, res: Response) => {
  try {
    const amount = Number(req.query.amount || req.body.amount || 500000);
    const isWomanOrScSt = req.query.special === 'true' || req.body.special === true;

    const matched = loanEngineService.matchLoanProducts(amount, isWomanOrScSt);
    res.json({
      success: true,
      data: matched,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'LOAN_MATCH_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

export const getBankAppraisalHandler = async (req: Request, res: Response) => {
  try {
    const payload: BankAppraisalRequest = req.body;
    if (!payload.enterpriseName || !payload.totalProjectCost) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'enterpriseName and totalProjectCost are required' },
        timestamp: new Date().toISOString()
      });
    }

    const dossier = bankAppraisalService.generateAppraisal(payload);
    res.json({
      success: true,
      data: dossier,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'APPRAISAL_ERROR', message: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

