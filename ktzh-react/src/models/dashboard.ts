export interface Alert {
  id?: string;
  message: string;
  timestamp: string;
  severity: 'warning' | 'critical' | 'info';
  recommendation?: string;
}
