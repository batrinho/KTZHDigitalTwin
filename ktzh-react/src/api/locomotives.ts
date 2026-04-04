import { apiFetch, apiPost, apiPut, apiDelete } from './client';
import type {
  Locomotive,
  CreateLocomotiveRequest,
  UpdateLocomotiveRequest,
} from '../models/locomotive';

const BASE = '/api/locomotives';

/** GET /api/locomotives — list all locomotives */
export function fetchLocomotives(): Promise<Locomotive[]> {
  return apiFetch<Locomotive[]>(BASE);
}

/** GET /api/locomotives/{id} — single locomotive by UUID */
export function fetchLocomotive(id: string): Promise<Locomotive> {
  return apiFetch<Locomotive>(`${BASE}/${encodeURIComponent(id)}`);
}

/** POST /api/locomotives — create a new locomotive */
export function createLocomotive(
  body: CreateLocomotiveRequest,
): Promise<Locomotive> {
  return apiPost<CreateLocomotiveRequest, Locomotive>(BASE, body);
}

/** PUT /api/locomotives/{id} — update (partial) */
export function updateLocomotive(
  id: string,
  body: UpdateLocomotiveRequest,
): Promise<Locomotive> {
  return apiPut<UpdateLocomotiveRequest, Locomotive>(
    `${BASE}/${encodeURIComponent(id)}`,
    body,
  );
}

/** DELETE /api/locomotives/{id} — remove locomotive */
export function deleteLocomotive(id: string): Promise<void> {
  return apiDelete(`${BASE}/${encodeURIComponent(id)}`);
}
