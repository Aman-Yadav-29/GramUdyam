import { ApiResponse, SystemHealthStatus } from '../types/api.ts';
import { 
  DiscoveryResult, 
  BusinessDiscoveryQuery, 
  EnterpriseIdea,
  BudgetDiscoveryResult,
  DiscoverySortOption
} from '../types/business.ts';
import { FinancialPlan, CapexBreakdown, OpexMonthlyBreakdown } from '../types/financial.ts';
import { GovernmentScheme, SchemeCalculationResult } from '../types/schemes.ts';
import { LoanProduct } from '../types/loans.ts';
import { DistrictIntelligence } from '../types/location.ts';
import { AuthSession, UserAccount } from '../types/auth.ts';

const SESSION_STORAGE_KEY = 'gramudyam_auth_session';

class ApiClient {
  private getAuthToken(): string | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string> || {})
    };

    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.error?.message) {
          errorMsg = errorData.error.message;
        }
      } catch {
        // use default HTTP error
      }
      throw new Error(errorMsg);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  // System & Health
  public async getHealth(): Promise<SystemHealthStatus> {
    return this.request<SystemHealthStatus>('/api/health');
  }

  public async getSystemInfo(): Promise<any> {
    return this.request<any>('/api/system/info');
  }

  // Business Discovery
  public async discoverByBudget(
    availableCapital: number, 
    sortBy: DiscoverySortOption = 'lowest_investment',
    location?: {
      state?: string;
      district?: string;
      subDistrictOrBlock?: string;
      villageOrTown?: string;
      locationType?: 'rural' | 'semi_urban' | 'urban';
    }
  ): Promise<BudgetDiscoveryResult> {
    return this.request<BudgetDiscoveryResult>('/api/business/discover-by-budget', {
      method: 'POST',
      body: JSON.stringify({
        availableCapital,
        sortBy,
        state: location?.state,
        district: location?.district,
        subDistrictOrBlock: location?.subDistrictOrBlock,
        villageOrTown: location?.villageOrTown,
        locationType: location?.locationType
      })
    });
  }

  public async discoverEnterprises(query: BusinessDiscoveryQuery): Promise<DiscoveryResult> {
    return this.request<DiscoveryResult>('/api/business/discover', {
      method: 'POST',
      body: JSON.stringify(query)
    });
  }

  public async getAllEnterprises(): Promise<EnterpriseIdea[]> {
    return this.request<EnterpriseIdea[]>('/api/business/all');
  }

  public async getEnterpriseById(id: string): Promise<EnterpriseIdea> {
    return this.request<EnterpriseIdea>(`/api/business/${id}`);
  }

  // Financial Engine
  public async calculateFinancialPlan(params: {
    enterpriseId: string;
    capitalAvailable: number;
    promoterCategory: 'general' | 'special';
    locationType: 'rural' | 'urban';
    state: string;
    district: string;
    scenario?: 'conservative' | 'base' | 'optimistic';
    customScaleUnits?: number;
  }): Promise<{
    plan: FinancialPlan;
    capex: CapexBreakdown;
    opex: OpexMonthlyBreakdown;
    emiAnalysis: any;
  }> {
    return this.request('/api/financial/plan', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Schemes
  public async getAllSchemes(): Promise<GovernmentScheme[]> {
    return this.request<GovernmentScheme[]>('/api/schemes');
  }

  public async evaluateScheme(params: {
    schemeCode: string;
    projectCost: number;
    promoterCategory: string;
    locationType: string;
    activityType: string;
  }): Promise<SchemeCalculationResult> {
    return this.request<SchemeCalculationResult>('/api/schemes/evaluate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Loans
  public async getAllLoans(): Promise<LoanProduct[]> {
    return this.request<LoanProduct[]>('/api/loans');
  }

  public async matchLoans(amount: number, special = false): Promise<Array<LoanProduct & { estimatedEmi: number }>> {
    return this.request<Array<LoanProduct & { estimatedEmi: number }>>(`/api/loans/match?amount=${amount}&special=${special}`);
  }

  // Location / GIS
  public async getDistrictData(state: string, district: string): Promise<DistrictIntelligence> {
    return this.request<DistrictIntelligence>(`/api/gis/district?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
  }

  public async getLocationMetadata(): Promise<{ states: string[] }> {
    return this.request<{ states: string[] }>('/api/gis/metadata');
  }

  // Auth Endpoints
  public async createGuestSession(): Promise<AuthSession> {
    return this.request<AuthSession>('/api/auth/guest', { method: 'POST' });
  }

  public async login(payload: { email: string; password?: string }): Promise<AuthSession> {
    return this.request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async register(payload: {
    name?: string;
    fullName?: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    state?: string;
    district?: string;
  }): Promise<AuthSession> {
    return this.request<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        name: payload.name ?? payload.fullName
      })
    });
  }

  public async getCurrentUser(): Promise<{ user: UserAccount; isGuest: boolean }> {
    return this.request<{ user: UserAccount; isGuest: boolean }>('/api/auth/me');
  }

  public async logout(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/auth/logout', {
      method: 'POST'
    });
  }

  // Advisory
  public async getAdvisory(payload: { enterpriseName: string; capital: number; district: string; state: string; promoterCategory: string }): Promise<{ advice: string; nextSteps: string[]; isAiGenerated: boolean }> {
    return this.request('/api/system/advisory', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

export const apiClient = new ApiClient();
