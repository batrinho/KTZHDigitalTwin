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

export interface TelemetryParams {
  speed?: number;
  traction_force?: number;
  brake_force?: number;
  throttle_pos?: number;
  traction_motor_temp?: number;
  ambient_temp?: number;
  transformer_oil_temp?: number;
  brake_pipe_pressure?: number;
  brake_cylinder_pressure?: number;
  main_reservoir_pressure?: number;
  traction_motor_current?: number;
  battery_voltage?: number;
  catenary_voltage?: number;
  dc_bus_voltage?: number;
  regen_power?: number;
  sand_level?: number;
  cabin_temp?: number;
  [key: string]: number | undefined;
}

export interface HealthIndexSnapshot {
  score: number;
  category: string;
  trend?: string;
}

export interface HealthFactor {
  paramName: string;
  displayName: string;
  rawValue: number;
  normalizedDeviation: number;
  category?: string;
}

export interface HealthIndexUpdate {
  score: number;
  category?: string;
  trend?: string;
  topFactors?: HealthFactor[];
  activeAlerts?: number;
  dtcPenalty?: number;
  locomotiveId?: string;
  locomotiveType?: string;
  calculatedAt?: string;
}

export interface WsAlert {
  severity: string;
  message: string;
  recommendation?: string;
  triggeredAt?: string;
}

export interface HistoryPoint {
  timestamp: string;
  phase?: string;
  [key: string]: string | number | undefined;
}

export interface HealthSnapshot {
  timestamp: string;
  score: number | null;
  category: string | null;
  trend: string | null;
}

export interface RouteWaypoint {
  id: string;
  sortOrder: number;
  cityName: string;
  kmFromStart: number;
  lat: number;
  lon: number;
  speedLimit?: number;
}

export interface RouteDefinition {
  id: string;
  routeId: string;
  name: string;
  totalKm: number;
  waypoints: RouteWaypoint[];
}
