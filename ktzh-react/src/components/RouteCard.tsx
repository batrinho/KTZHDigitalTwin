import { useNavigate } from 'react-router-dom';
import type { ApiRoute } from '../models/api';
import { getHealthInfo, categoryToHealthInfo } from '../models/route';
import TrainIcon from './icons/TrainIcon';
import { useLocale } from '../context/LocaleContext';
import './RouteCard.css';

const HEALTH_STATUS_KEY: Record<string, string> = {
  Normal: 'healthNormal',
  Caution: 'healthCaution',
  Critical: 'healthCritical',
};

interface RouteCardProps {
  route: ApiRoute;
}

export default function RouteCard({ route }: RouteCardProps) {
  const navigate = useNavigate();
  const { t } = useLocale();

  const health = route.healthCategory
    ? categoryToHealthInfo(route.healthCategory)
    : getHealthInfo(route.healthScore);

  const score = route.healthScore != null ? Math.round(route.healthScore) : '—';

  return (
    <div className="card" onClick={() => navigate(`/dashboard/${route.locomotiveId}`)}>
      <div className="card__info">
        <div className="card__route">
          {route.locomotiveId}
          {route.locomotiveType && (
            <span className="card__type">{route.locomotiveType}</span>
          )}
        </div>
        {route.routeId && (
          <div className="card__meta">{t('routeLabel')} {route.routeId}</div>
        )}
        {route.phase && (
          <div className="card__meta">{route.phase}</div>
        )}
      </div>

      <div className="card__telemetry-section">
        <div className="card__telemetry-row">
          <TrainIcon className="train-icon" />
          <div className="card__live-stats">
            {route.speed != null && (
              <span className="card__stat">
                <strong>{Math.round(route.speed)}</strong> km/h
              </span>
            )}
            {route.fuelLevel != null && (
              <span className="card__stat">
                <strong>{Math.round(route.fuelLevel)}</strong>% {t('fuel').toLowerCase()}
              </span>
            )}
          </div>
        </div>
        {route.healthTrend && (
          <div className="card__trend">
            {route.healthTrend === 'IMPROVING' ? '↑' :
             route.healthTrend === 'DEGRADING' ? '↓' : '→'}{' '}
            {route.healthTrend.toLowerCase()}
          </div>
        )}
      </div>

      <div className="card__health">
        <div
          className="health-badge"
          style={{ borderColor: health.color, color: health.color }}
        >
          {score}
        </div>
        <div className="health-label">{t('healthIndex')}</div>
        <div className="health-status" style={{ color: health.color }}>
          {t(HEALTH_STATUS_KEY[health.status] ?? health.status)}
        </div>
      </div>
    </div>
  );
}
