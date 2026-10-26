// Type-Safe API Client for AICTE Coordination Backend
import type {
  ApiProblem,
  CaseDetail,
  CaseReadinessResponse,
  CaseSummary,
  CaseTimelineResponse,
  DashboardSummary,
  EligibleExpertsResponse,
  ExpertDetail,
  IntegrationStatus,
  NotificationRecord,
  NotificationSummary,
  Region,
  ScheduleOptimizationResponse,
  AuditEventRecord,
} from '../types/domain';

function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'corr-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export class ApiException extends Error {
  readonly status: number;
  readonly correlationId: string;
  readonly problem?: ApiProblem;

  constructor(status: number, message: string, correlationId: string, problem?: ApiProblem) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.correlationId = correlationId;
    this.problem = problem;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const correlationId = generateCorrelationId();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, application/problem+json');
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Correlation-ID', correlationId);

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let problem: ApiProblem | undefined;

    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const json = await response.json();
        if (json && typeof json === 'object') {
          problem = json as ApiProblem;
          errorDetail = problem.detail || problem.title || errorDetail;
        }
      } else {
        const text = await response.text();
        if (text) errorDetail = text;
      }
    } catch {
      // Keep default error detail
    }

    throw new ApiException(response.status, errorDetail, correlationId, problem);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ------------------- API Methods -------------------

// Dashboard
export function getDashboardSummary(region?: Region | 'ALL', signal?: AbortSignal): Promise<DashboardSummary> {
  const query = region && region !== 'ALL' ? `?region=${encodeURIComponent(region)}` : '';
  return apiFetch<DashboardSummary>(`/api/v1/dashboard/summary${query}`, { signal });
}

// Cases
export function getCases(status?: string, region?: Region | 'ALL', signal?: AbortSignal): Promise<CaseSummary[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (region && region !== 'ALL') params.append('region', region);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<CaseSummary[]>(`/api/v1/cases${qs}`, { signal });
}

export function getCaseById(id: string, signal?: AbortSignal): Promise<CaseDetail> {
  return apiFetch<CaseDetail>(`/api/v1/cases/${encodeURIComponent(id)}`, { signal });
}

export function getCaseAudit(id: string, signal?: AbortSignal): Promise<AuditEventRecord[]> {
  return apiFetch<AuditEventRecord[]>(`/api/v1/cases/${encodeURIComponent(id)}/audit`, { signal });
}

export function getCaseTimeline(id: string, sort: 'asc' | 'desc' = 'asc', signal?: AbortSignal): Promise<CaseTimelineResponse> {
  return apiFetch<CaseTimelineResponse>(`/api/v1/cases/${encodeURIComponent(id)}/timeline?sort=${sort}`, { signal });
}

export function getCaseReadiness(id: string, signal?: AbortSignal): Promise<CaseReadinessResponse> {
  return apiFetch<CaseReadinessResponse>(`/api/v1/cases/${encodeURIComponent(id)}/readiness`, { signal });
}

export function executeTransition(
  id: string,
  payload: { action: string; actorRole: string; actorId: string; comment?: string }
): Promise<unknown> {
  return apiFetch(`/api/v1/cases/${encodeURIComponent(id)}/transition`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function extendDeadline(
  id: string,
  payload: { extensionDays: number; reason: string; authorityRole: string; authorityId: string }
): Promise<unknown> {
  return apiFetch(`/api/v1/cases/${encodeURIComponent(id)}/deadline/extend`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Deficiencies
export function flagDeficiency(
  caseId: string,
  payload: { category: string; description: string; deadlineDays: number; actorRole: string; actorId: string }
): Promise<unknown> {
  return apiFetch(`/api/v1/cases/${encodeURIComponent(caseId)}/deficiencies`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function respondToDeficiency(
  caseId: string,
  defId: string,
  payload: { responseComment: string; proofDocumentName: string; proofDocumentUrl?: string; actorRole: string; actorId: string }
): Promise<unknown> {
  return apiFetch(`/api/v1/cases/${encodeURIComponent(caseId)}/deficiencies/${encodeURIComponent(defId)}/respond`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resolveDeficiency(
  caseId: string,
  defId: string,
  payload: { resolutionComment?: string; actorRole: string; actorId: string }
): Promise<unknown> {
  return apiFetch(`/api/v1/cases/${encodeURIComponent(caseId)}/deficiencies/${encodeURIComponent(defId)}/resolve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Expert Visits & EVC
export function getExperts(domain?: string, region?: Region | 'ALL', active?: boolean, signal?: AbortSignal): Promise<ExpertDetail[]> {
  const params = new URLSearchParams();
  if (domain && domain !== 'ALL') params.append('domain', domain);
  if (region && region !== 'ALL') params.append('region', region);
  if (typeof active === 'boolean') params.append('active', String(active));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<ExpertDetail[]>(`/api/v1/evc/experts${qs}`, { signal });
}

export function getExpertById(id: string, signal?: AbortSignal): Promise<ExpertDetail> {
  return apiFetch<ExpertDetail>(`/api/v1/evc/experts/${encodeURIComponent(id)}`, { signal });
}

export function getEligibleExperts(caseId: string, targetDate?: string, requiredDomain?: string, signal?: AbortSignal): Promise<EligibleExpertsResponse> {
  const params = new URLSearchParams();
  if (targetDate) params.append('targetDate', targetDate);
  if (requiredDomain) params.append('requiredDomain', requiredDomain);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<EligibleExpertsResponse>(`/api/v1/evc/cases/${encodeURIComponent(caseId)}/eligible-experts${qs}`, { signal });
}

export function optimizeSchedule(payload?: {
  startDate?: string;
  endDate?: string;
  committeeSize?: number;
  maxAssignmentsPerExpert?: number;
  caseIds?: string[];
}): Promise<ScheduleOptimizationResponse> {
  return apiFetch<ScheduleOptimizationResponse>('/api/v1/evc/optimize-schedule', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Notifications
export function getNotifications(
  params?: { caseId?: string; recipientRole?: string; type?: string; isRead?: boolean },
  signal?: AbortSignal
): Promise<NotificationRecord[]> {
  const qs = new URLSearchParams();
  if (params?.caseId) qs.append('caseId', params.caseId);
  if (params?.recipientRole) qs.append('recipientRole', params.recipientRole);
  if (params?.type) qs.append('type', params.type);
  if (typeof params?.isRead === 'boolean') qs.append('isRead', String(params.isRead));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<NotificationRecord[]>(`/api/v1/notifications${query}`, { signal });
}

export function getNotificationSummary(signal?: AbortSignal): Promise<NotificationSummary> {
  return apiFetch<NotificationSummary>('/api/v1/notifications/summary', { signal });
}

export function markNotificationAsRead(id: string): Promise<NotificationRecord> {
  return apiFetch<NotificationRecord>(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  });
}

export function runEscalationCheck(): Promise<unknown> {
  return apiFetch('/api/v1/notifications/escalate-check', { method: 'POST' });
}

// Integration
export function getIntegrationStatus(signal?: AbortSignal): Promise<IntegrationStatus> {
  return apiFetch<IntegrationStatus>('/api/v1/integration/status', { signal });
}

export function syncPortal(payload?: {
  externalApplicationId?: string;
  institutionCode?: string;
  institutionName?: string;
  region?: string;
}): Promise<unknown> {
  return apiFetch('/api/v1/integration/sync-portal', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}
