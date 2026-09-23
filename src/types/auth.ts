export interface UserAccount {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  isGuest: boolean;
  state?: string;
  district?: string;
  createdAt: string;
}

export interface AuthSession {
  user: UserAccount;
  token?: string;
  expiresAt: string;
}

export interface SavedBusinessPlan {
  id: string;
  userId: string;
  title: string;
  enterpriseId: string;
  enterpriseName: string;
  state: string;
  district: string;
  capitalAvailable: number;
  totalProjectCost: number;
  bankLoanAmount: number;
  subsidyAmount: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'dpr_ready' | 'applied';
}
