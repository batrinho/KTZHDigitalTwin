import type { Station } from '../../models/dashboard';

interface RouteMapProps {
  stations: Station[];
  progressPercent: number;
  remainingKm: number;
}

export default function RouteMap({ stations, progressPercent, remainingKm }: RouteMapProps) {
  return (
    <div className="panel route-map-panel">
      <h3 className="panel__label" style={{ marginBottom: 16 }}>ROUTE MAP</h3>

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
                <span className="tl-badge tl-badge--current">CURRENT</span>
              )}
              {s.speedLimit && (
                <span className="tl-badge tl-badge--speed">{s.speedLimit} km/h limit</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="route-progress">
        <div>
          <span className="rp-label">Progress</span>
          <span className="rp-value">{progressPercent}%</span>
        </div>
        <div>
          <span className="rp-label">Remaining</span>
          <span className="rp-value">{remainingKm} <small>km</small></span>
        </div>
      </div>
    </div>
  );
}
