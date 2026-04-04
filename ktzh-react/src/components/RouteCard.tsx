import { useNavigate } from 'react-router-dom';
import type { Route } from '../models/route';
import { getHealthInfo, getProgressPercent } from '../models/route';
import TrainIcon from './icons/TrainIcon';
import { useLocale } from '../context/LocaleContext';
import './RouteCard.css';

const HEALTH_STATUS_KEY: Record<string, string> = {
  Normal: 'healthNormal',
  Caution: 'healthCaution',
  Critical: 'healthCritical',
};

interface RouteCardProps {
  route: Route;
}

export default function RouteCard({ route }: RouteCardProps) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const progress = getProgressPercent(route.completedKm, route.totalKm);
  const health = getHealthInfo(route.healthIndex);

  return (
    <div className="card" onClick={() => navigate(`/dashboard/${route.id}`)}>
      <div className="card__info">
        <div className="card__route">
          {route.from}
          <span className="card__arrow">&rarr;</span>
          {route.to}
        </div>
        <div className="card__meta">{t('locomotive')} {route.locomotive}</div>
        <div className="card__meta">{t('departure')} {route.departure}</div>
      </div>

      <div className="card__progress-section">
        <div className="progress-wrap">
          <div className="train-anchor" style={{ left: `${progress}%` }}>
            <TrainIcon className="train-icon" />
          </div>
          <div className="track">
            <div className="track__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="cities">
          <span className="city">{route.from}</span>
          <span className="city">{route.to}</span>
        </div>

        <div className="completed">
          {t('completed')}&nbsp;<strong>{route.completedKm}&nbsp;km</strong>
        </div>
      </div>

      <div className="card__health">
        <div
          className="health-badge"
          style={{ borderColor: health.color, color: health.color }}
        >
          {route.healthIndex}
        </div>
        <div className="health-label">{t('healthIndex')}</div>
        <div className="health-status" style={{ color: health.color }}>
          {t(HEALTH_STATUS_KEY[health.status] ?? health.status)}
        </div>
      </div>
    </div>
  );
}
