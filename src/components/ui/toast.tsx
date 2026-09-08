'use client';

import React from 'react';
import { useIssues } from '@/context/issues-context';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast() {
  const { toast } = useIssues();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100',
    error: 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-slate-800 dark:text-slate-100',
    info: 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm pointer-events-auto">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md ${
          bgStyles[toast.type]
        }`}
        role="alert"
        aria-live="polite"
      >
        {icons[toast.type]}
        <span className="text-xs font-semibold">{toast.message}</span>
      </div>
    </div>
  );
}
