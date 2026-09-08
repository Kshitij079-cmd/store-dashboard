import React from 'react';
import { Priority, Status } from '@/types/issues';
import { AlertTriangle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const isHigh = priority === 'High';
  const isMed = priority === 'Medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isHigh
          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          : isMed
          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
      }`}
    >
      {isHigh ? (
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
      ) : isMed ? (
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      ) : null}
      <span>{priority}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const isResolved = status === 'Resolved';
  const isInProgress = status === 'In Progress';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isResolved
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
          : isInProgress
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
          : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
      }`}
    >
      {isResolved ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : isInProgress ? (
        <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-spin-slow" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
      )}
      <span>{status}</span>
    </span>
  );
}
