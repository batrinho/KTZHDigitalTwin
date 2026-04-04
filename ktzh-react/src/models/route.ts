export type HealthStatus = 'Normal' | 'Caution' | 'Critical';

export interface HealthInfo {
  status: HealthStatus;
  color: string;
}

export function getHealthInfo(index: number | null | undefined): HealthInfo {
  if (index == null) return { status: 'Normal', color: '#94a3b8' };
  if (index >= 80) return { status: 'Normal', color: '#22c55e' };
  if (index >= 60) return { status: 'Caution', color: '#eab308' };
  return { status: 'Critical', color: '#ef4444' };
}

export function categoryToHealthInfo(category: string | null): HealthInfo {
  switch (category?.toUpperCase()) {
    case 'NORMAL':
    case 'GOOD':
      return { status: 'Normal', color: '#22c55e' };
    case 'ATTENTION':
    case 'CAUTION':
      return { status: 'Caution', color: '#eab308' };
    case 'CRITICAL':
    case 'DANGER':
      return { status: 'Critical', color: '#ef4444' };
    default:
      return { status: 'Normal', color: '#94a3b8' };
  }
}
