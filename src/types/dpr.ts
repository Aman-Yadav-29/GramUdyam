export interface DprSection {
  id: string;
  title: string;
  content: string;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}

export interface DetailedProjectReport {
  id: string;
  projectTitle: string;
  promoterName: string;
  location: {
    district: string;
    state: string;
    locationType: 'rural' | 'urban';
  };
  executiveSummary: string;
  industryOverview: string;
  marketPotentialAndDemand: string;
  technicalFeasibility: {
    rawMaterials: string[];
    machineryRequired: Array<{ name: string; capacity: string; cost: number }>;
    utilities: { powerHp: number; waterLpd: number; fuel: string };
    manpowerRequired: Array<{ role: string; count: number; monthlySalary: number }>;
  };
  financialSummary: {
    totalCapitalCost: number;
    promoterEquity: number;
    bankDebt: number;
    subsidyExpected: number;
    internalRateOfReturn: number;
    dscrAverage: number;
    breakEvenPoint: number;
  };
  implementationScheduleMonths: number;
  statutoryCompliances: string[];
  createdAt: string;
}
