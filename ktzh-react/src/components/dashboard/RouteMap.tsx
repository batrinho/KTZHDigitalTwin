import type { Station } from '../../models/dashboard';
import { useLocale } from '../../context/LocaleContext';

interface RouteMapProps {
  stations: Station[];
  progressPercent: number;
  remainingKm: number;
}

export default function RouteMap({ stations, progressPercent, remainingKm }: RouteMapProps) {
  const { t } = useLocale();

  return (
    <div className="panel route-map-panel">
      <h3 className="panel__label" style={{ marginBottom: 16 }}>{t('routeMap')}</h3>

      <div className="timeline">
        {stations.map((s, i) => (
          <div className={`tl-item tl-item--${s.status}`} key={s.name}>
            <div className="tl-rail">
              <span className="tl-dot" />
              {i < stations.length - 1 && <span className="tl-line" />}
            </div>
            <div className="tl-body">
              <span className="tl-name">{s.name}</span>
              <span className="tl-km">{s.distanceKm} km</span>
              {s.status === 'current' && (
                <span className="tl-badge tl-badge--current">{t('currentStation')}</span>
              )}
              {s.speedLimit && (
                <span className="tl-badge tl-badge--speed">{s.speedLimit} {t('kmhLimit')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="route-progress">
        <div>
          <span className="rp-label">{t('progress')}</span>
          <span className="rp-value">{progressPercent}%</span>
        </div>
        <div>
          <span className="rp-label">{t('remaining')}</span>
          <span className="rp-value">{remainingKm} <small>km</small></span>
        </div>
      </div>
    </div>
  );
}
