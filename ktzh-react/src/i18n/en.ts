const en: Record<string, string> = {
  /* ── App / Header ────────────────────────────── */
  appName: 'KTZ Digital Twin',
  routes: 'Routes',
  activeRoutes: 'Active routes',
  dashboard: 'Dashboard',

  /* ── Navigation ──────────────────────────────── */
  backToRoutes: '\u2190 Back to Routes',
  backToDashboard: '\u2190 Back to Dashboard',
  viewReplay: 'View Replay / History',

  /* ── TopBar / Header ─────────────────────────── */
  locomotive: 'Locomotive',
  routeLabel: 'Route:',
  switchToLight: 'Switch to light mode',
  switchToDark: 'Switch to dark mode',

  /* ── Health ──────────────────────────────────── */
  systemHealthIndex: 'SYSTEM HEALTH INDEX',
  topFactors: 'TOP CONTRIBUTING FACTORS',
  healthIndex: 'Health Index',
  healthNormal: 'Normal',
  healthCaution: 'Caution',
  healthCritical: 'Critical',

  /* ── Health factor names (keys from data) ───── */
  engineTemp: 'Engine Temp',
  brakePressure: 'Brake Pressure',
  electricalSystem: 'Electrical System',

  /* ── Metric cards ────────────────────────────── */
  speed: 'SPEED',
  sand: 'FUEL',
  pressure: 'PRESSURE',
  temperature: 'TEMPERATURE',
  electrical: 'ELECTRICAL',
  mainReservoir: 'Main Reservoir',
  brakePipe: 'Brake Pipe',
  brakeCylinder: 'Brake Cyl.',
  cabin: 'Cabin',
  tractionMotor: 'Traction Motor',
  transformerOil: 'Transformer Oil',
  voltage: 'Voltage',
  current: 'Current',
  power: 'Power',

  /* ── Alerts ──────────────────────────────────── */
  alerts: 'ALERTS',
  noAlerts: 'No alerts',

  /* ── Route map ───────────────────────────────── */
  routeMap: 'ROUTE MAP',
  currentStation: 'CURRENT',
  kmhLimit: 'km/h limit',
  progress: 'Progress',
  remaining: 'Remaining',

  /* ── Telemetry ───────────────────────────────── */
  telemetryHeading: 'REAL-TIME TELEMETRY \u2014 LAST 10 MINUTES',
  chartSpeed: 'SPEED (km/h)',
  chartTemp: 'TEMPERATURE (\u00B0C)',
  chartElectrical: 'ELECTRICAL SYSTEM',

  /* ── RouteCard ───────────────────────────────── */
  departure: 'Departure',
  completed: 'Completed:',

  /* ── Replay ──────────────────────────────────── */
  replay: 'Replay / History',
  exportData: 'Export Data',
  dataPoints: 'data points',
  backToLive: '\u2190 Back to Live',
  replayTelemetry: 'REPLAY TELEMETRY',

  /* ── Status ──────────────────────────────────── */
  loading: 'Loading',

  /* ── Admin ───────────────────────────────────── */
  administration: 'Administration',
  adminView: 'Admin',
  clientView: 'Client View',
  fleetManagement: 'Fleet Management',
  fleetManagementDesc: 'Manage locomotive inventory and configurations',
  alertThresholds: 'Alert Thresholds',
  alertThresholdsDesc: 'Configure parameter thresholds for alerts',
  healthParams: 'Health Parameters',
  healthParamsDesc: 'Configure monitoring parameter weights and thresholds for the health index',
  systemDiagnostics: 'System Diagnostics',
  systemDiagnosticsDesc: 'Monitor system health and connectivity',

  /* ── Fleet table ─────────────────────────────── */
  boardNumber: 'BOARD NUMBER',
  typeCol: 'TYPE',
  productionDate: 'PRODUCTION DATE',
  statusCol: 'STATUS',
  actionsCol: 'ACTIONS',
  addLocomotive: '+ Add Locomotive',
  searchLocomotive: 'Search locomotive...',
  addNewLocomotive: 'Add New Locomotive',
  editLocomotive: 'Edit Locomotive',
  saveChanges: 'Save Changes',
  cancel: 'Cancel',
  save: 'Save',
  electric: 'Electric',
  diesel: 'Diesel',
  statusActive: 'ACTIVE',
  statusMaintenance: 'MAINTENANCE',
  statusRemoved: 'REMOVED',

  /* ── Alert thresholds ────────────────────────── */
  selectLocomotive: 'Select Locomotive',
  parameter: 'Parameter',
  thresholdValues: 'Threshold Values',
  criticalLow: 'Critical Low',
  criticalHigh: 'Critical High',
  warningLow: 'Warning Low',
  warningHigh: 'Warning High',
  saveThresholds: 'Save Thresholds',
  reset: 'Reset',
  thresholdPreview: 'Threshold Preview',
  criticalZone: 'Critical Zone',
  warningZone: 'Warning Zone',
  normalZone: 'Normal Zone',
  currentVal: 'Current',

  /* ── System diagnostics ──────────────────────── */
  rabbitMQQueues: 'RabbitMQ Queues',
  mainQueue: 'Main Queue',
  deadLetterQueue: 'Dead Letter Queue (DLQ)',
  messagesPerMin: 'messages/min',
  messagesCount: 'messages',
  ingestionService: 'Ingestion Service',
  messagesPerSec: 'messages/sec',
  operatingNormally: 'Operating normally',
  locomotiveConnections: 'Locomotive Connections',
  liveNow: 'Live now',
  noSignal: 'No signal >5 min',
  underMaintenance: 'Under maintenance',
  signalLostMin: 'Signal lost',
};

export default en;
