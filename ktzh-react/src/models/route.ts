export interface Route {
  id: string;
  from: string;
  to: string;
  locomotive: string;
  departure: string;
  completedKm: number;
  totalKm: number;
  healthIndex: number;
}

export type HealthStatus = 'Normal' | 'Caution' | 'Critical';

export interface HealthInfo {
  status: HealthStatus;
  color: string;
}

export function getHealthInfo(index: number): HealthInfo {
  if (index >= 80) return { status: 'Normal', color: '#22c55e' };
  if (index >= 60) return { status: 'Caution', color: '#eab308' };
  return { status: 'Critical', color: '#ef4444' };
}

export function getProgressPercent(completed: number, total: number): number {
  return Math.min(100, Math.round((completed / total) * 100));
}
