import { apiFetch } from './client';
import type { ApiRoute } from '../models/api';

export function fetchRoutes(): Promise<ApiRoute[]> {
  return apiFetch<ApiRoute[]>('/api/v1/routes');
}
