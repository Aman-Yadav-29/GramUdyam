import React from 'react';
import { Database, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSystemHealth } from '../hooks/useSystemHealth.ts';

export const SystemStatusBadge: React.FC = () => {
  const { health, loading, error } = useSystemHealth();

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500 border border-stone-200">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>Connecting Backend...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800 border border-amber-200">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
        <span>Local Mode Standby</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 border border-emerald-200/80 shadow-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
      </span>
      <div className="flex items-center gap-1.5">
        <Server className="h-3 w-3 text-emerald-700" />
        <span className="font-semibold">API Live</span>
        <span className="text-stone-300">•</span>
        <Database className="h-3 w-3 text-emerald-700" />
        <span className="capitalize">{health.database.type}</span>
      </div>
    </div>
  );
};
