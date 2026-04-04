import { API_BASE } from './config';

/* ── Generic JSON fetch ────────────────────────────────── */

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

/* ── JSON body helpers (POST / PUT / PATCH) ────────────── */

export function apiPost<TBody, TRes>(
  path: string,
  body: TBody,
): Promise<TRes> {
  return apiFetch<TRes>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function apiPut<TBody, TRes>(
  path: string,
  body: TBody,
): Promise<TRes> {
  return apiFetch<TRes>(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/* ── DELETE (no body, no JSON response) ────────────────── */

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
}

/* ── File download (CSV export etc.) ───────────────────── */

export async function apiDownload(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);

  const disposition = res.headers.get('Content-Disposition');
  const match = disposition?.match(/filename=(.+)/);
  const filename = match?.[1] ?? 'export.csv';

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
