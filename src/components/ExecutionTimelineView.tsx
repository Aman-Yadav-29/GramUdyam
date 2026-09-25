import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Plus,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Landmark,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit2
} from 'lucide-react';
import {
  ExecutionTimelineEvent,
  ExecutionMilestone,
  ExecutionBlocker,
  NextActionItem,
  PlanHealthSummary,
  ExecutionState,
  TimelineEventType,
  TimelineSourcePhase,
  CreateUserNoteEventInput,
  UpdateUserNoteEventInput,
  TIMELINE_DISCLAIMER,
  EVENT_TYPE_LABELS,
  EXECUTION_STATE_LABELS
} from '../types/executionTimeline.ts';
import { BusinessPlanAction } from '../types/actionCenter.ts';
import { ExecutionEvidence } from '../types/executionEvidence.ts';
import {
  buildTimelineEvents,
  calculateMilestones,
  detectBlockers,
  extractNextActions,
  computePlanHealth,
  generateTimelineExportText,
  STAGE_CONFIGS
} from '../utils/timelineEngine.ts';
import {
  getGuestPlanActions,
  getGuestPlanEvidence,
  getGuestTimelineEvents,
  saveGuestTimelineEvents,
  addGuestTimelineEvent,
  updateGuestTimelineEvent,
  deleteGuestTimelineEvent
} from '../utils/guestStorage.ts';
import { apiClient } from '../services/apiClient.ts';

interface ExecutionTimelineViewProps {
  planId: string;
  planTitle?: string;
  isGuest?: boolean;
  onNavigateTab?: (tab: string) => void;
  documentDeclarations?: Record<string, { declaredStatus: string; documentTitle?: string }>;
}

