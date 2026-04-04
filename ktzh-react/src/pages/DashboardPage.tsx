import { useNavigate, useParams } from 'react-router-dom';
import { useTelemetryWs } from '../hooks/useTelemetryWs';
import { categoryToHealthInfo } from '../models/route';
import AppHeader from '../components/AppHeader';
import TopBar from '../components/dashboard/TopBar';
import HealthPanel from '../components/dashboard/HealthPanel';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import TelemetryPanel from '../components/dashboard/TelemetryPanel';
import { useLocale } from '../context/LocaleContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const {
    connected,
    locomotiveType,
    routeId,
    telemetry,
    healthScore,
    healthCategory,
    healthFactors,
    alerts,
    buffer,
  } = useTelemetryWs(id);

  const healthInfo = categoryToHealthInfo(healthCategory);
  const p = telemetry;

  return (
    <div className="dashboard">
      <AppHeader title={t('dashboard')} />

      <div className="topnav">
        <button className="btn btn--ghost" onClick={() => navigate('/')}>
          {t('backToRoutes')}
        </button>
        <button
          className="btn btn--outline"
          onClick={() => navigate(`/replay/${id}`)}
        >
          {t('viewReplay')}
        </button>
      </div>

      <TopBar
        locomotiveId={id ?? '—'}
        locomotiveType={locomotiveType}
        routeId={routeId}
        connected={connected}
      />

      <div className="main-grid">
        <div className="main-left">
          <HealthPanel
            healthIndex={healthScore != null ? Math.round(healthScore) : null}
            healthInfo={healthInfo}
            healthFactors={healthFactors}
          />

          <div className="metrics-row">
            <div className="panel metric-card">
              <div className="metric-card__head">
                <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="1.2" fill="none" /><path d="M8 5v3l2 2" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" /></svg>
                <span className="metric-card__label">{t('speed')}</span>
                <span className="metric-card__unit">km/h</span>
              </div>
              <div className="metric-card__value">{p.speed != null ? Math.round(p.speed) : '—'}</div>
              <div className="bar-thin bar-thin--yellow">
                <div className="bar-thin__fill" style={{ width: `${((p.speed ?? 0) / 120) * 100}%` }} />
              </div>
              <div className="bar-labels"><span>0</span><span>120</span></div>
            </div>

            <div className="panel metric-card">
              <div className="metric-card__head">
                <svg width="14" height="14" viewBox="0 0 16 16"><rect x="3" y="2" width="8" height="12" rx="1" stroke="#94a3b8" strokeWidth="1.2" fill="none" /><rect x="5" y="6" width="4" height="6" rx="0.5" fill="#3b82f640" /></svg>
                <span className="metric-card__label">{t('fuel')}</span>
                <span className="metric-card__unit">%</span>
              </div>
              <div className="metric-card__value">{p.fuel_level != null ? Math.round(p.fuel_level) : '—'}</div>
              {p.fuel_consumption != null && (
                <div className="metric-card__sub">{t('consumption')} {p.fuel_consumption.toFixed(1)} {t('lPerMin')}</div>
              )}
              <div className="bar-thin bar-thin--blue">
                <div className="bar-thin__fill" style={{ width: `${p.fuel_level ?? 0}%` }} />
              </div>
            </div>

            <div className="panel metric-card">
              <div className="metric-card__head">
                <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="1.2" fill="none" /><path d="M8 5v3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <span className="metric-card__label">{t('pressure')}</span>
                <span className="metric-card__unit">Pascal</span>
              </div>
              <div className="pressure-grid">
                <div>
                  <span className="pressure-sublabel">{t('mainReservoir')}</span>
                  <span className="pressure-val pressure-val--green">{p.main_reservoir_pressure?.toFixed(2) ?? '—'}</span>
                </div>
                <div className="pressure-pair">
                  <div>
                    <span className="pressure-sublabel">{t('brake')}</span>
                    <span className="pressure-val">{p.brake_pressure?.toFixed(2) ?? '—'}</span>
                  </div>
                  <div>
                    <span className="pressure-sublabel">{t('oil')}</span>
                    <span className="pressure-val">{p.oil_pressure?.toFixed(2) ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="metrics-row metrics-row--two">
            <div className="panel metric-card">
              <div className="metric-card__head">
                <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 1v10M5 11a3 3 0 106 0" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg>
                <span className="metric-card__label">{t('temperature')}</span>
                <span className="metric-card__unit">&deg;C</span>
              </div>
              <div className="temp-rows">
                <div className="temp-row">
                  <span>{t('engine')}</span>
                  <span className="temp-val">{p.engine_temp != null ? `${Math.round(p.engine_temp)}°` : '—'}</span>
                </div>
                <div className="temp-row">
                  <span>{t('brakes')}</span>
                  <span className="temp-val">{p.brake_temp != null ? `${Math.round(p.brake_temp)}°` : '—'}</span>
                </div>
                <div className="temp-row">
                  <span>{t('coolant')}</span>
                  <span className="temp-val temp-val--hot">{p.coolant_temp != null ? `${Math.round(p.coolant_temp)}°` : '—'}</span>
                </div>
              </div>
            </div>

            <div className="panel metric-card">
              <div className="metric-card__head">
                <svg width="14" height="14" viewBox="0 0 16 16"><path d="M9 1L4 9h4l-1 6 6-8H9l1-6z" stroke="#94a3b8" strokeWidth="1.2" fill="none" /></svg>
                <span className="metric-card__label">{t('electrical')}</span>
              </div>
              <div className="elec-grid">
                <div>
                  <span className="elec-sublabel">{t('voltage')}</span>
                  <span className="elec-val elec-val--yellow">{p.voltage?.toFixed(1) ?? '—'} <small>kV</small></span>
                </div>
                <div className="elec-pair">
                  <div>
                    <span className="elec-sublabel">{t('current')}</span>
                    <span className="elec-val">{p.current != null ? Math.round(p.current) : '—'} <small>A</small></span>
                  </div>
                  <div>
                    <span className="elec-sublabel">{t('power')}</span>
                    <span className="elec-val">{p.power?.toFixed(1) ?? '—'} <small>MW</small></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertsPanel alerts={alerts} />
        </div>

        {/* RouteMap removed — no longer hardcoded stations */}
      </div>

      <TelemetryPanel buffer={buffer} />
    </div>
  );
}
