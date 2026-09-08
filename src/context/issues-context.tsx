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
  checkBackendHealth,
  fetchIssuesFromBackend,
  updateIssueStatusBackend,
  addIssueNoteBackend,
} from '@/lib/api';

const STORAGE_KEY = 'store_operational_issues_cache_v2';

interface IssuesContextType {
  issues: OperationalIssue[];
  filteredIssues: OperationalIssue[];
  filters: IssueFilterState;
  metrics: DashboardMetrics;
  selectedIssue: OperationalIssue | null;
  availableStores: string[];
  availableCategories: string[];
  isBackendConnected: boolean;
  isLoading: boolean;
  setSelectedIssueId: (id: string | null) => void;
  setFilter: (key: keyof IssueFilterState, value: string) => void;
  resetFilters: () => void;
  updateStatus: (issueId: string, newStatus: Status) => Promise<void>;
  addNote: (issueId: string, content: string, author?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  resetToDefault: () => void;
}

const defaultFilters: IssueFilterState = {
  store: 'All',
  category: 'All',
  priority: 'All',
  status: 'All',
  searchQuery: '',
};

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<OperationalIssue[]>([]);
  const [filters, setFilters] = useState<IssueFilterState>(defaultFilters);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const backendOnline = await checkBackendHealth();
    setIsBackendConnected(backendOnline);

    if (backendOnline) {
      try {
        const backendIssues = await fetchIssuesFromBackend();
        setIssues(backendIssues);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(backendIssues));
        }
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local cache:', err);
      }
    }

    // Fallback to localStorage or INITIAL_ISSUES
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setIssues(JSON.parse(saved));
          setIsLoading(false);
          return;
        } catch {
          // ignore parsing error
        }
      }
    }

    setIssues(INITIAL_ISSUES);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined' && issues.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    }
  }, [issues, isLoading]);

  // Status update
  const updateStatus = async (issueId: string, newStatus: Status) => {
    // Optimistic UI update
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const followUp = newStatus === 'Resolved' ? false : issue.requiresFollowUp;
          return { ...issue, status: newStatus, requiresFollowUp: followUp };
        }
        return issue;
      })
    );

    // If backend connected, sync with SQL DB
    if (isBackendConnected) {
      const numericId = parseInt(issueId.replace('ISS-', ''), 10);
      if (!isNaN(numericId)) {
        try {
          await updateIssueStatusBackend(numericId, newStatus);
        } catch (err) {
          console.error('Failed to sync status with backend:', err);
        }
      }
    }
  };

  // Add management note
  const addNote = async (issueId: string, content: string, author: string = 'Current Manager') => {
    if (!content.trim()) return;

    const newNote: ManagementNote = {
      id: `n-${Date.now()}`,
      author,
      content: content.trim(),
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

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

    if (isBackendConnected) {
      const numericId = parseInt(issueId.replace('ISS-', ''), 10);
      if (!isNaN(numericId)) {
        try {
          await addIssueNoteBackend(numericId, content.trim());
        } catch (err) {
          console.error('Failed to sync note with backend:', err);
        }
      }
    }
  };

  // Filters
  const setFilter = (key: keyof IssueFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const resetToDefault = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    loadData();
  };

  // Multi-criteria Filtering
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesStore = filters.store === 'All' || issue.storeNumber === filters.store;
      const matchesCategory = filters.category === 'All' || issue.category === filters.category;
      const matchesPriority = filters.priority === 'All' || issue.priority === filters.priority;
      const matchesStatus = filters.status === 'All' || issue.status === filters.status;

      const q = filters.searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        issue.shortDescription.toLowerCase().includes(q) ||
        issue.storeName.toLowerCase().includes(q) ||
        issue.storeNumber.toLowerCase().includes(q) ||
        issue.assignedManager.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q);

      return matchesStore && matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });
  }, [issues, filters]);

  // KPI Metrics Calculation
  const metrics = useMemo<DashboardMetrics>(() => {
    const totalOpen = issues.filter((i) => i.status !== 'Resolved').length;
    const highPriority = issues.filter((i) => i.priority === 'High' && i.status !== 'Resolved').length;
    const resolved = issues.filter((i) => i.status === 'Resolved').length;
    const requiresFollowUp = issues.filter((i) => i.requiresFollowUp && i.status !== 'Resolved').length;

    return { totalOpen, highPriority, resolved, requiresFollowUp };
  }, [issues]);

  // Dynamic filter dropdown lists
  const availableStores = useMemo(() => {
    const stores = Array.from(new Set(issues.map((i) => i.storeNumber)));
    return ['All', ...stores.sort()];
  }, [issues]);

  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(issues.map((i) => i.category)));
    return ['All', ...categories.sort()];
  }, [issues]);

  const selectedIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  return (
    <IssuesContext.Provider
      value={{
        issues,
        filteredIssues,
        filters,
        metrics,
        selectedIssue,
        availableStores,
        availableCategories,
        isBackendConnected,
        isLoading,
        setSelectedIssueId,
        setFilter,
        resetFilters,
        updateStatus,
        addNote,
        refreshData: loadData,
        resetToDefault,
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
