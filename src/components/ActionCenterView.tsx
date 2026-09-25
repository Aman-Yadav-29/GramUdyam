import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Printer,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  Building2,
  Landmark,
  FileText,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Trash2,
  Calendar,
  Layers,
  Flag
} from 'lucide-react';
import {
  BusinessPlanAction,
  ActionCategory,
  ActionStatus,
  ActionPriority,
  ActionMilestone,
  ActionCenterSummary,
  ActionFilterOptions
} from '../types/actionCenter.ts';
import {
  generatePlanActions,
  calculateMilestones,
  calculateActionCenterSummary,
  filterActions,
  generateActionListText,
  CATEGORY_LABELS,
  GUIDANCE_TYPE_LABELS,
  GenerateActionsParams
} from '../utils/actionGenerator.ts';
import {
  getGuestPlanActions,
  saveGuestPlanActions,
  updateGuestPlanAction,
  addGuestPlanAction,
  deleteGuestPlanAction,
  getGuestPlanEvidence,
  saveGuestPlanEvidence,
  addGuestActionEvidence,
  updateGuestActionEvidence,
  deleteGuestActionEvidence
} from '../utils/guestStorage.ts';
import {
  ExecutionEvidence,
  EvidenceType,
  EVIDENCE_TYPE_LABELS,
  EVIDENCE_TYPE_DESCRIPTIONS,
  EVIDENCE_USER_DISCLAIMER
} from '../types/executionEvidence.ts';
import { apiClient } from '../services/apiClient.ts';

interface ActionCenterViewProps {
  planId: string;
  planTitle?: string;
  enterprise: GenerateActionsParams['enterprise'];
  financialPlan: GenerateActionsParams['financialPlan'];
  location: GenerateActionsParams['location'];
  districtData?: GenerateActionsParams['districtData'];
  agriAnalysis?: GenerateActionsParams['agriAnalysis'];
  matchedSchemes?: GenerateActionsParams['matchedSchemes'];
  isGuest?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const ActionCenterView: React.FC<ActionCenterViewProps> = ({
  planId,
  planTitle,
  enterprise,
  financialPlan,
  location,
  districtData,
  agriAnalysis,
  matchedSchemes,
  isGuest = true,
  onNavigateTab
}) => {
  // State for actions
  const [actions, setActions] = useState<BusinessPlanAction[]>([]);
  const [planEvidence, setPlanEvidence] = useState<ExecutionEvidence[]>([]);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMilestoneFilter, setSelectedMilestoneFilter] = useState<string | null>(null);

