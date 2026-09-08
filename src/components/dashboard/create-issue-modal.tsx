'use client';

import React, { useState, useEffect } from 'react';
import { useIssues } from '@/context/issues-context';
import { Priority } from '@/types/issues';
import { X, Plus, AlertCircle, Sparkles, Building2, Tag, ShieldAlert, UserCheck } from 'lucide-react';

export function CreateIssueModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateIssue,
    rawStores,
    rawCategories,
    availableManagers,
  } = useIssues();

  const [storeId, setStoreId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [assignedManagerId, setAssignedManagerId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-select first store & category once loaded
  useEffect(() => {
    if (rawStores.length > 0 && storeId === 0) {
      setStoreId(rawStores[0].storeId);
    }
  }, [rawStores, storeId]);

  useEffect(() => {
    if (rawCategories.length > 0 && categoryId === 0) {
      setCategoryId(rawCategories[0].categoryId);
    }
  }, [rawCategories, categoryId]);

  // Accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreateModalOpen) {
        setIsCreateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, setIsCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!shortDescription.trim()) {
      setErrorMessage('Please provide a short summary of the issue.');
      return;
    }

    if (!storeId || !categoryId) {
      setErrorMessage('Please select a valid store and issue category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await handleCreateIssue({
        storeId,
        categoryId,
        shortDescription: shortDescription.trim(),
        detailedDescription: detailedDescription.trim() || undefined,
        priority,
        assignedManagerId: assignedManagerId || null,
      });

      // Reset form fields
      setShortDescription('');
      setDetailedDescription('');
      setPriority('Medium');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsCreateModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-issue-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="create-issue-title" className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                Report Operational Issue
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Dispatch an operational incident to store managers
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Store and Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Store */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>Store</span>
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(parseInt(e.target.value, 10))}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {rawStores.map((s) => (
                  <option key={s.storeId} value={s.storeId}>
                    {s.storeNumber} — {s.storeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Category</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {rawCategories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Short Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. POS terminal 3 receipt printer malfunctioning"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Detailed Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add specifics such as error codes, customer impact, or immediate steps taken..."
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Priority & Assigned Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-slate-400" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Low', 'Medium', 'High'] as Priority[]).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSel
                          ? p === 'High'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : p === 'Medium'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned Manager */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span>Assign Duty Manager</span>
              </label>
              <select
                value={assignedManagerId || ''}
                onChange={(e) =>
                  setAssignedManagerId(e.target.value ? parseInt(e.target.value, 10) : null)
                }
                className="w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {availableManagers.map((m) => (
                  <option key={m.managerId} value={m.managerId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Report Issue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
