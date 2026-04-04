/* ═══════════════════════════════════════════════════════════
   Health Param Weights API
   CRUD for configuring per-parameter weights & thresholds
   used in the health-index calculation.
   ═══════════════════════════════════════════════════════════ */

import { apiFetch, apiPut, apiDelete } from './client';
import type {
  HealthParamWeight,
  UpsertHealthParamWeightRequest,
} from '../models/healthParamWeight';

const BASE = '/api/v1/health/param-weights';

/** GET /api/v1/health/param-weights — list all param-weight configs */
export function fetchHealthParamWeights(): Promise<HealthParamWeight[]> {
  return apiFetch<HealthParamWeight[]>(BASE);
}

/** GET /api/v1/health/param-weights/:id — single config by UUID */
export function fetchHealthParamWeight(id: string): Promise<HealthParamWeight> {
  return apiFetch<HealthParamWeight>(`${BASE}/${id}`);
}

/** PUT /api/v1/health/param-weights — upsert by paramName */
export function upsertHealthParamWeight(
  body: UpsertHealthParamWeightRequest,
): Promise<HealthParamWeight> {
  return apiPut<UpsertHealthParamWeightRequest, HealthParamWeight>(BASE, body);
}

/** DELETE /api/v1/health/param-weights/:id */
export function deleteHealthParamWeight(id: string): Promise<void> {
  return apiDelete(`${BASE}/${id}`);
}
