export interface Station {
  name: string;
  distanceKm: number;
  status: 'passed' | 'current' | 'upcoming';
  speedLimit?: number;
}

export interface HealthFactor {
  name: string;
  icon: 'temp' | 'brake' | 'electrical';
  value: number;
  color: string;
}

export interface Alert {
  message: string;
  timestamp: string;
  severity: 'warning' | 'critical' | 'info';
}

export interface DashboardData {
  locomotiveId: string;
  routeFrom: string;
  routeTo: string;
  healthIndex: number;
  healthFactors: HealthFactor[];
  speed: number;
  maxSpeed: number;
  fuelPercent: number;
  fuelConsumption: number;
  pressureMain: number;
  pressureBrake: number;
  pressureOil: number;
  tempEngine: number;
  tempBrakes: number;
  tempCoolant: number;
  voltage: number;
  currentAmps: number;
  power: number;
  stations: Station[];
  progressPercent: number;
  remainingKm: number;
  alerts: Alert[];
  speedTelemetry: number[];
  tempTelemetry: number[];
  electricalTelemetry: number[];
}
