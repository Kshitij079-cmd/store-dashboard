import { OperationalIssue, Status } from '@/types/issues';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchIssuesFromBackend(params?: Record<string, string>): Promise<OperationalIssue[]> {
  const query = new URLSearchParams(params).toString();
  const url = `${BACKEND_URL}/api/issues${query ? `?${query}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch issues from backend');
  
  const data = await res.json();
  
  // Transform Prisma snake/camel backend data to OperationalIssue
  return data.map((item: any): OperationalIssue => {
    // Map Prisma uppercase enums to Title Case
    const statusMap: Record<string, Status> = {
      NEW: 'New',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
    };
    const priorityMap: Record<string, 'High' | 'Medium' | 'Low'> = {
      HIGH: 'High',
      CRITICAL: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    };

    return {
      id: `ISS-${item.issueId}`,
      storeNumber: item.store?.storeNumber || `Store #${item.storeId}`,
      storeName: item.store?.storeName || 'Retail Store',
      category: item.category?.categoryName || 'General',
      shortDescription: item.shortDescription,
      detailedDescription: item.detailedDescription || '',
      dateReported: new Date(item.dateReported).toISOString().split('T')[0],
      priority: priorityMap[item.priority] || 'Medium',
      status: statusMap[item.status] || 'New',
      assignedManager: item.assignedManager?.fullName || 'Unassigned',
      requiresFollowUp: (item.priority === 'HIGH' || item.priority === 'CRITICAL') && item.status !== 'RESOLVED',
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
    };
  });
}

export async function updateIssueStatusBackend(issueIdNum: number, status: Status): Promise<boolean> {
  const enumMap: Record<Status, string> = {
    New: 'NEW',
    'In Progress': 'IN_PROGRESS',
    Resolved: 'RESOLVED',
  };

  const res = await fetch(`${BACKEND_URL}/api/issues/${issueIdNum}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: enumMap[status] }),
  });
  return res.ok;
}

export async function addIssueNoteBackend(issueIdNum: number, noteText: string): Promise<boolean> {
  const res = await fetch(`${BACKEND_URL}/api/issues/${issueIdNum}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteText }),
  });
  return res.ok;
}