export const ExecutionTimelineView: React.FC<ExecutionTimelineViewProps> = ({
  planId,
  planTitle = 'Business Plan',
  isGuest = true,
  onNavigateTab,
  documentDeclarations
}) => {
  // Core Data States
  const [actions, setActions] = useState<BusinessPlanAction[]>([]);
  const [evidenceList, setEvidenceList] = useState<ExecutionEvidence[]>([]);
  const [userCustomEvents, setUserCustomEvents] = useState<ExecutionTimelineEvent[]>([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<TimelineSourcePhase | 'all'>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [copied, setCopied] = useState(false);

  // Modal State for Custom Event
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ExecutionTimelineEvent | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [noteActionId, setNoteActionId] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  // 1. Initial Load: Dual-mode (Server API for authenticated users, LocalStorage for guests)
  useEffect(() => {
    if (!isGuest) {
      Promise.all([
        apiClient.getActions(planId).catch(() => []),
        apiClient.getEvidenceByPlan(planId).catch(() => []),
        apiClient.getExecutionTimeline(planId).catch(() => [])
      ]).then(([serverActions, serverEvidence, serverTimeline]) => {
        if (serverActions) setActions(serverActions);
        if (serverEvidence) setEvidenceList(serverEvidence);
        if (serverTimeline) {
          // Extract custom user notes from timeline
          const custom = serverTimeline.filter((t) => t.source === 'user_manual');
          setUserCustomEvents(custom);
        }
      }).catch(() => {
        loadFromGuest();
      });
    } else {
      loadFromGuest();
    }

    function loadFromGuest() {
      const storedActions = getGuestPlanActions(planId);
      const storedEvidence = getGuestPlanEvidence(planId);
      const storedCustom = getGuestTimelineEvents(planId);

      setActions(storedActions);
      setEvidenceList(storedEvidence);
      setUserCustomEvents(storedCustom);
    }
  }, [planId, isGuest]);

  // 2. Computed Plan Health and Milestones
  const planHealth: PlanHealthSummary = useMemo(() => {
    return computePlanHealth({
      planId,
      actions,
      evidenceList,
      userNotes: userCustomEvents,
      documentDeclarations
    });
  }, [planId, actions, evidenceList, userCustomEvents, documentDeclarations]);

  // 3. Compiled Chronological Events
  const allEvents: ExecutionTimelineEvent[] = useMemo(() => {
    const rawEvents = buildTimelineEvents({
      planId,
      actions,
      evidenceList,
      userNotes: userCustomEvents,
      documentDeclarations
    });

    if (sortOrder === 'oldest') {
      return [...rawEvents].reverse();
    }
    return rawEvents;
  }, [planId, actions, evidenceList, userCustomEvents, documentDeclarations, sortOrder]);

  // 4. Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      if (sourceFilter !== 'all' && evt.sourcePhase !== sourceFilter) {
        return false;
      }
      if (eventTypeFilter !== 'all' && evt.eventType !== eventTypeFilter) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const mTitle = evt.title.toLowerCase().includes(q);
        const mDesc = evt.description.toLowerCase().includes(q);
        const mType = (EVENT_TYPE_LABELS[evt.eventType] || '').toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mType) return false;
      }
      return true;
    });
  }, [allEvents, sourceFilter, eventTypeFilter, searchQuery]);

  // 5. Handlers for Custom Note Event
  const handleOpenAddEvent = (actionId?: string) => {
    setEditingEvent(null);
    setNoteTitle('');
    setNoteDesc('');
    setNoteDate(new Date().toISOString().split('T')[0]);
    setNoteActionId(actionId || '');
    setModalError(null);
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (evt: ExecutionTimelineEvent) => {
    setEditingEvent(evt);
    setNoteTitle(evt.title);
    setNoteDesc(evt.description);
    setNoteDate(evt.eventDate || '');
    setNoteActionId(evt.actionId || '');
    setModalError(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      setModalError('Title is mandatory.');
      return;
    }
    if (!noteDesc.trim()) {
      setModalError('Description is mandatory.');
      return;
    }

    if (editingEvent) {
      if (!isGuest) {
        apiClient.updateTimelineEvent(editingEvent.id, {
          title: noteTitle.trim(),
          description: noteDesc.trim(),
          eventDate: noteDate.trim() || undefined
        }).catch(() => {});
      }
      const updated = updateGuestTimelineEvent(editingEvent.id, planId, {
        title: noteTitle.trim(),
        description: noteDesc.trim(),
        eventDate: noteDate.trim() || undefined
      });
      if (updated) {
        setUserCustomEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
      }
    } else {
      if (!isGuest) {
        apiClient.createTimelineEvent({
          planId,
          actionId: noteActionId || undefined,
          title: noteTitle.trim(),
          description: noteDesc.trim(),
          eventDate: noteDate.trim() || undefined
        }).catch(() => {});
      }
      const created = addGuestTimelineEvent({
        planId,
        actionId: noteActionId || undefined,
        title: noteTitle.trim(),
        description: noteDesc.trim(),
        eventDate: noteDate.trim() || undefined
      });
      setUserCustomEvents((prev) => [created, ...prev]);
    }

    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!isGuest) {
      apiClient.deleteTimelineEvent(eventId).catch(() => {});
    }
    deleteGuestTimelineEvent(eventId, planId);
    setUserCustomEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  // 6. Export / Print / Copy
  const handleExportText = () => {
    const text = generateTimelineExportText(planTitle, planHealth, allEvents);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `execution_timeline_${planId.substring(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    const text = generateTimelineExportText(planTitle, planHealth, allEvents);
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

  return (
    <div className="space-y-6">
      {/* 1. Header & Plan Health Overview Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <Clock className="h-3 w-3" />
                Phase 14 Timeline &amp; Monitoring
              </span>
              <span className="text-3xs text-stone-400 font-mono">
                Plan ID: {planId.substring(0, 12)}...
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-stone-900">
              Execution Timeline &amp; Plan Health
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Transparent, chronological audit trail of what has happened, what is pending, and what requires on-ground verification.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddEvent()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Timeline Note
            </button>
            <button
              onClick={handleExportText}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Download text report"
            >
              <Download className="h-3.5 w-3.5 text-stone-600" />
              Export
            </button>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Copy text report"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-stone-600" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
              title="Print timeline report"
            >
              <Printer className="h-3.5 w-3.5 text-stone-600" />
              Print
            </button>
          </div>
        </div>

        {/* Plan Health State & Detail */}
        <div className="mt-5 p-4 rounded-xl border bg-stone-50/70 border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-3xs uppercase font-bold text-stone-500 tracking-wider">
                Current Execution Health State
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    planHealth.executionState === 'blocked'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : planHealth.executionState === 'awaiting_verification'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : planHealth.executionState === 'substantially_completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : planHealth.executionState === 'progressing'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  {planHealth.executionState === 'blocked' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  ) : planHealth.executionState === 'awaiting_verification' ? (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  ) : planHealth.executionState === 'substantially_completed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-sky-600" />
                  )}
                  {EXECUTION_STATE_LABELS[planHealth.executionState]}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-2 font-medium">
                {planHealth.stateExplanation}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-3xs text-stone-400 block">
                Metric Integrity Guarantee
              </span>
              <span className="inline-block text-3xs font-semibold text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded mt-0.5">
                Zero Subjective Scores &bull; Factual State Only
              </span>
            </div>
          </div>
        </div>

        {/* Factual Action Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-2xs">
            <div className="text-3xs font-medium text-stone-500 uppercase">Total Tasks</div>
            <div className="text-xl font-bold text-stone-900 mt-0.5">{planHealth.totalActionsCount}</div>
            <div className="text-3xs text-stone-400 mt-0.5">Monitored</div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 text-center shadow-2xs">
            <div className="text-3xs font-medium text-emerald-700 uppercase">Completed</div>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">{planHealth.completedCount}</div>
            <div className="text-3xs text-emerald-600 mt-0.5">Verified / done</div>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-3 text-center shadow-2xs">
            <div className="text-3xs font-medium text-sky-700 uppercase">In Progress</div>
            <div className="text-xl font-bold text-sky-800 mt-0.5">{planHealth.inProgressCount}</div>
            <div className="text-3xs text-sky-600 mt-0.5">Active</div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3 text-center shadow-2xs">
            <div className="text-3xs font-medium text-amber-800 uppercase">Needs Check</div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{planHealth.needsVerificationCount}</div>
            <div className="text-3xs text-amber-700 mt-0.5">On-ground field</div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3 text-center shadow-2xs">
            <div className="text-3xs font-medium text-rose-700 uppercase">Blocked</div>
            <div className="text-xl font-bold text-rose-800 mt-0.5">{planHealth.blockedCount}</div>
            <div className="text-3xs text-rose-600 mt-0.5">Action needed</div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-center shadow-2xs">
            <div className="text-3xs font-medium text-stone-600 uppercase">Evidence</div>
            <div className="text-xl font-bold text-stone-800 mt-0.5">{planHealth.evidenceCount}</div>
            <div className="text-3xs text-stone-500 mt-0.5">Records attached</div>
          </div>
        </div>
      </div>

      {/* 2. Implementation Milestones (Stages 1 to 5) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-800" />
            <h3 className="font-heading font-bold text-base text-stone-900">
              Implementation Milestones (Stages 1 to 5)
            </h3>
          </div>
          <span className="text-3xs text-stone-500">
            Factual counts across implementation stages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {planHealth.milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border p-4 space-y-2.5 transition flex flex-col justify-between ${
                m.isComplete
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : m.blockedActions > 0
                  ? 'border-rose-200 bg-rose-50/20'
                  : m.completedActions > 0
                  ? 'border-sky-200 bg-white'
                  : 'border-stone-200 bg-stone-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="px-1.5 py-0.5 rounded text-3xs font-bold uppercase bg-stone-200/80 text-stone-700">
                    Stage {m.stageNumber}
                  </span>
                  {m.isComplete ? (
                    <span className="inline-flex items-center gap-0.5 text-3xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Done
                    </span>
                  ) : (
                    <span className="text-3xs font-mono font-semibold text-stone-600">
                      {m.completedActions}/{m.totalActions}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-stone-900 leading-tight">
                  {m.title}
                </h4>
                <p className="text-3xs text-stone-500 mt-1 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Factual counts breakdown */}
              <div className="pt-2 border-t border-stone-150 space-y-1 text-3xs text-stone-600">
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <strong className="text-emerald-700">{m.completedActions}</strong>
                </div>
                <div className="flex justify-between">
                  <span>In Progress:</span>
                  <strong className="text-sky-700">{m.inProgressActions}</strong>
                </div>
                {m.needsVerificationActions > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span>Needs Check:</span>
                    <strong>{m.needsVerificationActions}</strong>
                  </div>
                )}
                {m.blockedActions > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Blocked:</span>
                    <strong>{m.blockedActions}</strong>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Evidence:</span>
                  <span>{m.evidenceRecordsCount} records</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Active Blockers & Unresolved Items (if any) */}
      {planHealth.blockers.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-rose-200/80 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <h3 className="font-heading font-bold text-base text-rose-950">
                Active Execution Blockers ({planHealth.blockers.length})
              </h3>
            </div>
            <span className="text-3xs text-rose-700 font-medium">
              Explicit hurdles discovered in monitored records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {planHealth.blockers.map((blk) => (
              <div
                key={blk.id}
                className="p-3.5 rounded-xl border border-rose-200 bg-white shadow-2xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-rose-950">{blk.title}</div>
                  <span className="px-1.5 py-0.5 rounded text-3xs font-semibold uppercase bg-rose-100 text-rose-900 shrink-0">
                    {blk.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-rose-900 leading-relaxed">{blk.reason}</p>
                <div className="flex items-center justify-between text-3xs text-stone-500 pt-1">
                  <span>Origin: Phase {blk.sourcePhase.replace('phase_', '')}</span>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('dpr')}
                      className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      Resolve in Action Center &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Recommended Next Actions */}
      {planHealth.nextActions.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              <h3 className="font-heading font-bold text-base text-stone-900">
                Immediate Action Queue
              </h3>
            </div>
            <span className="text-3xs text-stone-500">
              Preserves Phase 12 high-priority items &bull; No artificial ranking
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {planHealth.nextActions.map((na) => (
              <div
                key={na.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition shadow-2xs space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {na.priority === 'important' && (
                      <span className="px-1.5 py-0.2 rounded text-3xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        ★ Important
                      </span>
                    )}
                    <span className="px-1.5 py-0.2 rounded text-3xs font-medium bg-stone-200/70 text-stone-700 capitalize">
                      {na.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 leading-tight">
                    {na.title}
                  </h4>
                  <p className="text-3xs text-stone-600 mt-1 leading-relaxed">
                    {na.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-3xs">
                  {na.dueDate && (
                    <span className="text-stone-500 flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" /> Due {na.dueDate}
                    </span>
                  )}
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('dpr')}
                      className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-0.5 ml-auto cursor-pointer"
                    >
                      Open Task &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Chronological Execution Timeline Feed */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-800" />
              <h3 className="font-heading font-bold text-base text-stone-900">
                Chronological Execution Feed ({filteredEvents.length} Events)
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Factual trail of actions, evidence attachments, and manual notes.
            </p>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs"
            >
              <option value="all">All Sources</option>
              <option value="phase_12">Phase 12 Actions</option>
              <option value="phase_13">Phase 13 Evidence</option>
              <option value="phase_8">Phase 8 Documents</option>
              <option value="phase_14">Phase 14 User Notes</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Timeline Events List */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-stone-500 rounded-xl border border-stone-200 bg-stone-50">
            <Clock className="h-8 w-8 mx-auto text-stone-300 mb-2" />
            <div className="font-semibold text-stone-700">No execution events match your filters.</div>
            <p className="text-xs text-stone-400 mt-1">Try clearing filters or record a new timeline note.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {filteredEvents.map((evt) => {
              const isEvidence = evt.source === 'execution_evidence';
              const isUserNote = evt.source === 'user_manual';
              const isDoc = evt.source === 'document_readiness';
              const isAction = evt.source === 'action_center';

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      evt.eventType === 'action_completed'
                        ? 'border-emerald-600 bg-emerald-500'
                        : evt.eventType === 'action_blocked'
                        ? 'border-rose-600 bg-rose-500'
                        : isEvidence
                        ? 'border-indigo-600 bg-indigo-500'
                        : isUserNote
                        ? 'border-purple-600 bg-purple-500'
                        : isDoc
                        ? 'border-blue-600 bg-blue-500'
                        : 'border-stone-400 bg-stone-300'
                    }`}
                  />

                  {/* Card Content */}
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2 hover:border-stone-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {/* Event Type Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-3xs font-semibold border ${
                              evt.eventType === 'action_completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : evt.eventType === 'action_blocked'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : evt.eventType === 'verification_required'
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : isEvidence
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                : isUserNote
                                ? 'bg-purple-50 text-purple-900 border-purple-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {EVENT_TYPE_LABELS[evt.eventType] || evt.eventType}
                          </span>

                          {/* Source Phase Badge */}
                          <span className="px-1.5 py-0.5 rounded text-3xs bg-stone-100 text-stone-600 font-mono">
                            {evt.sourcePhase.toUpperCase()}
                          </span>

                          {/* Verification status pill */}
                          <span className="px-1.5 py-0.5 rounded text-3xs bg-amber-50 text-amber-900 border border-amber-200">
                            {evt.verificationStatus === 'user_recorded'
                              ? 'User-Recorded'
                              : 'Official Check Needed'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-sm text-stone-900">
                          {evt.title}
                        </h4>
                      </div>

                      {/* Date details */}
                      <div className="text-right shrink-0">
                        {evt.eventDate ? (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                            <Calendar className="h-3 w-3 text-stone-600" />
                            Event: {evt.eventDate}
                          </div>
                        ) : (
                          <div className="text-3xs text-stone-400">
                            Recorded: {new Date(evt.recordedAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                        {evt.plannedDate && (
                          <div className="text-3xs text-stone-400 mt-0.5">
                            Target: {evt.plannedDate}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {evt.description}
                    </p>

                    {/* Action or Evidence ID Footnote */}
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-3xs text-stone-400">
                      <div className="flex items-center gap-2">
                        {evt.actionId && (
                          <span>Task Ref: <strong className="text-stone-600 font-mono">{evt.actionId.substring(0, 16)}</strong></span>
                        )}
                        {evt.evidenceId && (
                          <span>Evidence Ref: <strong className="text-stone-600 font-mono">{evt.evidenceId.substring(0, 16)}</strong></span>
                        )}
                      </div>

                      {/* Edit / Delete for user notes */}
                      {isUserNote && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => handleOpenEditEvent(evt)}
                            className="text-stone-600 hover:text-stone-900 px-1.5 py-0.5 rounded border border-stone-200 hover:bg-stone-50 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="text-rose-600 hover:text-rose-900 px-1.5 py-0.5 rounded border border-rose-200 hover:bg-rose-50 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Statutory Verification & Monitoring Disclosure Notice */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4.5 text-xs text-stone-600 flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
            <span>Execution Timeline &amp; Plan Health Advisory</span>
            <span className="text-3xs font-semibold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">
              Operational Audit Trail
            </span>
          </div>
          <p className="text-3xs text-stone-600 leading-relaxed">
            {TIMELINE_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* 7. Modal for Adding / Editing Custom Timeline Note */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-bold text-base text-stone-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-700" />
                {editingEvent ? 'Edit' : 'Add'} Execution Timeline Note
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Note Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Visited local electricity board office regarding 15 kW transformer connection"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                  <span className="text-3xs text-stone-400 mt-0.5 block">
                    Actual date activity occurred.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Associated Action (Optional)</label>
                  <select
                    value={noteActionId}
                    onChange={(e) => setNoteActionId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-3xs"
                  >
                    <option value="">-- General Plan Activity --</option>
                    {actions.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.title.substring(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description &amp; Observations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  placeholder="Record factual progress notes, officer names discussed with, quotation numbers, or next follow-ups..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-3xs space-y-0.5">
                <div className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                  <span>User Record Disclaimer</span>
                </div>
                <p>
                  User-recorded entry. Does not constitute official bank approval, legal certification, or statutory compliance.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition cursor-pointer"
                >
                  Save Timeline Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
