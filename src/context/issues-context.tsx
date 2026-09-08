'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  OperationalIssue,
  IssueFilterState,
  DashboardMetrics,
  Status,
  ManagementNote,
} from '@/types/issues';
import { INITIAL_ISSUES } from '@/data/intial_issues';
import {
  fetchIssues,
  fetchMetrics,
  fetchMetadata,
  updateIssueStatus,
  addIssueNote,
} from '@/lib/api';

interface IssuesContextType {
  issues: OperationalIssue[];
  filters: IssueFilterState;
  metrics: DashboardMetrics;
  selectedIssue: OperationalIssue | null;
  availableStores: string[];
  availableCategories: string[];
  availableManagers: Array<{ managerId: number; fullName: string }>;
  isLoading: boolean;
  isBackendOnline: boolean;
  setSelectedIssueId: (id: string | null) => void;
  setFilter: (key: keyof IssueFilterState, value: string) => void;
  resetFilters: () => void;
  handleStatusChange: (issueId: string, newStatus: Status, changedBy?: number | null) => Promise<void>;
  handleAddNote: (issueId: string, noteText: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultFilters: IssueFilterState = {
  store: 'All',
  category: 'All',
  priority: 'All',
  status: 'All',
  searchQuery: '',
};

const defaultMetrics: DashboardMetrics = {
  totalOpen: 0,
  highPriority: 0,
  resolved: 0,
  requiresFollowUp: 0,
};

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<OperationalIssue[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [filters, setFilters] = useState<IssueFilterState>(defaultFilters);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [availableStores, setAvailableStores] = useState<string[]>(['All']);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);
  const [availableManagers, setAvailableManagers] = useState<Array<{ managerId: number; fullName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Load Metadata (Stores & Categories & Managers) for Dropdowns
  const loadMeta = useCallback(async () => {
    try {
      const meta = await fetchMetadata();
      const stores = ['All', ...meta.stores.map((s) => s.storeNumber)];
      const categories = ['All', ...meta.categories.map((c) => c.categoryName)];
      setAvailableStores(stores);
      setAvailableCategories(categories);
      setAvailableManagers(meta.managers || []);
      setIsBackendOnline(true);
    } catch {
      // Fallback from mock data
      const stores = ['All', ...Array.from(new Set(INITIAL_ISSUES.map((i) => i.storeNumber))).sort()];
      const categories = ['All', ...Array.from(new Set(INITIAL_ISSUES.map((i) => i.category))).sort()];
      setAvailableStores(stores);
      setAvailableCategories(categories);
      setAvailableManagers([]);
      setIsBackendOnline(false);
    }
  }, []);

  // Load Issues & Metrics
  const loadIssuesAndMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedIssues, fetchedMetrics] = await Promise.all([
        fetchIssues({
          store: filters.store,
          category: filters.category,
          priority: filters.priority,
          status: filters.status,
          search: filters.searchQuery,
        }),
        fetchMetrics(),
      ]);

      setIssues(fetchedIssues);
      setMetrics(fetchedMetrics);
      setIsBackendOnline(true);
    } catch (err) {
      console.warn('Backend unavailable, using local mock data filter:', err);
      setIsBackendOnline(false);

      // Local client-side fallback
      const filtered = INITIAL_ISSUES.filter((issue) => {
        const matchesStore = filters.store === 'All' || issue.storeNumber === filters.store;
        const matchesCategory = filters.category === 'All' || issue.category === filters.category;
        const matchesPriority = filters.priority === 'All' || issue.priority === filters.priority;
        const matchesStatus = filters.status === 'All' || issue.status === filters.status;
        const q = filters.searchQuery.trim().toLowerCase();
        const matchesSearch =
          q === '' ||
          issue.shortDescription.toLowerCase().includes(q) ||
          issue.storeName.toLowerCase().includes(q) ||
          issue.assignedManager.toLowerCase().includes(q);

        return matchesStore && matchesCategory && matchesPriority && matchesStatus && matchesSearch;
      });

      setIssues(filtered);

      const totalOpen = INITIAL_ISSUES.filter((i) => i.status !== 'Resolved').length;
      const highPriority = INITIAL_ISSUES.filter((i) => i.priority === 'High' && i.status !== 'Resolved').length;
      const resolved = INITIAL_ISSUES.filter((i) => i.status === 'Resolved').length;
      const requiresFollowUp = INITIAL_ISSUES.filter((i) => i.requiresFollowUp && i.status !== 'Resolved').length;
      setMetrics({ totalOpen, highPriority, resolved, requiresFollowUp });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadIssuesAndMetrics();
  }, [loadIssuesAndMetrics]);

  // Handle Status Update (Phase 6: Status Management & History)
  const handleStatusChange = async (issueId: string, newStatus: Status, changedBy?: number | null) => {
    // 1. Optimistic update in UI
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const followUp = newStatus === 'Resolved' ? false : issue.requiresFollowUp;
          const managerObj = changedBy ? availableManagers.find((m) => m.managerId === changedBy) : null;
          const optimisticHistory = {
            id: `sh-temp-${Date.now()}`,
            oldStatus: issue.status,
            newStatus,
            changedBy: managerObj?.fullName || issue.assignedManager || 'Store Manager',
            changedAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          return {
            ...issue,
            status: newStatus,
            dateResolved: newStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : null,
            requiresFollowUp: followUp,
            statusHistory: [optimisticHistory, ...(issue.statusHistory || [])],
          };
        }
        return issue;
      })
    );

    // 2. Call backend API if online
    if (isBackendOnline) {
      try {
        const updatedIssue = await updateIssueStatus(issueId, newStatus, changedBy);
        // Replace with persisted server data (with real DB IDs and relations)
        setIssues((prev) => prev.map((i) => (i.id === issueId ? updatedIssue : i)));
        const updatedMetrics = await fetchMetrics();
        setMetrics(updatedMetrics);
      } catch (err) {
        console.error('Failed to update status on server:', err);
      }
    }
  };

  // Handle Add Note
  const handleAddNote = async (issueId: string, noteText: string) => {
    if (!noteText.trim()) return;

    const newNote: ManagementNote = {
      id: `n-${Date.now()}`,
      author: 'Current Manager',
      content: noteText.trim(),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // 1. Optimistic update in UI
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            notes: [newNote, ...(issue.notes || [])],
          };
        }
        return issue;
      })
    );

    // 2. Call backend API if online
    if (isBackendOnline) {
      try {
        await addIssueNote(issueId, noteText.trim());
      } catch (err) {
        console.error('Failed to add note to server:', err);
      }
    }
  };

  const setFilter = (key: keyof IssueFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const selectedIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  return (
    <IssuesContext.Provider
      value={{
        issues,
        filters,
        metrics,
        selectedIssue,
        availableStores,
        availableCategories,
        availableManagers,
        isLoading,
        isBackendOnline,
        setSelectedIssueId,
        setFilter,
        resetFilters,
        handleStatusChange,
        handleAddNote,
        refresh: loadIssuesAndMetrics,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
}
