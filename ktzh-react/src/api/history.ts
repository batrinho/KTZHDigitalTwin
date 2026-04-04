import { apiFetch, apiDownload } from './client';
import type { HistoryPoint } from '../models/api';

export function fetchHistory(
  locomotiveId: string,
  from: string,
  to: string,
  resolution: 'raw' | '1min' = 'raw',
): Promise<HistoryPoint[]> {
  const params = new URLSearchParams({ from, to, resolution });
  return apiFetch<HistoryPoint[]>(
    `/api/v1/history/${encodeURIComponent(locomotiveId)}?${params}`,
  );
}

export function exportCsv(
  locomotiveId: string,
  from: string,
  to: string,
): Promise<void> {
  const params = new URLSearchParams({ from, to });
  return apiDownload(
    `/api/v1/history/${encodeURIComponent(locomotiveId)}/export?${params}`,
  );
}
