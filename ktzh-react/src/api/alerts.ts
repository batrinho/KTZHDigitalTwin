/* ═══════════════════════════════════════════════════════════
   Alerts API
   REST endpoint for fetching currently active alerts
   (loaded once on dashboard mount, then kept live via WS).
   ═══════════════════════════════════════════════════════════ */

import { apiFetch } from './client';

/**
 * A single active alert from the backend.
 * Matches the shape returned by GET /api/v1/alerts/:id/active.
 */
export interface ActiveAlert {
  id: string;
  severity: string;
  message: string;
  recommendation?: string;
  triggeredAt: string;
}

/**
 * GET /api/v1/alerts/{locomotiveId}/active
 *
 * Fetches the list of currently active (unresolved) alerts
 * for a locomotive. Called once when the Dashboard mounts;
 * subsequent alerts arrive via the WebSocket ALERT messages.
 */
export function fetchActiveAlerts(
  locomotiveId: string,
): Promise<ActiveAlert[]> {
  return apiFetch<ActiveAlert[]>(
    `/api/v1/alerts/${encodeURIComponent(locomotiveId)}/active`,
  );
}
