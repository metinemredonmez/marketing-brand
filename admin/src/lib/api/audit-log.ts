import { apiFetch } from "./client";

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  success: boolean;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export const auditLogApi = {
  list: (params: {
    action?: string;
    resource?: string;
    actorEmail?: string;
    failedOnly?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const q = new URLSearchParams();
    if (params.action) q.set("action", params.action);
    if (params.resource) q.set("resource", params.resource);
    if (params.actorEmail) q.set("actorEmail", params.actorEmail);
    if (params.failedOnly) q.set("failedOnly", "true");
    if (params.limit) q.set("limit", String(params.limit));
    if (params.offset) q.set("offset", String(params.offset));
    return apiFetch<{
      items: AuditLogEntry[];
      total: number;
      limit: number;
      offset: number;
    }>(`/admin/audit-log?${q.toString()}`);
  },
  actions: () => apiFetch<string[]>(`/admin/audit-log/actions`),
  resources: () => apiFetch<string[]>(`/admin/audit-log/resources`),
};
