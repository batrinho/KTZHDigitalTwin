import { apiFetch, apiPut, apiDelete } from './client';
import type { HealthParamWeight, UpsertHealthParamWeightRequest } from '../models/healthParamWeight';

const BASE = '/api/v1/health/param-weights';

export function fetchHealthParamWeights(): Promise<HealthParamWeight[]> {
  return apiFetch<HealthParamWeight[]>(BASE);
}

export function fetchHealthParamWeight(id: string): Promise<HealthParamWeight> {
  return apiFetch<HealthParamWeight>(`${BASE}/${id}`);
}

export function upsertHealthParamWeight(
  body: UpsertHealthParamWeightRequest,
): Promise<HealthParamWeight> {
  return apiPut<UpsertHealthParamWeightRequest, HealthParamWeight>(BASE, body);
}

export function deleteHealthParamWeight(id: string): Promise<void> {
  return apiDelete(`${BASE}/${id}`);
}
