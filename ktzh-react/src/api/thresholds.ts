/* ═══════════════════════════════════════════════════════════
   Alert Thresholds API
   Manages per-parameter warning / critical threshold bands.
   ═══════════════════════════════════════════════════════════ */

import { apiFetch, apiPut, apiDelete } from './client';
import type { ThresholdResponse, UpsertThresholdRequest } from '../models/threshold';

const BASE = '/api/v1/thresholds';

/** GET /api/v1/thresholds — list all threshold configs */
export function fetchThresholds(): Promise<ThresholdResponse[]> {
  return apiFetch<ThresholdResponse[]>(BASE);
}

/** GET /api/v1/thresholds/:id — single threshold by UUID */
export function fetchThreshold(id: string): Promise<ThresholdResponse> {
  return apiFetch<ThresholdResponse>(`${BASE}/${encodeURIComponent(id)}`);
}

/** PUT /api/v1/thresholds — upsert by paramName */
export function upsertThreshold(
  body: UpsertThresholdRequest,
): Promise<ThresholdResponse> {
  return apiPut<UpsertThresholdRequest, ThresholdResponse>(BASE, body);
}

/** DELETE /api/v1/thresholds/:id */
export function deleteThreshold(id: string): Promise<void> {
  return apiDelete(`${BASE}/${encodeURIComponent(id)}`);
}
