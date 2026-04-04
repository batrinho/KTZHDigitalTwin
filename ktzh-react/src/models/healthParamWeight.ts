/* ═══════════════════════════════════════════════════════════
   Health Param Weights — настройка весов/порогов параметров
   для расчёта healthpoints
   ═══════════════════════════════════════════════════════════ */

export type ApplicableTo = 'BOTH' | 'DIESEL' | 'ELECTRIC';

/**
 * A persisted weight/threshold config for a single telemetry parameter
 * used when computing the health index.
 */
export interface HealthParamWeight {
  /** UUID — read-only, assigned by the server */
  id: string;
  /** System name of the parameter, e.g. "engine_temperature" */
  paramName: string;
  /** Human-readable name shown in the UI */
  displayName: string;
  /** Weight in the health-score calculation */
  weight: number;
  /** Penalty multiplier when thresholds are exceeded */
  penaltyMultiplier?: number;
  /** Warning threshold (0..1) */
  warningThreshold?: number;
  /** Critical threshold (0..1) */
  criticalThreshold?: number;
  /** Which locomotive types this config applies to */
  applicableTo?: ApplicableTo;
}

/**
 * Body for creating or updating (upsert by paramName).
 * `paramName`, `displayName`, and `weight` are required.
 */
export interface UpsertHealthParamWeightRequest {
  paramName: string;
  displayName: string;
  weight: number;
  penaltyMultiplier?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  applicableTo?: ApplicableTo;
}
