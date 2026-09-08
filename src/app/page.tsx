'use client';

import React from 'react';
import { IssuesProvider } from '@/context/issues-context';
import { DashboardHeader } from '@/components/dashboard/header';
import { MetricsSummary } from '@/components/dashboard/metrics-summary';
import { FilterBar } from '@/components/dashboard/filter-bar';
import { IssuesTable } from '@/components/dashboard/issues-table';
import { IssueDetailModal } from '@/components/dashboard/issue-detail-modal';

function DashboardContent() {
  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 flex flex-col antialiased">
      <DashboardHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Top KPI Summary Cards */}
        <MetricsSummary />

        {/* 2. Filter & Search Control Bar */}
        <FilterBar />

        {/* 3. All Issues Table View */}
        <IssuesTable />

        {/* 4. Issue Detail & Action Modal */}
        <IssueDetailModal />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        Retail Store Operational Issues Hub &bull; Powered by Next.js &bull; Express &bull; PostgreSQL
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <IssuesProvider>
      <DashboardContent />
    </IssuesProvider>
  );
}
