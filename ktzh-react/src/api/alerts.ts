import { apiFetch, apiPost } from './client';

export interface ActiveAlert {
  id: string;
  severity: string;
  message: string;
  recommendation?: string;
  triggeredAt: string;
}

/** GET /api/v1/alerts/{locomotiveId}/active */
export function fetchActiveAlerts(locomotiveId: string): Promise<ActiveAlert[]> {
  return apiFetch<ActiveAlert[]>(
    `/api/v1/alerts/${encodeURIComponent(locomotiveId)}/active`,
  );
}

/** GET /api/v1/alerts/{locomotiveId}/history?from=&to= */
export function fetchAlertHistory(
  locomotiveId: string,
  from: string,
  to: string,
): Promise<ActiveAlert[]> {
  const params = new URLSearchParams({ from, to });
  return apiFetch<ActiveAlert[]>(
    `/api/v1/alerts/${encodeURIComponent(locomotiveId)}/history?${params}`,
  );
}

/** POST /api/v1/alerts/{id}/acknowledge */
export function acknowledgeAlert(id: string): Promise<ActiveAlert> {
  return apiPost<Record<string, never>, ActiveAlert>(
    `/api/v1/alerts/${encodeURIComponent(id)}/acknowledge`,
    {},
  );
}
