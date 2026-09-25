/**
 * Phase 12: Action Center Service
 * 
 * Manages action persistence, verification status, and monitoring summaries
 * for authenticated and guest users.
 * 
 * Strict architectural rules:
 * - Does not recalculate financial, location, or scheme values.
 * - Actions are linked directly to saved plans.
 * - Server-side authorization ensures isolation between users.
 */

import {
  BusinessPlanAction,
  ActionCenterSummary,
  GenerateActionsParams
} from '../../src/types/actionCenter.ts';
import {
  generatePlanActions,
  calculateActionCenterSummary,
  generateActionListText
} from '../../src/utils/actionGenerator.ts';

export class ActionCenterService {
  // Map of planId -> BusinessPlanAction[]
  private actionsStore: Map<string, BusinessPlanAction[]> = new Map();
  // Map of planId -> ownerUserId (optional)
  private planOwners: Map<string, string | undefined> = new Map();

  /**
   * Resets in-memory store (useful for clean test execution)
   */
  public reset(): void {
    this.actionsStore.clear();
    this.planOwners.clear();
  }

  /**
   * Initializes or generates actions for a plan.
   */
  public generateOrGetActions(params: GenerateActionsParams, userId?: string): BusinessPlanAction[] {
    const existing = this.actionsStore.get(params.planId);
    if (existing && existing.length > 0) {
      return existing;
    }

    const generated = generatePlanActions(params);
    this.actionsStore.set(params.planId, generated);
    if (userId) {
      this.planOwners.set(params.planId, userId);
    }
    return generated;
  }

  /**
   * Retrieves actions for a planId with ownership check if plan is authenticated.
   */
  public getActions(planId: string, userId?: string): BusinessPlanAction[] {
    this.verifyOwnership(planId, userId);
    return this.actionsStore.get(planId) || [];
  }

  /**
   * Persists the entire list of actions for a plan.
   */
  public saveActions(planId: string, actions: BusinessPlanAction[], userId?: string): BusinessPlanAction[] {
    this.verifyOwnership(planId, userId);
    this.actionsStore.set(planId, actions);
    if (userId && !this.planOwners.has(planId)) {
      this.planOwners.set(planId, userId);
    }
    return actions;
  }

  /**
   * Updates a single action.
   */
  public updateAction(
    planId: string,
    actionId: string,
    updates: Partial<BusinessPlanAction>,
    userId?: string
  ): BusinessPlanAction {
    this.verifyOwnership(planId, userId);
    const actions = this.actionsStore.get(planId) || [];
    const index = actions.findIndex((a) => a.id === actionId);

    if (index < 0) {
      throw new Error(`Action with id ${actionId} not found for plan ${planId}`);
    }

    const existing = actions[index];
    const updated: BusinessPlanAction = {
      ...existing,
      ...updates,
      id: existing.id,
      planId: existing.planId,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    actions[index] = updated;
    this.actionsStore.set(planId, actions);
    return updated;
  }

  /**
   * Adds a new custom user action.
   */
  public addAction(
    planId: string,
    actionData: Partial<BusinessPlanAction>,
    userId?: string
  ): BusinessPlanAction {
    this.verifyOwnership(planId, userId);
    const actions = this.actionsStore.get(planId) || [];
    const now = new Date().toISOString();

    const newAction: BusinessPlanAction = {
      id: actionData.id || `${planId}_act_usr_${Date.now()}`,
      planId,
      title: (actionData.title || 'Custom Action').trim().substring(0, 160),
      description: actionData.description?.trim().substring(0, 1000),
      category: actionData.category || 'business_setup',
      source: 'user_added',
      sourceLabel: 'User Added Custom Action',
      sourceField: 'User Input / Custom Activity',
      guidanceType: 'user_added',
      status: actionData.status || 'not_started',
      priority: actionData.priority || 'normal',
      dueDate: actionData.dueDate,
      evidence: actionData.evidence,
      notes: actionData.notes,
      verificationDetails: actionData.verificationDetails,
      createdAt: now,
      updatedAt: now
    };

    actions.push(newAction);
    this.actionsStore.set(planId, actions);
    return newAction;
  }

  /**
   * Deletes an action by ID.
   */
  public deleteAction(planId: string, actionId: string, userId?: string): boolean {
    this.verifyOwnership(planId, userId);
    const actions = this.actionsStore.get(planId) || [];
    const filtered = actions.filter((a) => a.id !== actionId);
    if (filtered.length === actions.length) {
      return false;
    }
    this.actionsStore.set(planId, filtered);
    return true;
  }

  /**
   * Computes an ActionCenterSummary for a plan.
   */
  public getSummary(planId: string, userId?: string): ActionCenterSummary {
    this.verifyOwnership(planId, userId);
    const actions = this.actionsStore.get(planId) || [];
    return calculateActionCenterSummary(planId, actions);
  }

  /**
   * Exports plain text report for downloading.
   */
  public exportText(planId: string, planTitle: string, userId?: string): string {
    this.verifyOwnership(planId, userId);
    const actions = this.actionsStore.get(planId) || [];
    const summary = calculateActionCenterSummary(planId, actions);
    return generateActionListText(planTitle, summary, actions);
  }

  /**
   * Associates an owner with a plan.
   */
  public setPlanOwner(planId: string, userId: string) {
    this.planOwners.set(planId, userId);
  }

  public getPlanOwner(planId: string): string | undefined {
    return this.planOwners.get(planId);
  }

  public hasPlan(planId: string): boolean {
    return this.actionsStore.has(planId);
  }

  private verifyOwnership(planId: string, userId?: string) {
    const owner = this.planOwners.get(planId);
    if (owner && userId && owner !== userId) {
      throw new Error('Forbidden: You do not have permission to access or modify this action center.');
    }
  }
}

export const actionCenterService = new ActionCenterService();
