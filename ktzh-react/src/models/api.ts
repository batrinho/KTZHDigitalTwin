/* ── Routes list (GET /api/v1/routes) ──────────────────── */
export interface ApiRoute {
  locomotiveId: string;
  locomotiveType: string | null;
  routeId: string | null;
  phase: string | null;
  speed: number | null;
  fuelLevel: number | null;
  gpsLat: number | null;
  gpsLon: number | null;
  odometer: number | null;
  healthScore: number | null;
  healthCategory: string | null;
  healthTrend: string | null;
}

/* ── WebSocket message envelope ────────────────────────── */
export type WsMessageType =
  | 'TELEMETRY_SNAPSHOT'
  | 'HEALTH_INDEX_SNAPSHOT'
  | 'TELEMETRY'
  | 'HEALTH_INDEX'
  | 'ALERT';

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  data: T;
}

/* ── Telemetry snapshot (last_state:{locoId}) ──────────── */
export interface TelemetrySnapshot {
  locomotiveType?: string;
  routeId?: string;
  phase?: string;
  smoothedParameters?: TelemetryParams;
  rawParameters?: TelemetryParams;
  gpsLat?: number;
  gpsLon?: number;
  odometer?: number;
}

/* ── Telemetry params (streaming or from snapshot) ─────── */
export interface TelemetryParams {
  speed?: number;
  fuel_level?: number;
  fuel_consumption?: number;
  main_reservoir_pressure?: number;
  brake_pressure?: number;
  oil_pressure?: number;
  engine_temp?: number;
  brake_temp?: number;
  coolant_temp?: number;
  voltage?: number;
  current?: number;
  power?: number;
  [key: string]: number | undefined;
}

/* ── Health index ──────────────────────────────────────── */
export interface HealthIndexSnapshot {
  score: number;
  category: string;
  trend?: string;
}

export interface HealthFactor {
  name: string;
  value: number;
  category?: string;
}

export interface HealthIndexUpdate {
  score: number;
  topFactors?: HealthFactor[];
}

/* ── Alert (via WebSocket) ─────────────────────────────── */
export interface WsAlert {
  severity: string;
  message: string;
  recommendation?: string;
  triggeredAt?: string;
}

/* ── History (GET /api/v1/history/:id) ─────────────────── */
export interface HistoryPoint {
  timestamp: string;
  phase?: string;
  speed?: number;
  coolant_temp?: number;
  engine_temp?: number;
  brake_temp?: number;
  fuel_level?: number;
  fuel_consumption?: number;
  main_reservoir_pressure?: number;
  brake_pressure?: number;
  oil_pressure?: number;
  voltage?: number;
  current?: number;
  power?: number;
  [key: string]: string | number | undefined;
}

/* ── Health snapshot (GET /api/v1/health/:id/history) ──── */
export interface HealthSnapshot {
  timestamp: string;
  score: number | null;
  category: string | null;
  trend: string | null;
}
