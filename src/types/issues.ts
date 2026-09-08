// Priority levels: High priority highlight hogi dashboard par
export type Priority = 'High' | 'Medium' | 'Low';

// Assessment requirement: New, In Progress, Resolved
export type Status = 'New' | 'In Progress' | 'Resolved';

// Common operational categories in retail/store management
export type Category =
    | 'Inventory'
    | 'POS & Billing'
    | 'Facility & Maintenance'
    | 'Staffing'
    | 'Supply Chain'
    | 'Safety & Compliance';

// Management note structure with author and timestamp
export interface ManagementNote {
    id: string;
    author: string;
    content: string;
    createdAt: string;
}

// Status History audit trail structure (Phase 6 requirement)
export interface StatusHistoryEntry {
    id: string;
    oldStatus: Status | null;
    newStatus: Status;
    changedBy: string;
    changedAt: string;
}

// Main Issue model containing all 7 required fields + notes & follow-up
export interface OperationalIssue {
    id: string;
    storeNumber: string;         // e.g. "Store #104"
    storeName: string;           // e.g. "Downtown Mall"
    category: Category;
    shortDescription: string;
    detailedDescription?: string;
    dateReported: string;        // e.g. "2026-09-02"
    dateResolved?: string | null;
    priority: Priority;
    status: Status;
    assignedManager: string;
    assignedManagerId?: number | null;
    requiresFollowUp: boolean;   // Summary requirement ke liye
    notes: ManagementNote[];
    statusHistory?: StatusHistoryEntry[];
}

// Filters state
export interface IssueFilterState {
    store: string;      // 'All' or specific store
    category: string;   // 'All' or specific category
    priority: string;   // 'All' or specific priority
    status: string;     // 'All' or specific status
    searchQuery: string;
}

// Top KPI summary metrics
export interface DashboardMetrics {
    totalOpen: number;
    highPriority: number;
    resolved: number;
    requiresFollowUp: number;
}