'use client';

import React from 'react';
import { useIssues } from '@/context/issues-context';
import { LayoutDashboard, Database, RefreshCw, UserCheck, Plus } from 'lucide-react';

export function DashboardHeader() {
  const { isBackendOnline, isLoading, refresh, setIsCreateModalOpen } = useIssues();

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Store Operations Hub
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                Live Ops
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-store issue triage, resolution workflows, and management audit trail
            </p>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Phase 9: Report Issue Action Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>

          {/* Database Connection Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              isBackendOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isBackendOnline ? 'PostgreSQL Live (:5435)' : 'Local Demo Mode'}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh issues and metrics from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Role Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                Duty Manager
              </div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Regional Ops Lead
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
