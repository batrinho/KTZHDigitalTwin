/* ═══════════════════════════════════════════════════════════
   Alert Thresholds — per-parameter warning / critical bands
   Endpoints: GET/PUT /api/v1/thresholds, DELETE /api/v1/thresholds/{id}
   ═══════════════════════════════════════════════════════════ */

export interface ThresholdResponse {
  id: string;
  paramName: string;
  displayName: string;
  unit?: string;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  warningRecommendation?: string;
  criticalRecommendation?: string;
  applicableTo?: string;
  enabled?: boolean;
}

export interface UpsertThresholdRequest {
  locomotiveId?: string;
  paramName: string;
  displayName: string;
  applicableTo?: string;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  warningRecommendation?: string;
  criticalRecommendation?: string;
  enabled?: boolean;
  updatedBy?: string;
}
