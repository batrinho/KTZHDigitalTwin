import { apiFetch } from './client';
import type { HealthSnapshot } from '../models/api';

export function fetchHealthHistory(
  locoId: string,
  from: string,
  to: string,
): Promise<HealthSnapshot[]> {
  const params = new URLSearchParams({ from, to });
  return apiFetch<HealthSnapshot[]>(
    `/api/v1/health/${encodeURIComponent(locoId)}/history?${params}`,
  );
}

export function fetchHealthNearest(
  locoId: string,
  at: string,
): Promise<HealthSnapshot> {
  const params = new URLSearchParams({ at });
  return apiFetch<HealthSnapshot>(
    `/api/v1/health/${encodeURIComponent(locoId)}/nearest?${params}`,
  );
}
