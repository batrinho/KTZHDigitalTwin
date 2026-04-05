export type ApplicableTo = 'BOTH' | 'DIESEL' | 'ELECTRIC';

export interface HealthParamWeight {
  id: string;
  paramName: string;
  displayName: string;
  weight: number;
  penaltyMultiplier?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  applicableTo?: ApplicableTo;
}

export interface UpsertHealthParamWeightRequest {
  paramName: string;
  displayName: string;
  weight: number;
  penaltyMultiplier?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  applicableTo?: ApplicableTo;
}
