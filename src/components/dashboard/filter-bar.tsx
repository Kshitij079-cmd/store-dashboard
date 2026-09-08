'use client';

import React from 'react';
import { useIssues } from '@/context/issues-context';
import { Filter, Search, RotateCcw, X } from 'lucide-react';

export function FilterBar() {
  const {
    filters,
    setFilter,
    resetFilters,
    availableStores,
    availableCategories,
    issues,
  } = useIssues();

  const isFiltered =
    filters.store !== 'All' ||
    filters.category !== 'All' ||
    filters.priority !== 'All' ||
    filters.status !== 'All' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, store name, or manager..."
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilter('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Store Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Store
            </label>
            <select
              value={filters.store}
              onChange={(e) => setFilter('store', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableStores.map((store) => (
                <option key={store} value={store}>
                  {store === 'All' ? 'All Stores' : store}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High / Critical</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Phase 5: Active Filters Chips with Individual Remove Buttons */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-medium mr-1">Active Filters:</span>

          {filters.store !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Store: {filters.store}
              <button
                onClick={() => setFilter('store', 'All')}
                className="hover:text-indigo-900 dark:hover:text-white"
                title="Remove Store filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Category: {filters.category}
              <button
                onClick={() => setFilter('category', 'All')}
                className="hover:text-indigo-900 dark:hover:text-white"
                title="Remove Category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.priority !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Priority: {filters.priority}
              <button
                onClick={() => setFilter('priority', 'All')}
                className="hover:text-rose-900 dark:hover:text-white"
                title="Remove Priority filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.status !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Status: {filters.status}
              <button
                onClick={() => setFilter('status', 'All')}
                className="hover:text-sky-900 dark:hover:text-white"
                title="Remove Status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchQuery.trim() !== '' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Search: &quot;{filters.searchQuery}&quot;
              <button
                onClick={() => setFilter('searchQuery', '')}
                className="hover:text-slate-900 dark:hover:text-white"
                title="Clear search text"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 ml-auto flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {/* Filter Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{issues.length}</strong> matching issues
          </span>
        </div>
      </div>
    </div>
  );
}
