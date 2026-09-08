'use client';

import React, { useState, useMemo } from 'react';
import { useIssues } from '@/context/issues-context';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { OperationalIssue } from '@/types/issues';
import {
  ChevronRight,
  Calendar,
  User,
  Building2,
  AlertOctagon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
} from 'lucide-react';

type SortColumn = 'store' | 'category' | 'shortDescription' | 'dateReported' | 'priority' | 'status' | 'manager';
type SortOrder = 'asc' | 'desc';

export function IssuesTable() {
  const { issues, setSelectedIssueId, resetFilters, isLoading, setIsCreateModalOpen } = useIssues();

  // Phase 5: Column Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>('dateReported');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Phase 5: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Sorted Issues
  const sortedIssues = useMemo(() => {
    const list = [...issues];
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    const statusWeight = { New: 3, 'In Progress': 2, Resolved: 1 };

    list.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortColumn) {
        case 'store':
          aVal = a.storeNumber;
          bVal = b.storeNumber;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'shortDescription':
          aVal = a.shortDescription.toLowerCase();
          bVal = b.shortDescription.toLowerCase();
          break;
        case 'dateReported':
          aVal = new Date(a.dateReported).getTime();
          bVal = new Date(b.dateReported).getTime();
          break;
        case 'priority':
          aVal = priorityWeight[a.priority] || 0;
          bVal = priorityWeight[b.priority] || 0;
          break;
        case 'status':
          aVal = statusWeight[a.status] || 0;
          bVal = statusWeight[b.status] || 0;
          break;
        case 'manager':
          aVal = a.assignedManager.toLowerCase();
          bVal = b.assignedManager.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [issues, sortColumn, sortOrder]);

  // Paginated Issues
  const totalPages = Math.ceil(sortedIssues.length / pageSize) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedIssues.slice(start, start + pageSize);
  }, [sortedIssues, currentPage, pageSize]);

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
    );
  };

  // Phase 9 Polish: Sleek skeleton loader while fetching data
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100 dark:border-slate-800">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="h-3.5 w-52 bg-slate-200 dark:bg-slate-800 rounded hidden md:block" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Phase 9 Polish: Engaging Empty State with Reset and Create Issue buttons
  if (issues.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No operational issues found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No issues match the selected combination of store, category, priority, status, or search query.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={resetFilters}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
          >
            + Report New Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
              {/* Store Column */}
              <th
                scope="col"
                onClick={() => handleSort('store')}
                className="py-3.5 px-4 sm:px-6 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Store</span>
                  {renderSortIcon('store')}
                </div>
              </th>

              {/* Category Column */}
              <th
                scope="col"
                onClick={() => handleSort('category')}
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  {renderSortIcon('category')}
                </div>
              </th>

              {/* Short Description */}
              <th
                scope="col"
                onClick={() => handleSort('shortDescription')}
                className="py-3.5 px-4 min-w-[280px] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Short Description</span>
                  {renderSortIcon('shortDescription')}
                </div>
              </th>

              {/* Date Reported */}
              <th
                scope="col"
                onClick={() => handleSort('dateReported')}
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date Reported</span>
                  {renderSortIcon('dateReported')}
                </div>
              </th>

              {/* Priority */}
              <th
                scope="col"
                onClick={() => handleSort('priority')}
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>

              {/* Status */}
              <th
                scope="col"
                onClick={() => handleSort('status')}
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Assigned Manager */}
              <th
                scope="col"
                onClick={() => handleSort('manager')}
                className="py-3.5 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Assigned Manager</span>
                  {renderSortIcon('manager')}
                </div>
              </th>

              {/* Action */}
              <th scope="col" className="py-3.5 px-4 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            {paginatedIssues.map((issue) => {
              const isHigh = issue.priority === 'High';

              return (
                <tr
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`group cursor-pointer transition-colors ${
                    isHigh
                      ? 'hover:bg-rose-50/40 dark:hover:bg-rose-950/20 bg-rose-50/10'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Store Number & Name */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {issue.storeNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                          {issue.storeName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {issue.category}
                    </span>
                  </td>

                  {/* Short Description */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {issue.shortDescription}
                    </div>
                    {issue.notes && issue.notes.length > 0 && (
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                        💬 {issue.notes.length} {issue.notes.length === 1 ? 'note' : 'notes'}
                      </div>
                    )}
                  </td>

                  {/* Date Reported */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{issue.dateReported}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <PriorityBadge priority={issue.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <StatusBadge status={issue.status} />
                  </td>

                  {/* Assigned Manager */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{issue.assignedManager}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssueId(issue.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phase 5: Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min((currentPage - 1) * pageSize + 1, sortedIssues.length)}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, sortedIssues.length)}
            </strong>{' '}
            of <strong className="text-slate-800 dark:text-slate-200">{sortedIssues.length}</strong> issues
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
