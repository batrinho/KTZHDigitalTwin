import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { categoryToHealthInfo } from '../models/route';
import { acknowledgeAlert } from '../api/alerts';
import AppHeader from '../components/AppHeader';
import TopBar from '../components/dashboard/TopBar';
import HealthPanel from '../components/dashboard/HealthPanel';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import TelemetryPanel from '../components/dashboard/TelemetryPanel';
import RouteMap from '../components/dashboard/RouteMap';
import { useLocale } from '../context/LocaleContext';
import type { Alert } from '../models/dashboard';
import './DashboardPage.css';

function tempClass(value: number | undefined, warnAt: number, critAt: number): string {
  if (value == null) return '';
  if (value >= critAt) return 'temp-val--hot';
  if (value >= warnAt) return 'temp-val--warn';
  return '';
}

export default function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const ws = useDashboardData(id);
  const {
    connected, locomotiveType, routeId, telemetry,
    healthScore, healthCategory, healthFactors,
    buffer, stations, progressPercent, remainingKm,
  } = ws;

  const [alerts, setAlerts] = useState<Alert[]>(ws.alerts);
  useEffect(() => { setAlerts(ws.alerts); }, [ws.alerts]);

  const handleDismiss = useCallback(async (alert: Alert) => {
    setAlerts(prev => prev.filter(a => a !== alert));
    if (alert.id) {
      await acknowledgeAlert(alert.id).catch(() => {});
    }
  }, []);

  const healthInfo = categoryToHealthInfo(healthCategory);
  const p = telemetry;

  const computedPower =
    p.catenary_voltage != null && p.traction_motor_current != null
      ? (p.catenary_voltage * p.traction_motor_current) / 1000
      : null;

  return (
    <div className="dashboard">
      <AppHeader title={t('dashboard')} />

      <div className="topnav">
        <button className="btn btn--ghost" onClick={() => navigate('/')}>
          {t('backToRoutes')}
        </button>
        <button className="btn btn--outline" onClick={() => navigate(`/replay/${id}`)}>
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
                <span className="metric-card__label">{t('sand')}</span>
                <span className="metric-card__unit">%</span>
              </div>
              <div className="metric-card__value">{p.sand_level != null ? Math.round(p.sand_level) : '—'}</div>
              <div className="bar-thin bar-thin--blue">
                <div className="bar-thin__fill" style={{ width: `${p.sand_level ?? 0}%` }} />
              </div>
            </div>

            <div className="panel metric-card">
              <div className="metric-card__head">
                <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="1.2" fill="none" /><path d="M8 5v3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <span className="metric-card__label">{t('pressure')}</span>
                <span className="metric-card__unit">MPa</span>
              </div>
              <div className="pressure-grid">
                <div>
                  <span className="pressure-sublabel">{t('mainReservoir')}</span>
                  <span className="pressure-val pressure-val--green">{p.main_reservoir_pressure?.toFixed(2) ?? '—'}</span>
                </div>
                <div className="pressure-pair">
                  <div>
                    <span className="pressure-sublabel">{t('brakePipe')}</span>
                    <span className="pressure-val">{p.brake_pipe_pressure?.toFixed(2) ?? '—'}</span>
                  </div>
                  <div>
                    <span className="pressure-sublabel">{t('brakeCylinder')}</span>
                    <span className="pressure-val">{p.brake_cylinder_pressure?.toFixed(2) ?? '—'}</span>
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
                  <span>{t('cabin')}</span>
                  <span className={`temp-val ${tempClass(p.cabin_temp, 30, 40)}`}>
                    {p.cabin_temp != null ? `${Math.round(p.cabin_temp)}°` : '—'}
                  </span>
                </div>
                <div className="temp-row">
                  <span>{t('tractionMotor')}</span>
                  <span className={`temp-val ${tempClass(p.traction_motor_temp, 120, 150)}`}>
                    {p.traction_motor_temp != null ? `${Math.round(p.traction_motor_temp)}°` : '—'}
                  </span>
                </div>
                <div className="temp-row">
                  <span>{t('transformerOil')}</span>
                  <span className={`temp-val ${tempClass(p.transformer_oil_temp, 80, 100)}`}>
                    {p.transformer_oil_temp != null ? `${Math.round(p.transformer_oil_temp)}°` : '—'}
                  </span>
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
                  <span className="elec-val elec-val--yellow">{p.catenary_voltage?.toFixed(1) ?? '—'} <small>kV</small></span>
                </div>
                <div className="elec-pair">
                  <div>
                    <span className="elec-sublabel">{t('current')}</span>
                    <span className="elec-val">{p.traction_motor_current != null ? Math.round(p.traction_motor_current) : '—'} <small>A</small></span>
                  </div>
                  <div>
                    <span className="elec-sublabel">{t('power')}</span>
                    <span className="elec-val">{computedPower != null ? computedPower.toFixed(1) : '—'} <small>MW</small></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertsPanel alerts={alerts} onDismiss={handleDismiss} />
        </div>

        <RouteMap
          stations={stations}
          progressPercent={progressPercent}
          remainingKm={remainingKm}
        />
      </div>

      <TelemetryPanel buffer={buffer} />
    </div>
  );
}
