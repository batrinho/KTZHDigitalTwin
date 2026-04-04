export interface Alert {
  message: string;
  timestamp: string;
  severity: 'warning' | 'critical' | 'info';
  recommendation?: string;
}
