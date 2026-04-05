import { apiFetch, apiPost, apiPut, apiDelete } from './client';
import type {
  Locomotive,
  CreateLocomotiveRequest,
  UpdateLocomotiveRequest,
} from '../models/locomotive';

const BASE = '/api/locomotives';

export function fetchLocomotives(): Promise<Locomotive[]> {
  return apiFetch<Locomotive[]>(BASE);
}

export function fetchLocomotive(id: string): Promise<Locomotive> {
  return apiFetch<Locomotive>(`${BASE}/${encodeURIComponent(id)}`);
}

export function createLocomotive(body: CreateLocomotiveRequest): Promise<Locomotive> {
  return apiPost<CreateLocomotiveRequest, Locomotive>(BASE, body);
}

export function updateLocomotive(id: string, body: UpdateLocomotiveRequest): Promise<Locomotive> {
  return apiPut<UpdateLocomotiveRequest, Locomotive>(`${BASE}/${encodeURIComponent(id)}`, body);
}

export function deleteLocomotive(id: string): Promise<void> {
  return apiDelete(`${BASE}/${encodeURIComponent(id)}`);
}
