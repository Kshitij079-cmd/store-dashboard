import { OperationalIssue, Status, Priority, DashboardMetrics, ManagementNote } from '@/types/issues';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Convert backend Prisma issue to frontend OperationalIssue format
export function transformBackendIssue(item: any): OperationalIssue {
  const statusMap: Record<string, Status> = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
  };

  const priorityMap: Record<string, Priority> = {
    CRITICAL: 'High',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  const isHighOrCritical = item.priority === 'HIGH' || item.priority === 'CRITICAL';
  const isOpen = item.status !== 'RESOLVED';

  return {
    id: `ISS-${item.issueId}`,
    storeNumber: item.store?.storeNumber || `Store #${item.storeId}`,
    storeName: item.store?.storeName || 'Retail Store',
    category: item.category?.categoryName || 'General',
    shortDescription: item.shortDescription,
    detailedDescription: item.detailedDescription || '',
    dateReported: new Date(item.dateReported).toISOString().split('T')[0],
    dateResolved: item.dateResolved ? new Date(item.dateResolved).toISOString().split('T')[0] : null,
    priority: priorityMap[item.priority] || 'Medium',
    status: statusMap[item.status] || 'New',
    assignedManager: item.assignedManager?.fullName || 'Unassigned',
    assignedManagerId: item.assignedManagerId ?? null,
    requiresFollowUp: isHighOrCritical && isOpen,
    notes: (item.notes || []).map((n: any) => ({
      id: String(n.noteId),
      author: n.manager?.fullName || 'Store Manager',
      content: n.noteText,
      createdAt: new Date(n.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
    statusHistory: (item.statusHistory || []).map((sh: any) => ({
      id: String(sh.historyId),
      oldStatus: sh.oldStatus ? (statusMap[sh.oldStatus] || sh.oldStatus) : null,
      newStatus: statusMap[sh.newStatus] || sh.newStatus,
      changedBy: sh.manager?.fullName || (sh.changedBy ? `Manager #${sh.changedBy}` : 'System Admin'),
      changedAt: new Date(sh.changedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
  };
}

export async function fetchIssues(filters?: Record<string, any>): Promise<OperationalIssue[]> {
  const query = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== 'All' && val !== '' && val !== false) {
        if (key === 'followUp' || key === 'follow_up') {
          query.append('follow_up', 'true');
        } else {
          query.append(key, String(val));
        }
      }
    });
  }

  const url = `${BACKEND_URL}/api/issues${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch issues');
  const data = await res.json();
  return data.map(transformBackendIssue);
}

export async function fetchMetrics(filters?: Record<string, any>): Promise<DashboardMetrics> {
  const query = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== 'All' && val !== '' && val !== false) {
        if (key === 'followUp' || key === 'follow_up') {
          query.append('follow_up', 'true');
        } else {
          query.append(key, String(val));
        }
      }
    });
  }

  // Connects to Phase 8 /api/summary endpoint (accepts same filter params as /api/issues)
  const url = `${BACKEND_URL}/api/summary${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch summary metrics');
  const data = await res.json();
  return {
    open: data.open ?? data.totalOpen ?? 0,
    high_priority: data.high_priority ?? data.highPriority ?? 0,
    resolved: data.resolved ?? 0,
    follow_up: data.follow_up ?? data.requiresFollowUp ?? 0,
    totalOpen: data.open ?? data.totalOpen ?? 0,
    highPriority: data.high_priority ?? data.highPriority ?? 0,
    requiresFollowUp: data.follow_up ?? data.requiresFollowUp ?? 0,
  };
}

export async function fetchMetadata(): Promise<{
  stores: Array<{ storeId: number; storeNumber: string; storeName: string }>;
  categories: Array<{ categoryId: number; categoryName: string }>;
  managers: Array<{ managerId: number; fullName: string }>;
}> {
  const res = await fetch(`${BACKEND_URL}/api/meta`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export async function updateIssueStatus(
  issueIdStr: string,
  newStatus: Status,
  changedBy?: number | null
): Promise<OperationalIssue> {
  const numericId = parseInt(issueIdStr.replace('ISS-', ''), 10);
  const statusPayloadMap: Record<Status, string> = {
    New: 'NEW',
    'In Progress': 'IN_PROGRESS',
    Resolved: 'RESOLVED',
  };

  const bodyPayload: Record<string, any> = {
    status: statusPayloadMap[newStatus],
  };
  if (changedBy !== undefined && changedBy !== null) {
    bodyPayload.changed_by = changedBy;
  }

  const res = await fetch(`${BACKEND_URL}/api/issues/${numericId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) throw new Error('Failed to update status');
  const data = await res.json();
  return transformBackendIssue(data);
}

export async function addIssueNote(
  issueIdStr: string,
  noteText: string,
  managerId?: number | null
): Promise<ManagementNote> {
  const numericId = parseInt(issueIdStr.replace('ISS-', ''), 10);

  const res = await fetch(`${BACKEND_URL}/api/issues/${numericId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      note_text: noteText,
      manager_id: managerId,
    }),
  });

  if (!res.ok) throw new Error('Failed to add note');
  const n = await res.json();
  return {
    id: String(n.noteId),
    author: n.manager?.fullName || 'Store Manager',
    content: n.noteText,
    createdAt: new Date(n.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export async function deleteIssueNote(noteId: string | number): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete note');
}

export async function createIssue(payload: {
  storeId: number;
  categoryId: number;
  shortDescription: string;
  detailedDescription?: string;
  priority?: Priority;
  assignedManagerId?: number | null;
  reportedBy?: string;
}): Promise<OperationalIssue> {
  const priorityMap: Record<string, string> = {
    High: 'HIGH',
    Medium: 'MEDIUM',
    Low: 'LOW',
  };

  const res = await fetch(`${BACKEND_URL}/api/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeId: payload.storeId,
      categoryId: payload.categoryId,
      shortDescription: payload.shortDescription,
      detailedDescription: payload.detailedDescription || null,
      priority: payload.priority ? priorityMap[payload.priority] || 'MEDIUM' : 'MEDIUM',
      assignedManagerId: payload.assignedManagerId || null,
      reportedBy: payload.reportedBy || 'Duty Manager',
    }),
  });

  if (!res.ok) throw new Error('Failed to create issue');
  const data = await res.json();
  return transformBackendIssue(data);
}
