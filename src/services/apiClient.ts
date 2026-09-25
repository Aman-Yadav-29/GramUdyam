import type { ApiResponse, SystemHealthStatus } from '../types/api.ts';
import type { DiscoveryResult, BusinessDiscoveryQuery, EnterpriseIdea, BudgetDiscoveryResult, DiscoverySortOption } from '../types/business.ts';
import type { FinancialPlan, CapexBreakdown, OpexMonthlyBreakdown } from '../types/financial.ts';
import type { GovernmentScheme, SchemeCalculationResult } from '../types/schemes.ts';
import type { SchemeMatchingInput, SchemeMatchingResult } from '../types/scheme.ts';
import type { SchemeReadinessPlan, UserDocumentDeclaration, SaveReadinessResponse } from '../types/documentReadiness.ts';
import type { LoanProduct } from '../types/loans.ts';
import type { DistrictIntelligence } from '../types/location.ts';
import type { AgriLocationAnalysis } from '../types/agriLocation.ts';
import type { AuthSession, UserAccount } from '../types/auth.ts';
import type { BusinessPlan, SavedBusinessPlanRecord, BusinessPlanNarrativeSection } from '../types/businessPlan.ts';
import type { BankAppraisalDossier, BankAppraisalRequest } from '../types/bankAppraisal.ts';
import type { BusinessPlanAction } from '../types/actionCenter.ts';
import type { ExecutionEvidence, CreateEvidenceInput, UpdateEvidenceInput } from '../types/executionEvidence.ts';
import type { ExecutionTimelineEvent, ExecutionMilestone, PlanHealthSummary, CreateUserNoteEventInput, UpdateUserNoteEventInput } from '../types/executionTimeline.ts';
import type { SubmissionPackage, GenerateSubmissionPackageParams, SubmissionPackageUserInputs } from '../types/submissionPackage.ts';

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

  // Phase 7: Deterministic Scheme & Loan Matching
  public async matchSchemes(input: SchemeMatchingInput): Promise<SchemeMatchingResult> {
    return this.request<SchemeMatchingResult>('/api/schemes/match', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  // Phase 8: Scheme Document Readiness & Application Workflow
  public async getSchemeReadiness(schemeId: string, params?: {
    eligibilityStatus?: string;
    businessName?: string;
    businessCategory?: string;
    projectCost?: number;
    availableCapital?: number;
    financingGap?: number;
    fixedAssets?: number;
    workingCapital?: number;
    monthlyRevenue?: number;
    monthlyOpex?: number;
    monthlyNetProfit?: number;
    estimatedEmi?: number;
    dscr?: number;
  }): Promise<SchemeReadinessPlan> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          query.set(k, String(v));
        }
      });
    }
    const qStr = query.toString();
    return this.request<SchemeReadinessPlan>(`/api/schemes/${schemeId}/readiness${qStr ? `?${qStr}` : ''}`);
  }

  public async saveSchemeReadiness(schemeId: string, declarations: Record<string, UserDocumentDeclaration>): Promise<SaveReadinessResponse> {
    return this.request<SaveReadinessResponse>('/api/schemes/readiness', {
      method: 'POST',
      body: JSON.stringify({ schemeId, declarations })
    });
  }

  // Loans
  public async getAllLoans(): Promise<LoanProduct[]> {
    return this.request<LoanProduct[]>('/api/loans');
  }

  public async matchLoans(amount: number, special = false): Promise<Array<LoanProduct & { estimatedEmi: number }>> {
    return this.request<Array<LoanProduct & { estimatedEmi: number }>>(`/api/loans/match?amount=${amount}&special=${special}`);
  }

  public async getBankAppraisal(payload: BankAppraisalRequest): Promise<BankAppraisalDossier> {
    return this.request<BankAppraisalDossier>('/api/loans/appraisal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }


  // Location / GIS
  public async getDistrictData(state: string, district: string): Promise<DistrictIntelligence> {
    return this.request<DistrictIntelligence>(`/api/gis/district?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`);
  }

  public async getLocationMetadata(): Promise<{ states: string[] }> {
    return this.request<{ states: string[] }>('/api/gis/metadata');
  }

  // Phase 6: Agriculture Location Intelligence
  public async getAgriLocationAnalysis(params: {
    businessId: string;
    state: string;
    district: string;
    subDistrictOrBlock?: string;
    villageOrTown?: string;
    locationType?: 'rural' | 'semi_urban' | 'urban';
  }): Promise<AgriLocationAnalysis | null> {
    const query = new URLSearchParams({
      businessId: params.businessId,
      state: params.state,
      district: params.district,
      ...(params.subDistrictOrBlock ? { subDistrictOrBlock: params.subDistrictOrBlock } : {}),
      ...(params.villageOrTown ? { villageOrTown: params.villageOrTown } : {}),
      ...(params.locationType ? { locationType: params.locationType } : {})
    });
    return this.request<AgriLocationAnalysis | null>(`/api/gis/agri-analysis?${query.toString()}`);
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

  // Phase 9 & 10: Business & Financing Plan and Workspace
  public async generateBusinessPlan(payload: any): Promise<BusinessPlan> {
    const res = await this.request<{ success: boolean; plan: BusinessPlan }>('/api/business-plans/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.plan;
  }

  public async saveBusinessPlan(plan: BusinessPlan, title?: string): Promise<SavedBusinessPlanRecord> {
    const res = await this.request<{ success: boolean; record: SavedBusinessPlanRecord }>('/api/business-plans/save', {
      method: 'POST',
      body: JSON.stringify({ plan, title })
    });
    return res.record;
  }

  public async getUserBusinessPlans(statusFilter?: 'all' | 'active' | 'archived'): Promise<SavedBusinessPlanRecord[]> {
    const query = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    const res = await this.request<{ success: boolean; plans: SavedBusinessPlanRecord[] }>(`/api/business-plans${query}`);
    return res.plans || [];
  }

  public async getBusinessPlanById(id: string): Promise<SavedBusinessPlanRecord> {
    const res = await this.request<{ success: boolean; record: SavedBusinessPlanRecord }>(`/api/business-plans/${id}`);
    return res.record;
  }

  public async updateBusinessPlanNarrative(
    id: string,
    narrative: BusinessPlanNarrativeSection
  ): Promise<SavedBusinessPlanRecord> {
    const res = await this.request<{ success: boolean; record: SavedBusinessPlanRecord }>(`/api/business-plans/${id}/narrative`, {
      method: 'PATCH',
      body: JSON.stringify({ narrative })
    });
    return res.record;
  }

  public async updateBusinessPlanStatus(
    id: string,
    status: 'active' | 'archived'
  ): Promise<SavedBusinessPlanRecord> {
    const res = await this.request<{ success: boolean; record: SavedBusinessPlanRecord }>(`/api/business-plans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.record;
  }

  public async updateBusinessPlanTitle(
    id: string,
    title: string
  ): Promise<SavedBusinessPlanRecord> {
    const res = await this.request<{ success: boolean; record: SavedBusinessPlanRecord }>(`/api/business-plans/${id}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title })
    });
    return res.record;
  }

  public async deleteBusinessPlan(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/business-plans/${id}`, {
      method: 'DELETE'
    });
  }

  public async createPlanShareToken(id: string): Promise<{ shareToken: string; shareUrl: string }> {
    return this.request<{ success: boolean; shareToken: string; shareUrl: string }>(`/api/business-plans/${id}/share`, {
      method: 'POST'
    });
  }

  public async revokePlanShareToken(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/business-plans/${id}/share`, {
      method: 'DELETE'
    });
  }

  public async getSharedPlan(token: string): Promise<{
    title: string;
    createdAt: string;
    updatedAt: string;
    plan: BusinessPlan;
    shareToken: string;
  }> {
    const res = await this.request<{
      success: boolean;
      data: {
        title: string;
        createdAt: string;
        updatedAt: string;
        plan: BusinessPlan;
        shareToken: string;
      };
    }>(`/api/business-plans/shared/${token}`);
    return res.data;
  }

  // Phase 12: Action Center
  public async getActions(planId: string): Promise<BusinessPlanAction[]> {
    const res = await this.request<{ success: boolean; data: BusinessPlanAction[] }>(`/api/action-center/${planId}`);
    return res.data || [];
  }

  public async saveActions(planId: string, actions: BusinessPlanAction[]): Promise<BusinessPlanAction[]> {
    const res = await this.request<{ success: boolean; data: BusinessPlanAction[] }>(`/api/action-center/${planId}`, {
      method: 'POST',
      body: JSON.stringify({ actions })
    });
    return res.data || [];
  }

  // Phase 13: Execution Evidence & Progress Records
  public async createEvidence(input: CreateEvidenceInput): Promise<ExecutionEvidence> {
    const res = await this.request<{ success: boolean; data: ExecutionEvidence }>('/api/execution-evidence', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return res.data;
  }

  public async getEvidenceByAction(actionId: string, planId: string): Promise<ExecutionEvidence[]> {
    const res = await this.request<{ success: boolean; data: ExecutionEvidence[] }>(
      `/api/execution-evidence/action/${actionId}?planId=${encodeURIComponent(planId)}`
    );
    return res.data || [];
  }

  public async getEvidenceByPlan(planId: string): Promise<ExecutionEvidence[]> {
    const res = await this.request<{ success: boolean; data: ExecutionEvidence[] }>(
      `/api/execution-evidence/plan/${encodeURIComponent(planId)}`
    );
    return res.data || [];
  }

  public async getEvidenceById(id: string): Promise<ExecutionEvidence> {
    const res = await this.request<{ success: boolean; data: ExecutionEvidence }>(
      `/api/execution-evidence/${encodeURIComponent(id)}`
    );
    return res.data;
  }

  public async updateEvidence(id: string, updates: UpdateEvidenceInput): Promise<ExecutionEvidence> {
    const res = await this.request<{ success: boolean; data: ExecutionEvidence }>(
      `/api/execution-evidence/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }
    );
    return res.data;
  }

  public async deleteEvidence(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean; data: { deleted: boolean } }>(
      `/api/execution-evidence/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    );
    return res.data?.deleted ?? true;
  }

  // Phase 14: Execution Timeline, Milestones & Plan Health
  public async getExecutionTimeline(planId: string): Promise<ExecutionTimelineEvent[]> {
    const res = await this.request<{ success: boolean; data: ExecutionTimelineEvent[] }>(
      `/api/execution-timeline/${encodeURIComponent(planId)}`
    );
    return res.data || [];
  }

  public async createTimelineEvent(input: CreateUserNoteEventInput): Promise<ExecutionTimelineEvent> {
    const res = await this.request<{ success: boolean; data: ExecutionTimelineEvent }>(
      '/api/execution-timeline/events',
      {
        method: 'POST',
        body: JSON.stringify(input)
      }
    );
    return res.data;
  }

  public async updateTimelineEvent(
    eventId: string,
    updates: UpdateUserNoteEventInput
  ): Promise<ExecutionTimelineEvent> {
    const res = await this.request<{ success: boolean; data: ExecutionTimelineEvent }>(
      `/api/execution-timeline/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }
    );
    return res.data;
  }

  public async deleteTimelineEvent(eventId: string): Promise<boolean> {
    const res = await this.request<{ success: boolean; data: { deleted: boolean } }>(
      `/api/execution-timeline/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE'
      }
    );
    return res.data?.deleted ?? true;
  }

  public async getExecutionMilestones(planId: string): Promise<ExecutionMilestone[]> {
    const res = await this.request<{ success: boolean; data: ExecutionMilestone[] }>(
      `/api/execution-timeline/${encodeURIComponent(planId)}/milestones`
    );
    return res.data || [];
  }

  public async getPlanHealth(planId: string): Promise<PlanHealthSummary> {
    const res = await this.request<{ success: boolean; data: PlanHealthSummary }>(
      `/api/execution-timeline/${encodeURIComponent(planId)}/health`
    );
    return res.data;
  }

  // Phase 15: Submission Package Generator & Dossier Management
  public async generateSubmissionPackage(params: GenerateSubmissionPackageParams): Promise<SubmissionPackage> {
    const res = await this.request<{ success: boolean; data: SubmissionPackage }>(
      '/api/submission-packages/generate',
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
    return res.data;
  }

  public async getSubmissionPackage(packageId: string): Promise<SubmissionPackage> {
    const res = await this.request<{ success: boolean; data: SubmissionPackage }>(
      `/api/submission-packages/${encodeURIComponent(packageId)}`
    );
    return res.data;
  }

  public async getSubmissionPackagesForPlan(planId: string): Promise<SubmissionPackage[]> {
    const res = await this.request<{ success: boolean; data: SubmissionPackage[] }>(
      `/api/submission-packages/plan/${encodeURIComponent(planId)}`
    );
    return res.data || [];
  }

  public async updateSubmissionPackageUserInputs(
    packageId: string,
    inputs: SubmissionPackageUserInputs
  ): Promise<SubmissionPackage> {
    const res = await this.request<{ success: boolean; data: SubmissionPackage }>(
      `/api/submission-packages/${encodeURIComponent(packageId)}/user-inputs`,
      {
        method: 'PATCH',
        body: JSON.stringify(inputs)
      }
    );
    return res.data;
  }

  public async deleteSubmissionPackage(packageId: string): Promise<boolean> {
    const res = await this.request<{ success: boolean; data: { deleted: boolean } }>(
      `/api/submission-packages/${encodeURIComponent(packageId)}`,
      {
        method: 'DELETE'
      }
    );
    return res.data?.deleted ?? true;
  }

  public async exportSubmissionPackageText(packageId: string): Promise<string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(`/api/submission-packages/${encodeURIComponent(packageId)}/export/text`, { headers });
    if (!res.ok) throw new Error(`Failed to export package text: HTTP ${res.status}`);
    return res.text();
  }

  public async exportSubmissionPackageHtml(packageId: string): Promise<string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(`/api/submission-packages/${encodeURIComponent(packageId)}/export/html`, { headers });
    if (!res.ok) throw new Error(`Failed to export package html: HTTP ${res.status}`);
    return res.text();
  }
}

export const apiClient = new ApiClient();
