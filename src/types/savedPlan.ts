import { BusinessPlan } from './businessPlan.ts';

export type PlanStatus = 'active' | 'archived';
export type PlanOwnerType = 'authenticated' | 'guest';

export interface PlanShareSettings {
  isShared: boolean;
  shareToken?: string;
  sharedAt?: string;
}

export interface SavedBusinessPlan {
  id: string;
  planVersion: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  ownerType: PlanOwnerType;
  userId?: string;
  isGuest: boolean;
  businessId: string;
  businessName: string;
  projectCost: number;
  availableCapital: number;
  financingGap: number;
  state: string;
  district: string;
  plan: BusinessPlan;
  status: PlanStatus;
  narrativeEditable: boolean;
  shareSettings?: PlanShareSettings;
}

export interface SavedPlanListItem {
  id: string;
  planVersion: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  ownerType: PlanOwnerType;
  userId?: string;
  isGuest: boolean;
  businessId: string;
  businessName: string;
  businessCategory?: string;
  proposedScale?: string;
  projectCost: number;
  availableCapital: number;
  financingGap: number;
  state: string;
  district: string;
  status: PlanStatus;
  narrativeEditable: boolean;
  isShared: boolean;
  shareToken?: string;
}
