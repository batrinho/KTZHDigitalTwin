import { useNavigate } from 'react-router-dom';
import type { ApiRoute } from '../models/api';
import { getHealthInfo, categoryToHealthInfo } from '../models/route';
import { useLocale } from '../context/LocaleContext';
import './RouteCard.css';

const HEALTH_STATUS_KEY: Record<string, string> = {
  Normal: 'healthNormal',
  Caution: 'healthCaution',
  Critical: 'healthCritical',
};

function parseRouteLabel(routeId: string): string {
  return routeId
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' → ');
}

interface RouteCardProps {
  route: ApiRoute;
  totalKm: number | null;
}

export default function RouteCard({ route, totalKm }: RouteCardProps) {
  const navigate = useNavigate();
  const { t } = useLocale();

  const health = route.healthCategory
    ? categoryToHealthInfo(route.healthCategory)
    : getHealthInfo(route.healthScore);

  const score = route.healthScore != null ? Math.round(route.healthScore) : '—';
  const odo = route.odometer ?? 0;
  const pct = totalKm && totalKm > 0 ? Math.min(100, (odo / totalKm) * 100) : null;
  const routeLabel = route.routeId ? parseRouteLabel(route.routeId) : null;

  return (
    <div className="card" onClick={() => navigate(`/dashboard/${route.locomotiveId}`)}>

      {/* ── Left: identity ─────────────────────────────── */}
      <div className="card__info">
        <div className="card__route">
          {routeLabel ?? route.locomotiveId}
          {route.locomotiveType && (
            <span className="card__type">{route.locomotiveType}</span>
          )}
        </div>
        <div className="card__meta">{t('locomotive')} {route.locomotiveId}</div>
        {route.phase && (
          <div className="card__meta card__phase">{route.phase}</div>
        )}
      </div>

      {/* ── Center: progress bar ────────────────────────── */}
      <div className="card__progress-section">
        {routeLabel && totalKm ? (
          <div className="card__progress-labels">
            <span className="card__progress-from">
              {route.routeId?.split('-')[0] ?? ''}
            </span>
            <span className="card__progress-to">
              {route.routeId?.split('-').slice(1).join('-') ?? ''}
            </span>
          </div>
        ) : null}

        <div className="card__progress-track">
          <div
            className="card__progress-fill"
            style={{ width: pct != null ? `${pct}%` : '0%' }}
          />
          {pct != null && (
            <div
              className="card__progress-train"
              style={{ left: `${pct}%` }}
              title={`${Math.round(odo)} km`}
            >
              <svg viewBox="0 0 24 16" width="24" height="16" fill="none">
                <rect x="1" y="3" width="20" height="10" rx="2" fill="#3b82f6" />
                <rect x="3" y="5" width="4" height="5" rx="1" fill="#1e3a5f" />
                <rect x="9" y="5" width="4" height="5" rx="1" fill="#1e3a5f" />
                <circle cx="5" cy="13.5" r="2" fill="#94a3b8" />
                <circle cx="17" cy="13.5" r="2" fill="#94a3b8" />
              </svg>
            </div>
          )}
        </div>

        <div className="card__progress-stat">
          {t('completed')} <strong>{Math.round(odo)} km</strong>
          {totalKm ? <span className="card__progress-total"> / {totalKm} km</span> : null}
        </div>

        {route.speed != null && (
          <div className="card__speed-row">
            <span className="card__speed-val">{Math.round(route.speed)}</span>
            <span className="card__speed-unit">km/h</span>
          </div>
        )}
      </div>

      {/* ── Right: health badge ─────────────────────────── */}
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
        {route.healthTrend && (
          <div className="card__trend" style={{ color: health.color }}>
            {route.healthTrend === 'IMPROVING' ? '↑' :
             route.healthTrend === 'DEGRADING'  ? '↓' : '→'}
          </div>
        )}
      </div>
    </div>
  );
}
