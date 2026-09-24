import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban,
  FileText,
  Calendar,
  MapPin,
  IndianRupee,
  Share2,
  Download,
  Trash2,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Search,
  AlertCircle,
  ShieldCheck,
  Lock,
  Loader2,
  ArrowLeft,
  LogIn,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { SavedBusinessPlanRecord, BusinessPlan } from '../types/businessPlan.ts';
import { apiClient } from '../services/apiClient.ts';
import {
  getGuestSavedPlans,
  updateGuestPlanStatus,
  deleteGuestPlan
} from '../utils/guestStorage.ts';
import { formatINR } from '../utils/formatters.ts';
import { downloadPlanAsHtml, downloadPlanAsText } from '../utils/exportPlan.ts';
import { SharePlanModal } from './SharePlanModal.tsx';

interface SavedPlansWorkspaceProps {
  isAuthenticated: boolean;
  isGuest: boolean;
  onOpenPlan: (plan: BusinessPlan) => void;
  onCloseWorkspace: () => void;
  onNavigateToLogin?: () => void;
  onNewPlan?: () => void;
}

export const SavedPlansWorkspace: React.FC<SavedPlansWorkspaceProps> = ({
  isAuthenticated,
  isGuest,
  onOpenPlan,
  onCloseWorkspace,
  onNavigateToLogin,
  onNewPlan
}) => {
  const [plans, setPlans] = useState<SavedBusinessPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [planToShare, setPlanToShare] = useState<SavedBusinessPlanRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SavedBusinessPlanRecord | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        // Authenticated: uses the verified server-side session API
        const filterParam = statusFilter === 'all' ? undefined : statusFilter;
        const res = await apiClient.getUserBusinessPlans(filterParam);
        setPlans(res);
      } else {
        // Guest: uses isolated local browser storage
        const localPlans = getGuestSavedPlans();
        if (statusFilter === 'active') {
          setPlans(localPlans.filter((p) => p.status !== 'archived'));
        } else if (statusFilter === 'archived') {
          setPlans(localPlans.filter((p) => p.status === 'archived'));
        } else {
          setPlans(localPlans);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load saved plans.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, statusFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleToggleStatus = async (record: SavedBusinessPlanRecord) => {
    const nextStatus = record.status === 'archived' ? 'active' : 'archived';
    setActionLoadingId(record.id);
    try {
      if (isAuthenticated) {
        await apiClient.updateBusinessPlanStatus(record.id, nextStatus);
      } else {
        updateGuestPlanStatus(record.id, nextStatus);
      }
      await fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to update plan status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setActionLoadingId(planToDelete.id);
    try {
      if (isAuthenticated) {
        await apiClient.deleteBusinessPlan(planToDelete.id);
      } else {
        deleteGuestPlan(planToDelete.id);
      }
      setPlanToDelete(null);
      await fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter plans by search term (no subjective ranking or weighting)
  const filteredPlans = plans.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (p.title || p.businessName).toLowerCase().includes(q);
    const locationMatch = `${p.district} ${p.state}`.toLowerCase().includes(q);
    const categoryMatch = p.plan?.business?.businessCategory?.toLowerCase().includes(q) || false;
    return titleMatch || locationMatch || categoryMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-900">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-stone-900">
                My Saved Plans Workspace
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage, reopen, share, or export your saved Detailed Project Reports (DPRs).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNewPlan && (
              <button
                onClick={onNewPlan}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
              >
                <Layers className="h-4 w-4" />
                <span>New Plan Discovery</span>
              </button>
            )}
            <button
              onClick={onCloseWorkspace}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4 text-stone-600" />
              <span>Back to Analysis</span>
            </button>
          </div>
        </div>

        {/* Storage Model Transparency Banner */}
        {isAuthenticated ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cloud Account Sync Active:</span> Your plans are securely persisted under your authenticated account session. Only you can access or manage these records.
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Guest Mode Workspace:</span> These plans are stored locally in your browser's storage on this device.
                To preserve plans permanently across devices or share with verified ownership, sign in or register.
              </div>
            </div>
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-2xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Plans ({plans.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer ${
                statusFilter === 'archived'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Archived
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search plans by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-emerald-700"
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchPlans()}
            className="text-xs font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs">
          <Loader2 className="h-8 w-8 text-emerald-700 animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-stone-600">Loading your saved plans...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <FolderKanban className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-heading text-sm font-bold text-stone-800 mb-1">
            {searchQuery ? 'No matching plans found' : 'No saved plans yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `No saved plans matched "${searchQuery}". Try clearing your search query.`
              : 'Discover viable enterprises in the Budget Discovery tool and click "Save Plan" to manage them here.'}
          </p>
          {onNewPlan && !searchQuery && (
            <button
              onClick={onNewPlan}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
            >
              <Layers className="h-4 w-4" />
              <span>Start Enterprise Discovery</span>
            </button>
          )}
        </div>
      ) : (
        /* Saved Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((record) => {
            const isArchived = record.status === 'archived';
            const isActionLoading = actionLoadingId === record.id;
            return (
              <div
                key={record.id}
                className={`rounded-2xl border transition bg-white p-5 shadow-xs flex flex-col justify-between ${
                  isArchived
                    ? 'border-stone-200 bg-stone-50/70 opacity-80'
                    : 'border-stone-200 hover:border-emerald-300 hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Status Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-3xs font-bold uppercase tracking-wider ${
                        isArchived
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {isArchived ? 'Archived' : 'Active DPR'}
                    </span>

                    {record.shareSettings?.isShared && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-900 px-2 py-0.5 text-3xs font-bold">
                        <Share2 className="h-2.5 w-2.5" />
                        <span>Public Link</span>
                      </span>
                    )}

                    <span className="text-3xs text-stone-400">
                      {new Date(record.updatedAt || record.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Plan Title & Subtitle */}
                  <h3 className="font-heading text-sm font-bold text-stone-900 line-clamp-1 mb-0.5">
                    {record.title || record.businessName}
                  </h3>
                  <p className="text-2xs text-stone-500 mb-3 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                    <span>{record.district}, {record.state}</span>
                  </p>

                  {/* Key Financial Snapshot */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-2.5 mb-4 text-2xs">
                    <div>
                      <span className="text-stone-400 block text-3xs">Total Project Cost</span>
                      <span className="font-bold text-stone-800">{formatINR(record.projectCost)}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-3xs">Available Capital</span>
                      <span className="font-bold text-emerald-800">{formatINR(record.availableCapital)}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-3xs">Financing Gap</span>
                      <span className="font-bold text-amber-800">{formatINR(record.financingGap)}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-3xs">Est. Net Profit</span>
                      <span className="font-bold text-stone-800">
                        {record.plan?.financials?.monthlyNetProfit
                          ? `${formatINR(record.plan.financials.monthlyNetProfit)}/mo`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plan Card Actions */}
                <div className="space-y-2 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPlan(record.plan)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer shadow-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Open Plan</span>
                    </button>

                    <button
                      onClick={() => setPlanToShare(record)}
                      className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
                      title="Share read-only plan"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => downloadPlanAsHtml(record.plan, record.title)}
                      className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition cursor-pointer"
                      title="Download Offline HTML"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-3xs text-stone-400">
                    <button
                      onClick={() => handleToggleStatus(record)}
                      disabled={isActionLoading}
                      className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition cursor-pointer disabled:opacity-50"
                    >
                      {isArchived ? (
                        <>
                          <ArchiveRestore className="h-3 w-3 text-stone-500" />
                          <span>Unarchive</span>
                        </>
                      ) : (
                        <>
                          <Archive className="h-3 w-3 text-stone-500" />
                          <span>Archive</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setPlanToDelete(record)}
                      disabled={isActionLoading}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 transition cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Plan Modal */}
      {planToShare && (
        <SharePlanModal
          isOpen={true}
          onClose={() => setPlanToShare(null)}
          planId={planToShare.id}
          planTitle={planToShare.title || planToShare.businessName}
          initialShareSettings={planToShare.shareSettings}
          onShareUpdated={(isShared, shareToken) => {
            setPlans((prev) =>
              prev.map((p) =>
                p.id === planToShare.id
                  ? {
                      ...p,
                      shareSettings: {
                        isShared,
                        shareToken
                      }
                    }
                  : p
              )
            );
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h3 className="font-heading text-sm font-bold text-stone-900 mb-2">
              Delete Saved Business Plan?
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Are you sure you want to delete <strong>{planToDelete.title || planToDelete.businessName}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPlanToDelete(null)}
                className="rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={actionLoadingId === planToDelete.id}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-800 transition cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === planToDelete.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Delete Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
