'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  OperationalIssue,
  IssueFilterState,
  DashboardMetrics,
  Status,
  Priority,
  ManagementNote,
} from '@/types/issues';
import { INITIAL_ISSUES } from '@/data/intial_issues';
import {
  fetchIssues,
  fetchMetrics,
  fetchMetadata,
  updateIssueStatus,
  addIssueNote,
  deleteIssueNote,
  createIssue,
} from '@/lib/api';

export interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface IssuesContextType {
  issues: OperationalIssue[];
  filters: IssueFilterState;
  metrics: DashboardMetrics;
  selectedIssue: OperationalIssue | null;
  availableStores: string[];
  availableCategories: string[];
  availableManagers: Array<{ managerId: number; fullName: string }>;
  rawStores: Array<{ storeId: number; storeNumber: string; storeName: string }>;
  rawCategories: Array<{ categoryId: number; categoryName: string }>;
  isLoading: boolean;
  isBackendOnline: boolean;
  toast: ToastNotification | null;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  setSelectedIssueId: (id: string | null) => void;
  setFilter: <K extends keyof IssueFilterState>(key: K, value: IssueFilterState[K]) => void;
  resetFilters: () => void;
  handleStatusChange: (issueId: string, newStatus: Status, changedBy?: number | null) => Promise<void>;
  handleAddNote: (issueId: string, noteText: string, managerId?: number | null) => Promise<void>;
  handleDeleteNote: (issueId: string, noteId: string) => Promise<void>;
  handleCreateIssue: (payload: {
    storeId: number;
    categoryId: number;
    shortDescription: string;
    detailedDescription?: string;
    priority?: Priority;
    assignedManagerId?: number | null;
  }) => Promise<void>;
  toggleTileFilter: (tileType: 'open' | 'high_priority' | 'resolved' | 'follow_up') => void;
  refresh: () => Promise<void>;
}

const defaultFilters: IssueFilterState = {
  store: 'All',
  category: 'All',
  priority: 'All',
  status: 'All',
  searchQuery: '',
  followUp: false,
};

const defaultMetrics: DashboardMetrics = {
  open: 0,
  high_priority: 0,
  resolved: 0,
  follow_up: 0,
  totalOpen: 0,
  highPriority: 0,
  requiresFollowUp: 0,
};