  // Evidence Modal State (Phase 13)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceTargetActionId, setEvidenceTargetActionId] = useState<string | null>(null);
  const [editingEvidence, setEditingEvidence] = useState<ExecutionEvidence | null>(null);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('note');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceReferenceNumber, setEvidenceReferenceNumber] = useState('');
  const [evidenceEventDate, setEvidenceEventDate] = useState('');
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ActionCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | 'all'>('all');

  // New action form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ActionCategory>('business_setup');
  const [newPriority, setNewPriority] = useState<ActionPriority>('normal');
  const [newDueDate, setNewDueDate] = useState('');
  const [newStatus, setNewStatus] = useState<ActionStatus>('not_started');

  // Inline edit state for verification/notes
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [inlineNotes, setInlineNotes] = useState('');
  const [inlineEvidence, setInlineEvidence] = useState('');
  const [inlineMethod, setInlineMethod] = useState('');

  // 1. Initial Load: from server API if authenticated, or localStorage if guest
  useEffect(() => {
    if (!isGuest) {
      Promise.all([
        apiClient.getActions(planId).catch(() => []),
        apiClient.getEvidenceByPlan(planId).catch(() => [])
      ]).then(([serverActions, serverEvidence]) => {
        if (serverActions && serverActions.length > 0) {
          setActions(serverActions);
        } else {
          const initial = generatePlanActions({
            planId,
            enterprise,
            financialPlan,
            location,
            districtData,
            agriAnalysis,
            matchedSchemes
          });
          setActions(initial);
          apiClient.saveActions(planId, initial).catch(() => {});
        }

        if (serverEvidence && serverEvidence.length > 0) {
          setPlanEvidence(serverEvidence);
        } else {
          setPlanEvidence(getGuestPlanEvidence(planId));
        }
      }).catch(() => {
        loadFromGuestStorage();
      });
    } else {
      loadFromGuestStorage();
    }

    function loadFromGuestStorage() {
      const existing = getGuestPlanActions(planId);
      if (existing && existing.length > 0) {
        setActions(existing);
      } else {
        const initial = generatePlanActions({
          planId,
          enterprise,
          financialPlan,
          location,
          districtData,
          agriAnalysis,
          matchedSchemes
        });
        setActions(initial);
        saveGuestPlanActions(planId, initial);
      }

      // Load Phase 13 Evidence
      const storedEvidence = getGuestPlanEvidence(planId);
      setPlanEvidence(storedEvidence);
    }
  }, [planId, isGuest]);

  // Sync back to storage on changes
  const updateActionsAndPersist = (newActions: BusinessPlanAction[]) => {
    setActions(newActions);
    saveGuestPlanActions(planId, newActions);
    if (!isGuest) {
      apiClient.saveActions(planId, newActions).catch(() => {});
    }
  };

  // Status toggle / update
  const handleStatusChange = (actionId: string, newStatus: ActionStatus) => {
    const updated = actions.map((a) => {
      if (a.id === actionId) {
        return {
          ...a,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    updateActionsAndPersist(updated);
  };

  // Toggle complete
  const handleToggleComplete = (action: BusinessPlanAction) => {
    const nextStatus: ActionStatus = action.status === 'completed' ? 'not_started' : 'completed';
    handleStatusChange(action.id, nextStatus);
  };

  // Delete action
  const handleDeleteAction = (actionId: string) => {
    const updated = actions.filter((a) => a.id !== actionId);
    updateActionsAndPersist(updated);
    deleteGuestPlanAction(planId, actionId);
    if (expandedActionId === actionId) {
      setExpandedActionId(null);
    }
  };

  // Save verification notes
  const handleSaveVerification = (actionId: string) => {
    const updated = actions.map((a) => {
      if (a.id === actionId) {
        return {
          ...a,
          notes: inlineNotes || a.notes,
          evidence: inlineEvidence || a.evidence,
          verificationDetails: {
            ...a.verificationDetails,
            method: inlineMethod || a.verificationDetails?.method,
            findingNotes: inlineEvidence || a.verificationDetails?.findingNotes,
            verifiedAt: new Date().toISOString()
          },
          // If was needs_verification and user provided findings, move to completed or in_progress
          status: a.status === 'needs_verification' ? 'completed' : a.status,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    updateActionsAndPersist(updated);
    setEditingNotesId(null);
  };

  // Reset to default canonical actions
  const handleResetDefaults = () => {
    if (window.confirm('Reset all tasks to standard system defaults generated from your business plan? Any custom tasks will be replaced.')) {
      const reset = generatePlanActions({
        planId,
        enterprise,
        financialPlan,
        location,
        districtData,
        agriAnalysis,
        matchedSchemes
      });
      updateActionsAndPersist(reset);
    }
  };

  // Add custom action
  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAction = addGuestPlanAction(planId, {
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      status: newStatus
    });

    setActions((prev) => [...prev, newAction]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setNewPriority('normal');
    setNewCategory('business_setup');
    setNewStatus('not_started');
  };

  // Phase 13: Evidence Handlers
  const handleOpenAddEvidence = (actionId: string) => {
    setEvidenceTargetActionId(actionId);
    setEditingEvidence(null);
    setEvidenceType('note');
    setEvidenceTitle('');
    setEvidenceDescription('');
    setEvidenceReferenceNumber('');
    setEvidenceEventDate(new Date().toISOString().split('T')[0]);
    setEvidenceError(null);
    setShowEvidenceModal(true);
  };

  const handleOpenEditEvidence = (evidence: ExecutionEvidence) => {
    setEvidenceTargetActionId(evidence.actionId);
    setEditingEvidence(evidence);
    setEvidenceType(evidence.type);
    setEvidenceTitle(evidence.title);
    setEvidenceDescription(evidence.description);
    setEvidenceReferenceNumber(evidence.referenceNumber || '');
    setEvidenceEventDate(evidence.eventDate || '');
    setEvidenceError(null);
    setShowEvidenceModal(true);
  };

  const handleSaveEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) {
      setEvidenceError('Evidence title is mandatory.');
      return;
    }
    if (!evidenceDescription.trim()) {
      setEvidenceError('Evidence description is mandatory.');
      return;
    }
    if (evidenceEventDate) {
      const today = new Date().toISOString().split('T')[0];
      if (evidenceEventDate > today) {
        setEvidenceError('Event date cannot be in the future.');
        return;
      }
    }

    if (editingEvidence) {
      if (!isGuest) {
        apiClient.updateEvidence(editingEvidence.id, {
          type: evidenceType,
          title: evidenceTitle.trim(),
          description: evidenceDescription.trim(),
          referenceNumber: evidenceReferenceNumber.trim() || undefined,
          eventDate: evidenceEventDate.trim() || undefined
        }).catch(() => {});
      }
      const updated = updateGuestActionEvidence(editingEvidence.id, planId, {
        type: evidenceType,
        title: evidenceTitle.trim(),
        description: evidenceDescription.trim(),
        referenceNumber: evidenceReferenceNumber.trim() || undefined,
        eventDate: evidenceEventDate.trim() || undefined
      });
      if (updated) {
        setPlanEvidence((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
    } else if (evidenceTargetActionId) {
      if (!isGuest) {
        apiClient.createEvidence({
          actionId: evidenceTargetActionId,
          planId,
          type: evidenceType,
          title: evidenceTitle.trim(),
          description: evidenceDescription.trim(),
          referenceNumber: evidenceReferenceNumber.trim() || undefined,
          eventDate: evidenceEventDate.trim() || undefined
        }).catch(() => {});
      }
      const created = addGuestActionEvidence({
        actionId: evidenceTargetActionId,
        planId,
        type: evidenceType,
        title: evidenceTitle.trim(),
        description: evidenceDescription.trim(),
        referenceNumber: evidenceReferenceNumber.trim() || undefined,
        eventDate: evidenceEventDate.trim() || undefined
      });
      setPlanEvidence((prev) => [created, ...prev]);
    }

    setShowEvidenceModal(false);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    if (!isGuest) {
      apiClient.deleteEvidence(evidenceId).catch(() => {});
    }
    deleteGuestActionEvidence(evidenceId, planId);
    setPlanEvidence((prev) => prev.filter((item) => item.id !== evidenceId));
  };

  // Summaries & Metrics
  const summary: ActionCenterSummary = useMemo(() => {
    return calculateActionCenterSummary(planId, actions);
  }, [planId, actions]);

  // Filtered actions list
  const filteredActions = useMemo(() => {
    let list = filterActions(actions, {
      category: categoryFilter,
      status: statusFilter,
      priority: priorityFilter,
      searchQuery
    });

    if (selectedMilestoneFilter) {
      const milestone = summary.milestones.find((m) => m.id === selectedMilestoneFilter);
      if (milestone) {
        list = list.filter((a) => milestone.actionIds.includes(a.id));
      }
    }

    return list;
  }, [actions, categoryFilter, statusFilter, priorityFilter, searchQuery, selectedMilestoneFilter, summary.milestones]);

  // Export & Print (Includes Phase 13 Evidence)
  const handleExportText = () => {
    const text = generateActionListText(planTitle || enterprise.name || 'Business Plan', summary, actions, planEvidence);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `action_center_plan_${planId.substring(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const text = generateActionListText(planTitle || enterprise.name || 'Business Plan', summary, actions, planEvidence);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const district = location?.district || districtData?.districtName || 'Local District';
  const state = location?.state || districtData?.stateName || 'State';

  return (
    <div className="space-y-6">
      {/* 1. Header / Action Center Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckSquare className="h-3 w-3" />
                Phase 12 Monitoring Workspace
              </span>
              <span className="text-xs text-stone-400 font-mono">Plan ID: {planId.substring(0, 10)}...</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-stone-900 mt-1">
              Action Center &amp; Business Execution Monitoring
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Practical task tracking, local site verification, and milestone management for <strong className="text-stone-800">{enterprise.name || enterprise.title}</strong> in {district}, {state}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('timeline')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition cursor-pointer shadow-2xs"
                title="View Execution Timeline & Milestones"
              >
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                Timeline &amp; Health
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
            <button
              onClick={handleExportText}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Download text report"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              Export
            </button>
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Copy checklist"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-stone-500" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Print checklist"
            >
              <Printer className="h-3.5 w-3.5 text-stone-500" />
              Print
            </button>
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-2 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
              title="Reset to default system tasks"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & KPI Summary */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Completion Meter */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span>Overall Implementation Progress</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">{summary.completionPercentage}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-2.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
            <div className="text-3xs text-stone-500 mt-2 flex items-center justify-between">
              <span>{summary.completedActions} of {summary.totalActions} tasks completed</span>
              <span>{summary.notStartedActions} pending</span>
            </div>
          </div>

          {/* KPI 1: Completed */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
            <div className="text-3xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Completed
            </div>
            <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
              {summary.completedActions}
            </div>
            <div className="text-3xs text-emerald-700 mt-0.5">Ready for next steps</div>
          </div>

          {/* KPI 2: In Progress */}
          <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 flex flex-col justify-between">
            <div className="text-3xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1">
              <Clock className="h-3 w-3 text-sky-600" />
              In Progress
            </div>
            <div className="text-xl font-bold font-mono text-sky-950 mt-1">
              {summary.inProgressActions}
            </div>
            <div className="text-3xs text-sky-700 mt-0.5">Active execution</div>
          </div>

          {/* KPI 3: Needs Verification */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'needs_verification' ? 'all' : 'needs_verification')}
            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              statusFilter === 'needs_verification'
                ? 'border-amber-400 bg-amber-100/70 ring-2 ring-amber-400'
                : 'border-amber-200 bg-amber-50/60 hover:bg-amber-100/50'
            }`}
          >
            <div className="text-3xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Verify Local
            </div>
            <div className="text-xl font-bold font-mono text-amber-950 mt-1">
              {summary.needsVerificationActions}
            </div>
            <div className="text-3xs text-amber-700 mt-0.5">On-ground checks</div>
          </div>

          {/* KPI 4: Blocked / Critical */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'blocked' ? 'all' : 'blocked')}
            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              statusFilter === 'blocked'
                ? 'border-rose-400 bg-rose-100/70 ring-2 ring-rose-400'
                : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100/50'
            }`}
          >
            <div className="text-3xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-rose-600" />
              Blocked
            </div>
            <div className="text-xl font-bold font-mono text-rose-950 mt-1">
              {summary.blockedActions}
            </div>
            <div className="text-3xs text-rose-700 mt-0.5">Requiring attention</div>
          </div>
        </div>

        {/* Local Verification Readiness Banner */}
        <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <div>
              <span className="font-bold text-amber-950">Ground Verification Readiness:</span>{' '}
              <span className="text-amber-900">
                {summary.verificationReadiness.verified} of {summary.verificationReadiness.totalRequiringVerification} items verified ({summary.verificationReadiness.readinessPercentage}%).
                Site power, road access, and raw material mandi checks are critical before committing capital.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setCategoryFilter(categoryFilter === 'local_verification' ? 'all' : 'local_verification');
              setSelectedMilestoneFilter(null);
            }}
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100/80 transition cursor-pointer"
          >
            <Filter className="h-3 w-3" />
            {categoryFilter === 'local_verification' ? 'Show All Categories' : 'Filter Verification Items'}
          </button>
        </div>
      </div>

      {/* 2. Implementation Milestones Stepper */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-700" />
            <h3 className="font-heading font-bold text-sm text-stone-900">Implementation Stages &amp; Milestones</h3>
          </div>
          {selectedMilestoneFilter && (
            <button
              onClick={() => setSelectedMilestoneFilter(null)}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              Clear Milestone Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {summary.milestones.map((m) => {
            const isSelected = selectedMilestoneFilter === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMilestoneFilter(isSelected ? null : m.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500'
                    : m.isCompleted
                    ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-3xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
                    <span>Stage {m.stageNumber}</span>
                    {m.isCompleted ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <Check className="h-2.5 w-2.5" /> Done
                      </span>
                    ) : (
                      <span className="font-mono text-stone-600">{m.progressPercentage}%</span>
                    )}
                  </div>
                  <div className="font-bold text-stone-900 line-clamp-1">{m.title}</div>
                  <p className="text-3xs text-stone-500 mt-1 line-clamp-2">{m.description}</p>
                </div>

                <div className="mt-2.5">
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${m.isCompleted ? 'bg-emerald-600' : 'bg-emerald-500'}`}
                      style={{ width: `${m.progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-3xs text-stone-400 mt-1 flex justify-between">
                    <span>{m.completedActions}/{m.totalActions} tasks</span>
                    <span>{isSelected ? 'Active Filter' : 'Click to filter'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, verification notes, or machinery..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-3xs font-semibold text-stone-500 uppercase tracking-wider">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-stone-800"
            >
              <option value="all">All Categories ({actions.length})</option>
              <option value="site_verification">Site Verification ({summary.categoryMetrics.site_verification.total})</option>
              <option value="local_verification">Local Ground Verification ({summary.categoryMetrics.local_verification.total})</option>
              <option value="finance">Banking &amp; Finance ({summary.categoryMetrics.finance.total})</option>
              <option value="scheme">Govt Scheme ({summary.categoryMetrics.scheme.total})</option>
              <option value="documents">Document Compilation ({summary.categoryMetrics.documents.total})</option>
              <option value="procurement">Procurement ({summary.categoryMetrics.procurement.total})</option>
              <option value="business_setup">Business Setup ({summary.categoryMetrics.business_setup.total})</option>
              <option value="operations">Operations &amp; Launch ({summary.categoryMetrics.operations.total})</option>
            </select>
          </div>

          {/* Priority Toggle */}
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-3xs font-semibold text-stone-500 uppercase tracking-wider">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-stone-800"
            >
              <option value="all">All Priorities</option>
              <option value="important">★ Important Only ({summary.importantCount})</option>
              <option value="normal">Normal Priority</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100">
          <span className="text-3xs font-semibold text-stone-400 uppercase tracking-wider mr-1">Status:</span>
          {(['all', 'needs_verification', 'in_progress', 'completed', 'blocked', 'not_started'] as const).map((st) => {
            const isSelected = statusFilter === st;
            const count = st === 'all'
              ? actions.length
              : st === 'needs_verification'
              ? summary.needsVerificationActions
              : st === 'in_progress'
              ? summary.inProgressActions
              : st === 'completed'
              ? summary.completedActions
              : st === 'blocked'
              ? summary.blockedActions
              : summary.notStartedActions;

            const label = st === 'all'
              ? 'All'
              : st === 'needs_verification'
              ? 'Verify Local'
              : st === 'in_progress'
              ? 'In Progress'
              : st === 'completed'
              ? 'Completed'
              : st === 'blocked'
              ? 'Blocked'
              : 'Not Started';

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-3xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-3xs ${isSelected ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}

          {(categoryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery || selectedMilestoneFilter) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
                setSearchQuery('');
                setSelectedMilestoneFilter(null);
              }}
              className="ml-auto text-3xs text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Action Cards List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500">
            <CheckSquare className="h-8 w-8 mx-auto text-stone-300 mb-2" />
            <div className="font-semibold text-stone-700">No action tasks match your active filters.</div>
            <p className="text-xs text-stone-400 mt-1">Try relaxing filters or search terms.</p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isExpanded = expandedActionId === action.id;
            const isEditing = editingNotesId === action.id;
            const isCompleted = action.status === 'completed';
            const isBlocked = action.status === 'blocked';
            const isNeedsVerif = action.status === 'needs_verification';
            const isImportant = action.priority === 'important';
            const actEvidence = planEvidence.filter((e) => e.actionId === action.id);

            return (
              <div
                key={action.id}
                className={`rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : isBlocked
                    ? 'border-rose-300 bg-rose-50/30'
                    : isNeedsVerif
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="p-4 sm:p-5 flex items-start gap-3.5">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(action)}
                    className="mt-0.5 shrink-0 text-stone-400 hover:text-emerald-600 transition cursor-pointer"
                    title={isCompleted ? 'Mark as Not Completed' : 'Mark as Completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Square className="h-5 w-5 text-stone-300 hover:text-stone-500" />
                    )}
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {/* Priority Badge */}
                      {isImportant && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-3xs font-bold text-amber-900 border border-amber-200">
                          ★ High Priority
                        </span>
                      )}

                      {/* Guidance Type Provenance Badge */}
                      {action.guidanceType && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-3xs font-semibold border ${
                            action.guidanceType === 'local_verification'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : action.guidanceType === 'documented_government'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : action.guidanceType === 'documented_scheme'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : action.guidanceType === 'regulatory_licensing'
                              ? 'bg-rose-50 text-rose-900 border-rose-200'
                              : action.guidanceType === 'financial_preparation'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : action.guidanceType === 'user_added'
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {GUIDANCE_TYPE_LABELS[action.guidanceType]}
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-3xs font-medium text-stone-700">
                        {CATEGORY_LABELS[action.category]}
                      </span>

                      {/* Source Benchmark Label */}
                      {action.sourceLabel && (
                        <span className="rounded-md bg-stone-50 px-2 py-0.5 text-3xs font-medium text-stone-600 border border-stone-200">
                          {action.sourceLabel}
                        </span>
                      )}

                      {/* Evidence Count Pill */}
                      <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-3xs font-semibold text-stone-700 border border-stone-200">
                        <FileText className="h-3 w-3 text-stone-500" />
                        {actEvidence.length} Progress {actEvidence.length === 1 ? 'Record' : 'Records'}
                      </span>

                      {/* Due Date */}
                      {action.dueDate && (
                        <span className="inline-flex items-center gap-1 text-3xs text-stone-500 ml-auto">
                          <Calendar className="h-3 w-3" />
                          Due: {action.dueDate}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => setExpandedActionId(isExpanded ? null : action.id)}
                      className={`text-sm sm:text-base font-bold cursor-pointer hover:text-emerald-800 transition ${
                        isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {action.title}
                    </h4>

                    {/* Description preview */}
                    {action.description && (
                      <p className={`text-xs mt-1 ${isCompleted ? 'text-stone-400' : 'text-stone-600'}`}>
                        {action.description}
                      </p>
                    )}

                    {/* Verification Method / Findings Badge */}
                    {action.verificationDetails?.method && (
                      <div className="mt-2 text-3xs inline-flex items-center gap-1 text-amber-900 bg-amber-100/60 px-2 py-1 rounded-md border border-amber-200/80">
                        <MapPin className="h-3 w-3 text-amber-700" />
                        <span>Method: <strong>{action.verificationDetails.method}</strong></span>
                        {action.verificationDetails.findingNotes && (
                          <span className="border-l border-amber-300 pl-1.5 ml-1">
                            Notes: {action.verificationDetails.findingNotes}
                          </span>
                        )}
                      </div>
                    )}

                    {/* User Notes */}
                    {action.notes && !isExpanded && (
                      <div className="mt-2 text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                        <strong className="text-stone-800">Note:</strong> {action.notes}
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown & Expand Toggle */}
                  <div className="shrink-0 flex items-center gap-2">
                    <select
                      value={action.status}
                      onChange={(e) => handleStatusChange(action.id, e.target.value as ActionStatus)}
                      className={`text-3xs font-semibold py-1 px-2 rounded-lg border cursor-pointer ${
                        action.status === 'completed'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : action.status === 'in_progress'
                          ? 'border-sky-300 bg-sky-50 text-sky-800'
                          : action.status === 'needs_verification'
                          ? 'border-amber-300 bg-amber-50 text-amber-900'
                          : action.status === 'blocked'
                          ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : 'border-stone-300 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="needs_verification">Verify On-Ground</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    <button
                      onClick={() => setExpandedActionId(isExpanded ? null : action.id)}
                      className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details / Inline Verification Editor */}
                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50/60 p-4 sm:p-5 rounded-b-2xl space-y-4 text-xs">
                    {/* Inline Verification Record Form */}
                    {isEditing ? (
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200">
                        <div className="font-bold text-stone-900 text-xs">
                          Update On-Ground Verification &amp; Evidence
                        </div>
                        <div>
                          <label className="block text-3xs font-semibold text-stone-500 uppercase mb-1">
                            Verification Method / Agency Visited
                          </label>
                          <input
                            type="text"
                            value={inlineMethod}
                            onChange={(e) => setInlineMethod(e.target.value)}
                            placeholder="e.g. Visited DISCOM Junior Engineer / Mandi Field Visit / Bank Manager Meeting"
                            className="w-full p-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-semibold text-stone-500 uppercase mb-1">
                            Findings &amp; Verification Evidence
                          </label>
                          <textarea
                            rows={2}
                            value={inlineEvidence}
                            onChange={(e) => setInlineEvidence(e.target.value)}
                            placeholder="Record specific findings: transformer distance, quotation numbers, officer names, etc."
                            className="w-full p-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-semibold text-stone-500 uppercase mb-1">
                            General Progress Notes / Remarks
                          </label>
                          <textarea
                            rows={2}
                            value={inlineNotes}
                            onChange={(e) => setInlineNotes(e.target.value)}
                            placeholder="Add execution comments or next follow-up dates..."
                            className="w-full p-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveVerification(action.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition cursor-pointer"
                          >
                            Save Verification &amp; Complete
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-600 text-xs hover:bg-stone-50 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {action.verificationDetails?.method && (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                            <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-amber-700" />
                              Local Verification Record
                            </div>
                            <div className="mt-1 text-xs text-amber-900">
                              <strong>Method:</strong> {action.verificationDetails.method}
                            </div>
                            {action.verificationDetails.findingNotes && (
                              <div className="mt-0.5 text-xs text-amber-900">
                                <strong>Findings / Evidence:</strong> {action.verificationDetails.findingNotes}
                              </div>
                            )}
                            {action.verificationDetails.verifiedAt && (
                              <div className="mt-1 text-3xs text-amber-700 font-mono">
                                Recorded on {new Date(action.verificationDetails.verifiedAt).toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        )}

                        {action.notes && (
                          <div className="p-3 rounded-xl bg-white border border-stone-200">
                            <span className="font-semibold text-stone-900">Execution Notes:</span>
                            <p className="mt-0.5 text-stone-600">{action.notes}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <button
                            onClick={() => {
                              setEditingNotesId(action.id);
                              setInlineMethod(action.verificationDetails?.method || '');
                              setInlineEvidence(action.verificationDetails?.findingNotes || action.evidence || '');
                              setInlineNotes(action.notes || '');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-xs text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                            Record On-Ground Verification / Notes
                          </button>

                          {/* Quick jumps to relevant tabs */}
                          {action.source === 'phase_5' && onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('location')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-3xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Location Benchmarks
                            </button>
                          )}
                          {action.source === 'phase_6' && onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('agriculture')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-3xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Agriculture Analysis
                            </button>
                          )}
                          {action.source === 'phase_7' && onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('schemes')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-3xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Scheme Details
                            </button>
                          )}
                          {action.source === 'phase_8' && onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('documents')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-3xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Document Checklist
                            </button>
                          )}
                          {(action.source === 'phase_4' || action.source === 'phase_9') && onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('plan')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-3xs text-stone-600 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Business &amp; Financing Plan
                            </button>
                          )}

                          {action.source === 'user_added' && (
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-3xs text-rose-700 hover:bg-rose-100 cursor-pointer ml-auto"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete Custom Task
                            </button>
                          )}
                        </div>

                        {/* Phase 13: Execution Evidence & Progress Records */}
                        <div className="mt-4 pt-3.5 border-t border-stone-200">
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-emerald-800" />
                              <span className="font-bold text-stone-900 text-xs">
                                Execution Evidence &amp; Progress Records ({actEvidence.length})
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenAddEvidence(action.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-3xs transition cursor-pointer shadow-2xs"
                            >
                              <Plus className="h-3 w-3" />
                              Add Progress Record
                            </button>
                          </div>

                          {actEvidence.length === 0 ? (
                            <div className="p-3 rounded-xl bg-white border border-stone-200 text-stone-500 text-3xs">
                              No progress records recorded yet. Attach supplier quotations, bank discussion notes, or inspection records.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {actEvidence.map((evi) => (
                                <div key={evi.id} className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-bold text-stone-900 text-xs">{evi.title}</span>
                                        <span className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-stone-100 text-stone-700">
                                          {EVIDENCE_TYPE_LABELS[evi.type] || evi.type}
                                        </span>
                                      </div>
                                      {evi.eventDate && (
                                        <span className="text-3xs text-stone-500 flex items-center gap-1 mt-0.5">
                                          <Calendar className="h-3 w-3" /> Event Date: {evi.eventDate}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleOpenEditEvidence(evi)}
                                        className="text-3xs text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEvidence(evi.id)}
                                        className="text-3xs text-rose-600 hover:text-rose-900 px-2 py-0.5 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>

                                  {evi.referenceNumber && (
                                    <div className="text-3xs text-stone-700 bg-stone-50 px-2 py-1 rounded font-mono border border-stone-150">
                                      Ref / Acknowledgment No: <strong>{evi.referenceNumber}</strong>
                                    </div>
                                  )}

                                  <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{evi.description}</p>

                                  <div className="text-3xs text-amber-900 bg-amber-50/80 border border-amber-200 px-2 py-0.5 rounded inline-block font-medium">
                                    ⚠ User-recorded evidence — not independently verified.
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Statutory Advisory & Execution Monitoring Framework Card */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4.5 text-xs text-stone-600 flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
            <span>Statutory Advisory &amp; Execution Monitoring Framework</span>
            <span className="text-3xs font-semibold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
              Non-Disruptive Guidance Layer
            </span>
          </div>
          <p className="text-3xs text-stone-600 leading-relaxed">
            GramUdyam Action Center tasks are derived traceably from domain benchmarks, user inputs, and official scheme frameworks (PMEGP, MSME, Lead Bank appraisal models) for execution tracking and readiness monitoring. GramUdyam is an educational planning workspace and does not provide formal legal representation, statutory certification, or guarantees of credit sanction or subsidy approval. All official sanctions remain subject to statutory authorities and lead financing institutions.
          </p>
        </div>
      </div>

      {/* 6. Add Custom Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-700" />
                Add Custom Implementation Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule meeting with District Khadi Board officer"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ActionCategory)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white text-stone-800"
                  >
                    <option value="business_setup">Business Setup &amp; Legal</option>
                    <option value="site_verification">Site Verification</option>
                    <option value="local_verification">Local Ground Verification</option>
                    <option value="finance">Banking &amp; Financing</option>
                    <option value="scheme">Government Scheme</option>
                    <option value="documents">Document Compilation</option>
                    <option value="procurement">Machinery Procurement</option>
                    <option value="operations">Operations &amp; Launch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ActionPriority)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white text-stone-800"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">★ High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ActionStatus)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white text-stone-800"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="needs_verification">Verify On-Ground</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description / Details</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide context, required documents, or contact details for this activity..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition cursor-pointer"
                >
                  Add Task to Action Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Phase 13: Add / Edit Progress Record Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-700" />
                {editingEvidence ? 'Edit' : 'Add'} Progress Record
              </h3>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {evidenceError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {evidenceError}
              </div>
            )}

            <form onSubmit={handleSaveEvidence} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Evidence Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-800"
                >
                  <option value="note">General Note — Administrative or operational update</option>
                  <option value="quotation">Quotation — Supplier or equipment price estimate received</option>
                  <option value="application_reference">Application Reference — Official scheme portal or acknowledgement number</option>
                  <option value="meeting_record">Meeting Record — Discussion with bank manager, DIC officer, or supplier</option>
                  <option value="site_verification">Site Verification — User-recorded physical site or premises check</option>
                  <option value="document_submission">Document Submission — Statutory or bank document filed</option>
                  <option value="purchase_record">Purchase Record — Equipment or raw material order placed</option>
                  <option value="inspection_record">Inspection Record — DISCOM, local body, or factory inspector visit</option>
                  <option value="photo_reference">Photo Reference — Photographs of premises, electrical setup, or machinery</option>
                  <option value="other">Other — Other factual execution progress notation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Record Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. Received quotation for Mustard Oil Expeller from Rajkot manufacturer"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Reference / Acknowledgment No.</label>
                  <input
                    type="text"
                    maxLength={80}
                    value={evidenceReferenceNumber}
                    onChange={(e) => setEvidenceReferenceNumber(e.target.value)}
                    placeholder="e.g. QTN-2026-884 or PMEGP-UP-492"
                    className="w-full p-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                  <span className="text-3xs text-stone-400 mt-0.5 block">
                    User-entered. Not verified by GramUdyam.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={evidenceEventDate}
                    onChange={(e) => setEvidenceEventDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                  <span className="text-3xs text-stone-400 mt-0.5 block">
                    Date of meeting, receipt, or inspection.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description / Progress Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="Provide detailed factual notes: vendor details, officer discussed with, pricing details, or site observations..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-3xs space-y-0.5">
                <div className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                  <span>Execution Evidence Notice</span>
                </div>
                <p>
                  User-recorded evidence — not independently verified. This record does not constitute government, bank, statutory, or third-party verification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition cursor-pointer"
                >
                  Save Progress Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
