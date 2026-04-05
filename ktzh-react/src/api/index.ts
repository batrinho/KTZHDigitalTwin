/* ═══════════════════════════════════════════════════════════
   API barrel export — one import for all endpoints
   Usage:  import { fetchRoutes, fetchLocomotives, ... } from '../api';
   ═══════════════════════════════════════════════════════════ */

export { apiFetch, apiPost, apiPut, apiDelete, apiDownload } from './client';
export { API_BASE, WS_BASE } from './config';

// Routes (Redis live state)
export { fetchRoutes } from './routes';

// Locomotives (CRUD)
export {
  fetchLocomotives,
  fetchLocomotive,
  createLocomotive,
  updateLocomotive,
  deleteLocomotive,
} from './locomotives';

// Health index
export { fetchHealthHistory, fetchHealthNearest } from './health';

// Health param weights (config for health-score calculation)
export {
  fetchHealthParamWeights,
  fetchHealthParamWeight,
  upsertHealthParamWeight,
  deleteHealthParamWeight,
} from './healthParamWeights';

// Route definitions (stations/waypoints from PostgreSQL)
export {
  fetchRouteDefinitions,
  fetchRouteDefinition,
  fetchRouteDefinitionByRouteId,
} from './routeDefinitions';

// History / replay
export { fetchHistory, exportCsv } from './history';

// Alerts (active alerts for a locomotive)
export { fetchActiveAlerts } from './alerts';
export type { ActiveAlert } from './alerts';
