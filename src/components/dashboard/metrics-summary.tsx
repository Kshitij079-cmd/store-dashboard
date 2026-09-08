'use client';

import React from 'react';
import { useIssues } from '@/context/issues-context';
import { AlertTriangle, CheckCircle2, Clock, Inbox } from 'lucide-react';

export function MetricsSummary() {
  const { metrics, setFilter } = useIssues();

  const cards = [
    {
      id: 'totalOpen',
      label: 'Total Open Issues',
      value: metrics.totalOpen,
      subtext: 'Active operational escalations',
      icon: Inbox,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
      borderStyle: 'border-slate-200 dark:border-slate-800 hover:border-blue-300',
      badge: 'Active Workload',
      onClick: () => {
        // Filter by all open
        setFilter('status', 'All');
      },
    },
    {
      id: 'highPriority',
      label: 'High-Priority Issues',
      value: metrics.highPriority,
      subtext: 'Requires urgent supervisor review',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      borderStyle: 'border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20 hover:border-rose-400 shadow-sm shadow-rose-500/5',
      badge: 'Immediate Action',
      badgeClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      onClick: () => {
        setFilter('priority', 'High');
      },
    },
    {
      id: 'resolved',
      label: 'Resolved Issues',
      value: metrics.resolved,
      subtext: 'Successfully closed tickets',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      borderStyle: 'border-slate-200 dark:border-slate-800 hover:border-emerald-300',
      badge: 'Completed',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      onClick: () => {
        setFilter('status', 'Resolved');
      },
    },
    {
      id: 'followUp',
      label: 'Requires Follow-up',
      value: metrics.requiresFollowUp,
      subtext: 'Open bottlenecks & vendor escalations',
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
      borderStyle: 'border-slate-200 dark:border-slate-800 hover:border-amber-300',
      badge: 'Attention Needed',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      onClick: () => {
        setFilter('priority', 'High');
      },
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
            className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 transition-all cursor-pointer hover:shadow-md ${card.borderStyle}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  card.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {card.badge}
              </span>
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
