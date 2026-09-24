import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  Globe,
  Loader2
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';

interface SharePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planTitle: string;
  initialShareSettings?: {
    isShared: boolean;
    shareToken?: string;
  };
  onShareUpdated?: (isShared: boolean, shareToken?: string) => void;
}

export const SharePlanModal: React.FC<SharePlanModalProps> = ({
  isOpen,
  onClose,
  planId,
  planTitle,
  initialShareSettings,
  onShareUpdated
}) => {
  const [isShared, setIsShared] = useState<boolean>(initialShareSettings?.isShared ?? false);
  const [shareToken, setShareToken] = useState<string | undefined>(initialShareSettings?.shareToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getShareUrl = (token: string) => {
    return `${window.location.origin}#share=${token}`;
  };

  const handleEnableShare = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.createPlanShareToken(planId);
      setIsShared(true);
      setShareToken(res.shareToken);
      if (onShareUpdated) onShareUpdated(true, res.shareToken);
    } catch (err: any) {
      setError(err.message || 'Failed to generate share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.revokePlanShareToken(planId);
      setIsShared(false);
      setShareToken(undefined);
      if (onShareUpdated) onShareUpdated(false, undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareToken) return;
    try {
      await navigator.clipboard.writeText(getShareUrl(shareToken));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-800" />
            <h3 className="font-heading text-base font-bold text-stone-900">
              Share Business &amp; Financing Plan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-stone-600 mb-4">
          Share a read-only snapshot of <strong>{planTitle}</strong> with lenders, advisors, or enterprise co-founders.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isShared && shareToken ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-emerald-800">
                  <Globe className="h-3.5 w-3.5" />
                  Public Link Active
                </span>
                <span className="text-3xs text-emerald-700">Read-Only</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl(shareToken)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 select-all font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-2xs text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-700">
                <Shield className="h-3.5 w-3.5 text-emerald-700" />
                <span>Privacy &amp; Security Guarantee</span>
              </div>
              <p>
                Recipients can view the plan's feasibility modeling, subsidies, and roadmap. Personal passwords, account emails, and contact details are strictly excluded.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                onClick={handleRevokeShare}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                <span>Revoke Link (Make Private)</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
              <Lock className="h-8 w-8 text-stone-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-stone-800 mb-1">
                This Plan is Currently Private
              </h4>
              <p className="text-2xs text-stone-500 mb-4 max-w-xs mx-auto">
                Only you can view and edit this plan. Generate a secure, opaque link to share it with anyone.
              </p>

              <button
                onClick={handleEnableShare}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generating Link...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Generate Shareable Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-100">
              <button
                onClick={onClose}
                className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
