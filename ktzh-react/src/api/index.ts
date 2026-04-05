export { apiFetch, apiPost, apiPut, apiDelete, apiDownload } from './client';
export { API_BASE, WS_BASE } from './config';

export { fetchRoutes } from './routes';

export {
  fetchLocomotives,
  fetchLocomotive,
  createLocomotive,
  updateLocomotive,
  deleteLocomotive,
} from './locomotives';

export { fetchHealthHistory, fetchHealthNearest } from './health';

export {
  fetchHealthParamWeights,
  fetchHealthParamWeight,
  upsertHealthParamWeight,
  deleteHealthParamWeight,
} from './healthParamWeights';

export {
  fetchRouteDefinitions,
  fetchRouteDefinition,
  fetchRouteDefinitionByRouteId,
} from './routeDefinitions';

export { fetchHistory, exportCsv } from './history';

export { fetchActiveAlerts, fetchAlertHistory, acknowledgeAlert } from './alerts';
export type { ActiveAlert } from './alerts';

export {
  fetchThresholds,
  fetchThreshold,
  upsertThreshold,
  deleteThreshold,
} from './thresholds';
export type { ThresholdResponse, UpsertThresholdRequest } from '../models/threshold';
