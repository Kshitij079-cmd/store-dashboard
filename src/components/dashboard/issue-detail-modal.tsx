'use client';

import React, { useState } from 'react';
import { useIssues } from '@/context/issues-context';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Status } from '@/types/issues';
import {
  X,
  Building2,
  Calendar,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  History,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export function IssueDetailModal() {
  const {
    selectedIssue,
    setSelectedIssueId,
    handleStatusChange,
    handleAddNote,
    availableManagers,
  } = useIssues();

  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);

  if (!selectedIssue) return null;

  const statuses: Status[] = ['New', 'In Progress', 'Resolved'];

  const onStatusSelectChange = async (newStatus: Status) => {
    if (newStatus === selectedIssue.status) return;
    setIsUpdatingStatus(true);
    try {
      await handleStatusChange(selectedIssue.id, newStatus, selectedManagerId);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const onAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      await handleAddNote(selectedIssue.id, noteText.trim());
      setNoteText('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedIssueId(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
              {selectedIssue.id}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {selectedIssue.category}
            </span>
          </div>

          <button
            onClick={() => setSelectedIssueId(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Issue Title & Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {selectedIssue.shortDescription}
            </h2>
            {selectedIssue.detailedDescription && (
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedIssue.detailedDescription}
              </p>
            )}
          </div>

          {/* Phase 6: Status Management & Dropdown Section */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Status Management</span>
              </div>

              {/* PDF Requirement: Status Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Dropdown:</span>
                <select
                  aria-label="Change Status"
                  value={selectedIssue.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => onStatusSelectChange(e.target.value as Status)}
                  className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Status Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((st) => {
                const isActive = selectedIssue.status === st;
                return (
                  <button
                    key={st}
                    disabled={isUpdatingStatus}
                    onClick={() => onStatusSelectChange(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? st === 'Resolved'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                          : st === 'In Progress'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                          : 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {st === 'In Progress' && <Clock className="w-3.5 h-3.5" />}
                    {st === 'New' && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                    <span>{st}</span>
                    {isActive && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Change By Manager Selector */}
            {availableManagers.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Changed By (Audit Author):</span>
                </span>
                <select
                  aria-label="Audit Author Manager"
                  value={selectedManagerId ?? selectedIssue.assignedManagerId ?? ''}
                  onChange={(e) => setSelectedManagerId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="">Assigned Lead ({selectedIssue.assignedManager})</option>
                  {availableManagers.map((m) => (
                    <option key={m.managerId} value={m.managerId}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Issue Metadata Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Store Location</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedIssue.storeNumber}</span>
              </div>
              <div className="text-[11px] text-slate-500">{selectedIssue.storeName}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Date Reported</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedIssue.dateReported}</span>
              </div>
              {selectedIssue.dateResolved && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Resolved: {selectedIssue.dateResolved}</span>
                </div>
              )}
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Priority</div>
              <div className="mt-1">
                <PriorityBadge priority={selectedIssue.priority} />
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Assigned Lead</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedIssue.assignedManager}</span>
              </div>
            </div>
          </div>

          {/* Phase 6: Status History Section (Audit Trail) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span>Status History & Audit Trail ({selectedIssue.statusHistory?.length || 0})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedIssue.statusHistory && selectedIssue.statusHistory.length > 0 ? (
                selectedIssue.statusHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {entry.oldStatus ? (
                        <>
                          <StatusBadge status={entry.oldStatus} />
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Initial</span>
                      )}
                      <StatusBadge status={entry.newStatus} />
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{entry.changedBy}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{entry.changedAt}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                  No previous status transitions recorded.
                </div>
              )}
            </div>
          </div>

          {/* Phase 7: Management Notes & Activity Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Management Notes ({selectedIssue.notes?.length || 0})</span>
              </h3>
            </div>

            {/* Notes Timeline */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedIssue.notes && selectedIssue.notes.length > 0 ? (
                selectedIssue.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {note.author}
                      </span>
                      <span className="text-[11px]">{note.createdAt}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                  No management notes added yet.
                </div>
              )}
            </div>

            {/* Add Short Management Note Form (500 char limit per spec) */}
            <form onSubmit={onAddNoteSubmit} className="pt-2 flex gap-2">
              <input
                type="text"
                maxLength={500}
                placeholder="Add a short management note or action item..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!noteText.trim() || isSubmittingNote}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Add Note</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
