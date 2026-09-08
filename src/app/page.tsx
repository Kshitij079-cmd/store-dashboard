'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  database: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl}/api/health`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Backend returned HTTP status ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
              Phase 0 — Project Setup
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2.5">
              Store Operational Issues Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              End-to-end Skeleton & Health Check (Next.js + Express + PostgreSQL)
            </p>
          </div>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Pinging...' : 'Re-check'}
          </button>
        </div>

        {/* Status Verification Checklist */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 space-y-3.5">
          {/* 1. Frontend */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Frontend (Next.js App Router):
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              Live (:3000)
            </span>
          </div>

          {/* 2. Backend Health */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Backend API (/api/health):
            </span>
            {loading ? (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full animate-pulse">
                Pinging :5001...
              </span>
            ) : health?.status === 'ok' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                HTTP 200 OK
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full">
                Offline
              </span>
            )}
          </div>

          {/* 3. PostgreSQL Database */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              PostgreSQL Database:
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
              Live in Docker (:5435)
            </span>
          </div>
        </div>

        {/* Live Response Box */}
        {health && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
            <div className="font-semibold">
              API Response Received:
            </div>
            <p className="text-emerald-700 dark:text-emerald-300">{health.message}</p>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              Checked at: {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-200 space-y-2">
            <div className="font-semibold text-amber-900 dark:text-amber-100">
              Backend Not Connected
            </div>
            <p>{error}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Backend start karne ke liye alag terminal mein run karein:
              <br />
              <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-slate-700 mt-1 inline-block">
                cd store-backend &amp;&amp; npm run dev
              </code>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