const DEFAULT_MANAGERS = [
  { managerId: 1, fullName: 'Rohan Sharma (Duty Manager)' },
  { managerId: 2, fullName: 'Ananya Verma (Duty Manager)' },
  { managerId: 3, fullName: 'Kabir Mehta (Duty Manager)' },
  { managerId: 4, fullName: 'Sarah Jenkins (Duty Manager)' },
  { managerId: 5, fullName: 'Marcus Vance (Store Manager)' },
  { managerId: 6, fullName: 'Priya Sharma (Area Lead)' },
  { managerId: 7, fullName: 'Alex Rivera (Duty Manager)' },
  { managerId: 8, fullName: 'Emily Chen (Operations Manager)' },
];

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<OperationalIssue[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [filters, setFilters] = useState<IssueFilterState>(defaultFilters);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [availableStores, setAvailableStores] = useState<string[]>(['All']);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);
  const [availableManagers, setAvailableManagers] = useState<Array<{ managerId: number; fullName: string }>>(DEFAULT_MANAGERS);
  const [rawStores, setRawStores] = useState<Array<{ storeId: number; storeNumber: string; storeName: string }>>([]);
  const [rawCategories, setRawCategories] = useState<Array<{ categoryId: number; categoryName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  }, []);

  // Load Metadata (Stores & Categories & Managers) for Dropdowns
  const loadMeta = useCallback(async () => {
    try {
      const meta = await fetchMetadata();
      const stores = ['All', ...meta.stores.map((s) => s.storeNumber)];
      const categories = ['All', ...meta.categories.map((c) => c.categoryName)];
      setAvailableStores(stores);
      setAvailableCategories(categories);
      setAvailableManagers(meta.managers && meta.managers.length > 0 ? meta.managers : DEFAULT_MANAGERS);
      setRawStores(meta.stores || []);
      setRawCategories(meta.categories || []);
      setIsBackendOnline(true);
    } catch {
      // Fallback from mock data
      const stores = ['All', ...Array.from(new Set(INITIAL_ISSUES.map((i) => i.storeNumber))).sort()];
      const categories = ['All', ...Array.from(new Set(INITIAL_ISSUES.map((i) => i.category))).sort()];
      setAvailableStores(stores);
      setAvailableCategories(categories);
      setAvailableManagers(DEFAULT_MANAGERS);
      setRawStores([
        { storeId: 1, storeNumber: 'ST-1010', storeName: 'Downtown Flagship' },
        { storeId: 2, storeNumber: 'ST-1020', storeName: 'Metro Mall Annex' },
        { storeId: 3, storeNumber: 'ST-1030', storeName: 'Westside Galleria' },
        { storeId: 4, storeNumber: 'ST-1040', storeName: 'Suburban Express' },
        { storeId: 5, storeNumber: 'ST-1050', storeName: 'Airport Terminal 3' },
      ]);
      setRawCategories([
        { categoryId: 1, categoryName: 'Equipment' },
        { categoryId: 2, categoryName: 'Staffing' },
        { categoryId: 3, categoryName: 'Inventory' },
        { categoryId: 4, categoryName: 'Cleanliness' },
        { categoryId: 5, categoryName: 'IT/POS' },
        { categoryId: 6, categoryName: 'Safety' },
        { categoryId: 7, categoryName: 'Customer' },
      ]);
      setIsBackendOnline(false);
    }
  }, []);

  // Load Issues & Metrics (Phase 8: summary metrics recompute when filters change)
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
          followUp: filters.followUp,
        }),
        // Pass filter dimensions so tiles recompute for active store/category/search
        fetchMetrics({
          store: filters.store,
          category: filters.category,
          search: filters.searchQuery,
        }),
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
        const matchesStatus =
          filters.status === 'All'
            ? true
            : filters.status === 'New,In Progress'
            ? issue.status !== 'Resolved'
            : issue.status === filters.status;
        const matchesFollowUp = !filters.followUp || (issue.requiresFollowUp && issue.status !== 'Resolved');
        const q = filters.searchQuery.trim().toLowerCase();
        const matchesSearch =
          q === '' ||
          issue.shortDescription.toLowerCase().includes(q) ||
          issue.storeName.toLowerCase().includes(q) ||
          issue.assignedManager.toLowerCase().includes(q);

        return matchesStore && matchesCategory && matchesPriority && matchesStatus && matchesFollowUp && matchesSearch;
      });

      setIssues(filtered);

      const open = INITIAL_ISSUES.filter((i) => i.status !== 'Resolved').length;
      const high_priority = INITIAL_ISSUES.filter((i) => i.priority === 'High' && i.status !== 'Resolved').length;
      const resolved = INITIAL_ISSUES.filter((i) => i.status === 'Resolved').length;
      const follow_up = INITIAL_ISSUES.filter((i) => i.requiresFollowUp && i.status !== 'Resolved').length;
      setMetrics({
        open,
        high_priority,
        resolved,
        follow_up,
        totalOpen: open,
        highPriority: high_priority,
        requiresFollowUp: follow_up,
      });
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
        showToast(`Status updated to ${newStatus}`, 'success');
      } catch (err) {
        console.error('Failed to update status on server:', err);
        showToast('Failed to update status on server', 'error');
      }
    } else {
      showToast(`Status set to ${newStatus} (demo mode)`, 'success');
    }
  };

  // Handle Add Management Note (Phase 7: 500-char limit, author resolution & persistence)
  const handleAddNote = async (issueId: string, noteText: string, managerId?: number | null) => {
    if (!noteText.trim()) return;

    const managerObj = managerId ? availableManagers.find((m) => m.managerId === managerId) : null;
    const tempId = `n-temp-${Date.now()}`;
    const optimisticNote: ManagementNote = {
      id: tempId,
      author: managerObj?.fullName || 'Store Manager',
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
            notes: [optimisticNote, ...(issue.notes || [])],
          };
        }
        return issue;
      })
    );

    // 2. Call backend API if online
    if (isBackendOnline) {
      try {
        const persistedNote = await addIssueNote(issueId, noteText.trim(), managerId);
        // Replace temp optimistic note with server persisted note
        setIssues((prev) =>
          prev.map((issue) => {
            if (issue.id === issueId) {
              return {
                ...issue,
                notes: [persistedNote, ...(issue.notes || []).filter((n) => n.id !== tempId)],
              };
            }
            return issue;
          })
        );
        showToast('Management note added', 'success');
      } catch (err) {
        console.error('Failed to add note to server:', err);
        showToast('Failed to add note on server', 'error');
      }
    } else {
      showToast('Management note added (demo mode)', 'success');
    }
  };

  // Handle Delete Management Note (Phase 7 Optional)
  const handleDeleteNote = async (issueId: string, noteId: string) => {
    // 1. Optimistic delete in UI
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            notes: (issue.notes || []).filter((n) => n.id !== noteId),
          };
        }
        return issue;
      })
    );

    // 2. Call backend API if online
    if (isBackendOnline && !noteId.startsWith('n-temp-')) {
      try {
        await deleteIssueNote(noteId);
        showToast('Management note deleted', 'info');
      } catch (err) {
        console.error('Failed to delete note on server:', err);
        showToast('Failed to delete note on server', 'error');
      }
    } else {
      showToast('Management note deleted', 'info');
    }
  };

  // Handle Create New Issue (Phase 9)
  const handleCreateIssue = async (payload: {
    storeId: number;
    categoryId: number;
    shortDescription: string;
    detailedDescription?: string;
    priority?: Priority;
    assignedManagerId?: number | null;
  }) => {
    if (isBackendOnline) {
      try {
        const created = await createIssue(payload);
        showToast(`Issue ${created.id} reported successfully`, 'success');
        setIsCreateModalOpen(false);
        await loadIssuesAndMetrics();
      } catch (err) {
        console.error('Failed to create issue on server:', err);
        showToast('Failed to create issue on server', 'error');
        throw err;
      }
    } else {
      const storeObj = rawStores.find((s) => s.storeId === payload.storeId);
      const catObj = rawCategories.find((c) => c.categoryId === payload.categoryId);
      const mgrObj = payload.assignedManagerId
        ? availableManagers.find((m) => m.managerId === payload.assignedManagerId)
        : null;

      const newIssue: OperationalIssue = {
        id: `ISS-${Date.now().toString().slice(-4)}`,
        storeNumber: storeObj?.storeNumber || `Store #${payload.storeId}`,
        storeName: storeObj?.storeName || 'Retail Store',
        category: (catObj?.categoryName as any) || 'General',
        shortDescription: payload.shortDescription,
        detailedDescription: payload.detailedDescription,
        dateReported: new Date().toISOString().split('T')[0],
        priority: payload.priority || 'Medium',
        status: 'New',
        assignedManager: mgrObj ? mgrObj.fullName : 'Unassigned',
        assignedManagerId: payload.assignedManagerId ?? null,
        requiresFollowUp: payload.priority === 'High',
        notes: [],
        statusHistory: [],
      };

      setIssues((prev) => [newIssue, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`Issue ${newIssue.id} created (demo mode)`, 'success');
    }
  };

  const setFilter = (key: keyof IssueFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    showToast('Filters reset to default', 'info');
  };

  // Phase 8: Clickable tiles applying corresponding filter to table below
  const toggleTileFilter = (tileType: 'open' | 'high_priority' | 'resolved' | 'follow_up') => {
    setFilters((prev) => {
      switch (tileType) {
        case 'open':
          return {
            ...prev,
            status: prev.status === 'New,In Progress' ? 'All' : 'New,In Progress',
            priority: 'All',
            followUp: false,
          };
        case 'high_priority': {
          const willBeActive = prev.priority !== 'High' || prev.status !== 'New,In Progress';
          return {
            ...prev,
            priority: willBeActive ? 'High' : 'All',
            status: willBeActive ? 'New,In Progress' : 'All',
            followUp: false,
          };
        }
        case 'resolved':
          return {
            ...prev,
            status: prev.status === 'Resolved' ? 'All' : 'Resolved',
            priority: 'All',
            followUp: false,
          };
        case 'follow_up':
          return {
            ...prev,
            followUp: !prev.followUp,
            status: prev.followUp ? 'All' : 'In Progress',
            priority: 'All',
          };
        default:
          return prev;
      }
    });
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
        rawStores,
        rawCategories,
        isLoading,
        isBackendOnline,
        toast,
        isCreateModalOpen,
        setIsCreateModalOpen,
        showToast,
        setSelectedIssueId,
        setFilter,
        resetFilters,
        toggleTileFilter,
        handleStatusChange,
        handleAddNote,
        handleDeleteNote,
        handleCreateIssue,
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
