'use client';

import React from 'react';
import { useIssues } from '@/context/issues-context';
import { AlertTriangle, CheckCircle2, Clock, Inbox, Filter } from 'lucide-react';

export function MetricsSummary() {
  const { metrics, filters, toggleTileFilter } = useIssues();

  const isOpenActive = filters.status === 'New,In Progress' && !filters.followUp;
  const isHighPriorityActive = filters.priority === 'High';
  const isResolvedActive = filters.status === 'Resolved';
  const isFollowUpActive = filters.followUp === true;

  const cards = [
    {
      id: 'open',
      label: 'Open Issues',
      value: metrics.open ?? metrics.totalOpen,
      subtext: 'Active operational workload',
      icon: Inbox,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      isActive: isOpenActive,
      borderStyle: isOpenActive
        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md'
        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300',
      badge: isOpenActive ? 'Active Filter' : 'Click to Filter',
      badgeClass: isOpenActive
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      onClick: () => toggleTileFilter('open'),
    },
    {
      id: 'high_priority',
      label: 'High-Priority Issues',
      value: metrics.high_priority ?? metrics.highPriority,
      subtext: 'Critical bottlenecks needing review',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      isActive: isHighPriorityActive,
      borderStyle: isHighPriorityActive
        ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 shadow-md'
        : 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20 hover:border-rose-400',
      badge: isHighPriorityActive ? 'Active Filter' : 'Immediate Action',
      badgeClass: isHighPriorityActive
        ? 'bg-rose-600 text-white border-rose-600'
        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      onClick: () => toggleTileFilter('high_priority'),
    },
    {
      id: 'resolved',
      label: 'Resolved Issues',
      value: metrics.resolved,
      subtext: 'Successfully closed tickets',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      isActive: isResolvedActive,
      borderStyle: isResolvedActive
        ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30 shadow-md'
        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300',
      badge: isResolvedActive ? 'Active Filter' : 'Completed',
      badgeClass: isResolvedActive
        ? 'bg-emerald-600 text-white border-emerald-600'
        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      onClick: () => toggleTileFilter('resolved'),
    },
    {
      id: 'follow_up',
      label: 'Requires Follow-up',
      value: metrics.follow_up ?? metrics.requiresFollowUp,
      subtext: 'In Progress > 3 days without update',
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
      isActive: isFollowUpActive,
      borderStyle: isFollowUpActive
        ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/30 dark:bg-amber-950/30 shadow-md'
        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300',
      badge: isFollowUpActive ? 'Active Filter' : 'Stale (>3 days)',
      badgeClass: isFollowUpActive
        ? 'bg-amber-600 text-white border-amber-600'
        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      onClick: () => toggleTileFilter('follow_up'),
    },
  ];

  return (
    <section aria-label="Operational Key Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            role="button"
            tabIndex={0}
            title={`${card.label} (Click to filter table)`}
            className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 transition-all cursor-pointer hover:shadow-md select-none ${card.borderStyle}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                {card.isActive && <Filter className="w-3 h-3 text-indigo-500 animate-pulse" />}
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                    card.badgeClass
                  }`}
                >
                  {card.badge}
                </span>
              </div>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {card.label}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
