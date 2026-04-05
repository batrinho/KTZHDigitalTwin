import { apiFetch } from './client';
import type { RouteDefinition } from '../models/api';

export function fetchRouteDefinitions(): Promise<RouteDefinition[]> {
  return apiFetch<RouteDefinition[]>('/api/v1/route-definitions');
}

export function fetchRouteDefinition(id: string): Promise<RouteDefinition> {
  return apiFetch<RouteDefinition>(
    `/api/v1/route-definitions/${encodeURIComponent(id)}`,
  );
}

export function fetchRouteDefinitionByRouteId(
  routeId: string,
): Promise<RouteDefinition> {
  return apiFetch<RouteDefinition>(
    `/api/v1/route-definitions/by-route-id/${encodeURIComponent(routeId)}`,
  );
}
