import { apiFetch, apiPut, apiDelete } from './client';
import type { ThresholdResponse, UpsertThresholdRequest } from '../models/threshold';

const BASE = '/api/v1/thresholds';

export function fetchThresholds(): Promise<ThresholdResponse[]> {
  return apiFetch<ThresholdResponse[]>(BASE);
}

export function fetchThreshold(id: string): Promise<ThresholdResponse> {
  return apiFetch<ThresholdResponse>(`${BASE}/${encodeURIComponent(id)}`);
}

export function upsertThreshold(body: UpsertThresholdRequest): Promise<ThresholdResponse> {
  return apiPut<UpsertThresholdRequest, ThresholdResponse>(BASE, body);
}

export function deleteThreshold(id: string): Promise<void> {
  return apiDelete(`${BASE}/${encodeURIComponent(id)}`);
}
