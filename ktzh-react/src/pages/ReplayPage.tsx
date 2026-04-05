import {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import HealthPanel from '../components/dashboard/HealthPanel';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import RouteMap from '../components/dashboard/RouteMap';
import { useLocale } from '../context/LocaleContext';
import { fetchHistory, exportCsv } from '../api/history';
import { fetchHealthHistory } from '../api/health';
import { fetchAlertHistory } from '../api/alerts';
import type { ActiveAlert } from '../api/alerts';
import { fetchRouteDefinitionByRouteId } from '../api/routeDefinitions';
import { fetchRoutes } from '../api/routes';
import { categoryToHealthInfo } from '../models/route';
import { buildPath } from '../utils/svg';
import type { HistoryPoint, HealthSnapshot, RouteDefinition, ApiRoute } from '../models/api';
import type { Alert } from '../models/dashboard';
import type { Station } from '../components/dashboard/RouteMap';
import './ReplayPage.css';

/* ── Types ──────────────────────────────────────────────── */

type TimeRange = '15m' | '1h' | '6h' | '24h' | '72h';
type PlaySpeed = 1 | 2 | 4 | 8;

const RANGE_MS: Record<TimeRange, number> = {
  '15m':  15 * 60_000,
  '1h':    1 * 60 * 60_000,
  '6h':    6 * 60 * 60_000,
  '24h':  24 * 60 * 60_000,
  '72h':  72 * 60 * 60_000,
};

const SPEED_CYCLE: PlaySpeed[] = [1, 2, 4, 8];

/* ── Timeline event detection from telemetry data ─────── */

interface TimelineEvent {
  position: number;
  label: string;
  color: string;
  severity: 'warning' | 'critical' | 'info';
  index: number;
  timestamp: string;
}


/* ── Helpers ─────────────────────────────────────────────── */

function fmtTs(ts: string): string {
  try { return new Date(ts).toLocaleTimeString('en-GB', { hour12: false }); }
  catch { return ts; }
}

function tempClass(value: number | undefined, warnAt: number, critAt: number): string {
  if (value == null) return '';
  if (value >= critAt) return 'temp-val--hot';
  if (value >= warnAt) return 'temp-val--warn';
  return '';
}

/* ── SVG Icons ───────────────────────────────────────────── */

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}
function SkipStartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19,5 7,12 19,19" />
      <rect x="5" y="5" width="3" height="14" rx="1" />
    </svg>
  );
}
function SkipEndIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,5 17,12 5,19" />
      <rect x="16" y="5" width="3" height="14" rx="1" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ── Timeline Bar ────────────────────────────────────────── */

interface TimelineBarProps {
  data: HistoryPoint[];
  currentIndex: number;
  events: TimelineEvent[];
  playing: boolean;
  playSpeed: PlaySpeed;
  onSeek: (idx: number) => void;
  onTogglePlay: () => void;
  onSpeedCycle: () => void;
  onRewind: () => void;
  onSkipEnd: () => void;
}

function TimelineBar({
  data, currentIndex, events, playing, playSpeed,
  onSeek, onTogglePlay, onSpeedCycle, onRewind, onSkipEnd,
}: TimelineBarProps) {
  const max = Math.max(0, data.length - 1);
  const pct = max > 0 ? (currentIndex / max) * 100 : 0;
  const startLabel = data[0]               ? fmtTs(data[0].timestamp)               : '—';
  const endLabel   = data[data.length - 1] ? fmtTs(data[data.length - 1].timestamp) : '—';
  const curLabel   = data[currentIndex]    ? fmtTs(data[currentIndex].timestamp)     : '—';

  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  return (
    <div className="rp-timeline panel">
      {/* Time labels */}
      <div className="tl-time-row">
        <span className="tl-time">{startLabel}</span>
        <span className="tl-time tl-time--current">{curLabel}</span>
        <span className="tl-time">{endLabel}</span>
      </div>

      {/* Track + event markers */}
      <div className="tl-track-wrap">
        <div className="tl-fill" style={{ width: `${pct}%` }} />
        {events.map((ev, i) => (
          <div
            key={i}
            className="tl-event-marker"
            style={{ left: `${ev.position * 100}%` }}
            onMouseEnter={() => setHoveredEvent(ev)}
            onMouseLeave={() => setHoveredEvent(null)}
            onClick={() => onSeek(ev.index)}
          >
            <div className="tl-event-dot" style={{ background: ev.color }} />
          </div>
        ))}
        <input
          type="range"
          className="tl-scrubber"
          min={0}
          max={max}
          value={currentIndex}
          onChange={e => onSeek(Number(e.target.value))}
        />
      </div>

      {/* Hovered event tooltip */}
      {hoveredEvent && (
        <div
          className="tl-event-tooltip"
          style={{ left: `${hoveredEvent.position * 100}%` }}
        >
          <span className="tl-event-tooltip__label" style={{ color: hoveredEvent.color }}>
            {hoveredEvent.label}
          </span>
          <span className="tl-event-tooltip__time">
            {fmtTs(hoveredEvent.timestamp)}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="tl-controls">
        <button className="tl-ctrl-btn" onClick={onRewind} title="Rewind to start">
          <SkipStartIcon />
        </button>
        <button className="tl-ctrl-btn tl-ctrl-btn--play" onClick={onTogglePlay}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="tl-ctrl-btn" onClick={onSkipEnd} title="Skip to end">
          <SkipEndIcon />
        </button>
        <button className="tl-ctrl-btn tl-ctrl-btn--speed" onClick={onSpeedCycle}>
          {playSpeed}×
        </button>
      </div>
    </div>
  );
}

/* ── Replay Chart ────────────────────────────────────────── */

interface ReplayChartProps {
  label: string;
  data: number[];
  timestamps: string[];
  min: number;
  max: number;
  gridLabels: string[];
  strokeColor: string;
  cursorIndex: number;
  totalPoints: number;
}

function ReplayChart({
  label, data, timestamps, min, max, gridLabels, strokeColor, cursorIndex, totalPoints,
}: ReplayChartProps) {
  const path = data.length > 1 ? buildPath(data, min, max) : '';
  const X0 = 30, W = 260, Y0 = 10, H = 100;
  const cursorX = totalPoints > 1 ? X0 + (cursorIndex / (totalPoints - 1)) * W : X0;
  const range = max - min || 1;
  const cursorY = (() => {
    const idx = Math.max(0, Math.min(Math.round(cursorIndex), data.length - 1));
    const val = data[idx] ?? 0;
    return Y0 + (1 - (val - min) / range) * H;
  })();

  const labelCount = 6;
  const timeLabels: { x: number; text: string }[] = [];
  if (timestamps.length >= 2) {
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.round((i / (labelCount - 1)) * (timestamps.length - 1));
      const ts = timestamps[idx];
      timeLabels.push({
        x: X0 + (i / (labelCount - 1)) * W,
        text: ts ? fmtTs(ts) : '',
      });
    }
  }

  return (
    <div className="chart-box">
      <div className="chart-label">{label}</div>
      <svg viewBox="0 0 300 135" className="chart-svg">
        {[10, 35, 60, 85, 110].map((y, i) => (
          <g key={y}>
            <line x1={X0} y1={y} x2={290} y2={y} stroke="#2a2d3e" strokeWidth="0.5" />
            <text x={X0 - 4} y={y + 4} fill="#475569" fontSize="8" textAnchor="end">{gridLabels[i]}</text>
          </g>
        ))}
        {timeLabels.map(l => (
          <text key={l.x} x={l.x} y={128} fill="#475569" fontSize="7" textAnchor="middle">
            {l.text}
          </text>
        ))}
        {path && <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" />}
        {data.length > 1 && (
          <>
            <line
              x1={cursorX} y1={Y0} x2={cursorX} y2={Y0 + H}
              stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" strokeDasharray="3 2"
            />
            <circle cx={cursorX} cy={cursorY} r="3" fill={strokeColor} stroke="var(--color-bg)" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  );
}

const CHARTS = [
  { labelKey: 'chartSpeed',      field: 'speed',                strokeColor: '#3b82f6', min: 0, max: 120, gridLabels: ['120', '90', '60', '30', '0'] },
  { labelKey: 'chartTemp',       field: 'traction_motor_temp',  strokeColor: '#3b82f6', min: 0, max: 160, gridLabels: ['160', '120', '80', '40', '0'] },
  { labelKey: 'chartElectrical', field: 'catenary_voltage',     strokeColor: '#eab308', min: 0, max: 30,  gridLabels: ['30',  '22', '15',  '7', '0'] },
];

/* ══════════════════════════════════════════════════════════
   ReplayPage — Full dashboard replay with backend API data
   ══════════════════════════════════════════════════════════ */

export default function ReplayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();
  const locoId = id ?? '';

  /* ── Data state ─────────────────────────────────────────── */
  const [range, setRange]               = useState<TimeRange>('1h');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [data, setData]                 = useState<HistoryPoint[]>([]);
  const [healthHist, setHealthHist]     = useState<HealthSnapshot[]>([]);
  const [alertHist, setAlertHist]       = useState<ActiveAlert[]>([]);
  const [routeDef, setRouteDef]         = useState<RouteDefinition | null>(null);
  const [, setRouteInfo]                = useState<ApiRoute | null>(null);
  const [from, setFrom]                 = useState('');
  const [to, setTo]                     = useState('');

  /* ── Playback state ─────────────────────────────────────── */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying]           = useState(false);
  const [playSpeed, setPlaySpeed]       = useState<PlaySpeed>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Derived: events on timeline (real alerts + phase changes) ── */
  const events = useMemo((): TimelineEvent[] => {
    if (data.length < 2) return [];
    const n = data.length;

    // Map each alert timestamp to a position on the telemetry timeline
    const alertEvents: TimelineEvent[] = alertHist.map(a => {
      const alertTs = new Date(a.triggeredAt).getTime();
      // Find the closest telemetry index by timestamp
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < data.length; i++) {
        const diff = Math.abs(new Date(data[i].timestamp).getTime() - alertTs);
        if (diff < minDiff) { minDiff = diff; closestIdx = i; }
      }
      const sev = a.severity.toLowerCase();
      return {
        position: closestIdx / (n - 1),
        label: a.message,
        color: sev === 'critical' ? '#ef4444' : sev === 'warning' ? '#eab308' : '#3b82f6',
        severity: (sev === 'critical' || sev === 'warning' ? sev : 'info') as TimelineEvent['severity'],
        index: closestIdx,
        timestamp: a.triggeredAt,
      };
    });

    // Phase-change markers from telemetry (always useful)
    const phaseEvents: TimelineEvent[] = [];
    let lastPhase = data[0].phase;
    for (let i = 1; i < n; i++) {
      const row = data[i];
      if (row.phase && row.phase !== lastPhase) {
        const label = row.phase === 'STATION_STOP' || row.phase === 'STOPPED'
          ? 'Station Stop' : `Phase: ${row.phase}`;
        phaseEvents.push({
          position: i / (n - 1), label, color: '#64748b',
          severity: 'info', index: i, timestamp: row.timestamp,
        });
        lastPhase = row.phase;
      }
    }

    return [...alertEvents, ...phaseEvents].sort((a, b) => a.position - b.position);
  }, [data, alertHist]);

  /* ── Current data row at playback cursor ────────────────── */
  const currentRow = data[currentIndex] ?? null;

  /* ── Current telemetry snapshot at cursor ────────────────── */
  const currentTelemetry = useMemo(() => ({
    speed:                  currentRow?.speed                  as number | undefined,
    sand_level:             currentRow?.sand_level             as number | undefined,
    main_reservoir_pressure: currentRow?.main_reservoir_pressure as number | undefined,
    brake_pipe_pressure:    currentRow?.brake_pipe_pressure    as number | undefined,
    brake_cylinder_pressure: currentRow?.brake_cylinder_pressure as number | undefined,
    cabin_temp:             currentRow?.cabin_temp             as number | undefined,
    traction_motor_temp:    currentRow?.traction_motor_temp    as number | undefined,
    transformer_oil_temp:   currentRow?.transformer_oil_temp   as number | undefined,
    catenary_voltage:       currentRow?.catenary_voltage       as number | undefined,
    traction_motor_current: currentRow?.traction_motor_current as number | undefined,
  }), [currentRow]);

  const computedPower = useMemo(() => {
    const { catenary_voltage, traction_motor_current } = currentTelemetry;
    return catenary_voltage != null && traction_motor_current != null
      ? (catenary_voltage * traction_motor_current) / 1000
      : null;
  }, [currentTelemetry]);

  /* ── Health at current cursor position ──────────────────── */
  const currentHealth = useMemo((): HealthSnapshot | null => {
    if (!currentRow || healthHist.length === 0) return null;
    const ts = new Date(currentRow.timestamp).getTime();
    let best: HealthSnapshot | null = null;
    for (const h of healthHist) {
      if (new Date(h.timestamp).getTime() <= ts) best = h;
      else break;
    }
    return best;
  }, [currentRow, healthHist]);

  const healthScore    = currentHealth?.score    ?? null;
  const healthCategory = currentHealth?.category ?? null;
  const healthInfo     = categoryToHealthInfo(healthCategory);

  /* ── Alerts visible up to current cursor position ─────── */
  const replayAlerts = useMemo((): Alert[] => {
    if (!data.length) return [];
    const cursorTs = data[currentIndex]
      ? new Date(data[currentIndex].timestamp).getTime()
      : 0;

    return alertHist
      .filter(a => new Date(a.triggeredAt).getTime() <= cursorTs)
      .map(a => ({
        id: a.id,
        message: a.message,
        severity: (a.severity.toLowerCase() === 'critical' ? 'critical'
          : a.severity.toLowerCase() === 'warning' ? 'warning' : 'info') as Alert['severity'],
        timestamp: fmtTs(a.triggeredAt),
        recommendation: a.recommendation,
      }))
      .reverse();
  }, [alertHist, currentIndex, data]);

  /* ── Route/station progress at cursor ───────────────────── */
  const { stations, progressPercent, remainingKm } = useMemo(() => {
    if (!routeDef || !currentRow) {
      return { stations: [] as Station[], progressPercent: 0, remainingKm: 0 };
    }

    const odo = (currentRow.odometer as number) ?? 0;
    const totalKm = routeDef.totalKm || 1;

    const sorted = [...routeDef.waypoints].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    let currentIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].kmFromStart <= odo) currentIdx = i;
    }

    const stationList: Station[] = sorted.map((wp, i) => ({
      name: wp.cityName,
      distanceKm: wp.kmFromStart,
      status: i < currentIdx
        ? 'passed'
        : i === currentIdx
          ? 'current'
          : 'upcoming',
      speedLimit: wp.speedLimit,
    }));

    const pct = Math.min(100, Math.round((odo / totalKm) * 100));
    const rem = Math.max(0, Math.round(totalKm - odo));

    return { stations: stationList, progressPercent: pct, remainingKm: rem };
  }, [routeDef, currentRow]);

  /* ── Load history data from backend ─────────────────────── */
  const loadHistory = useCallback(async (r: TimeRange) => {
    setRange(r);
    setPlaying(false);
    setCurrentIndex(0);
    setLoading(true);
    setError(null);
    try {
      const toDate   = new Date();
      const fromDate = new Date(Date.now() - RANGE_MS[r]);
      const toIso    = toDate.toISOString();
      const fromIso  = fromDate.toISOString();
      setFrom(fromIso);
      setTo(toIso);

      const resolution = RANGE_MS[r] > 60 * 60_000 ? '1min' : 'raw';

      const [rows, health, alerts] = await Promise.all([
        fetchHistory(locoId, fromIso, toIso, resolution),
        fetchHealthHistory(locoId, fromIso, toIso).catch(() => []),
        fetchAlertHistory(locoId, fromIso, toIso).catch(() => []),
      ]);

      setData(rows as unknown as HistoryPoint[]);
      setHealthHist(health as unknown as HealthSnapshot[]);
      setAlertHist(alerts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [locoId]);

  /* ── Initial load ───────────────────────────────────────── */
  useEffect(() => { loadHistory('1h'); }, [loadHistory]);

  /* ── Fetch route definition for this locomotive ─────────── */
  useEffect(() => {
    if (!locoId) return;
    let cancelled = false;

    fetchRoutes()
      .then(routes => {
        if (cancelled) return;
        const route = routes.find(r => r.locomotiveId === locoId);
        if (route) {
          setRouteInfo(route);
          if (route.routeId) {
            return fetchRouteDefinitionByRouteId(route.routeId);
          }
        }
        return undefined;
      })
      .then(def => {
        if (!cancelled && def) setRouteDef(def);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [locoId]);

  /* ── Playback timer ─────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (!playing || data.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + playSpeed;
        if (next >= data.length - 1) {
          setPlaying(false);
          return data.length - 1;
        }
        return next;
      });
    }, 500);
    return clearTimer;
  }, [playing, playSpeed, data.length, clearTimer]);

  /* ── Playback controls ──────────────────────────────────── */
  const seekTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(data.length - 1, idx)));
  }, [data.length]);

  const handleTogglePlay = useCallback(() => {
    if (currentIndex >= data.length - 1) setCurrentIndex(0);
    setPlaying(p => !p);
  }, [currentIndex, data.length]);

  const handleSpeedCycle = useCallback(() => {
    setPlaySpeed(s => SPEED_CYCLE[(SPEED_CYCLE.indexOf(s) + 1) % SPEED_CYCLE.length]);
  }, []);

  const handleExport = useCallback(async () => {
    if (from && to) await exportCsv(locoId, from, to);
  }, [locoId, from, to]);

  const p = currentTelemetry;

  return (
    <div className="replay-page">
      <AppHeader title={t('replay')} subtitle={locoId} />

      {/* ── Top nav: Back to live + range selector + export ── */}
      <div className="rp-topnav">
        <div className="rp-topnav__left">
          <button className="btn btn--ghost" onClick={() => navigate(`/dashboard/${locoId}`)}>
            {t('backToLive')}
          </button>
          <span className="rp-mode-badge">REPLAY MODE</span>
        </div>
        <div className="rp-topnav__right">
          <div className="rp-ranges">
            {(Object.keys(RANGE_MS) as TimeRange[]).map(r => (
              <button
                key={r}
                className={`rp-range-btn${r === range ? ' rp-range-btn--active' : ''}`}
                onClick={() => loadHistory(r)}
                disabled={loading}
              >{r}</button>
            ))}
          </div>
          {loading && <span className="rp-status">{t('loading')}…</span>}
          {error   && <span className="rp-status rp-status--error">{error}</span>}
          {!loading && !error && data.length > 0 && (
            <span className="rp-status">{data.length} {t('dataPoints')}</span>
          )}
          <button
            className="btn btn--primary"
            onClick={handleExport}
            disabled={!from || loading}
          >
            <ExportIcon />
            {t('exportData')}
          </button>
        </div>
      </div>

      {/* ── Timeline slider with alert markers ───────────────── */}
      {data.length > 0 && (
        <TimelineBar
          data={data}
          currentIndex={currentIndex}
          events={events}
          playing={playing}
          playSpeed={playSpeed}
          onSeek={seekTo}
          onTogglePlay={handleTogglePlay}
          onSpeedCycle={handleSpeedCycle}
          onRewind={() => { setPlaying(false); setCurrentIndex(0); }}
          onSkipEnd={() => { setPlaying(false); setCurrentIndex(data.length - 1); }}
        />
      )}

      {/* ── Full dashboard snapshot at current replay time ──── */}
      {data.length > 0 && (
        <div className="main-grid">
          <div className="main-left">
            {/* Health panel */}
            <HealthPanel
              healthIndex={healthScore != null ? Math.round(healthScore) : null}
              healthInfo={healthInfo}
              healthFactors={[]}
            />

            {/* Speed / Sand / Pressure row */}
            <div className="metrics-row">
              {/* Speed */}
              <div className="panel metric-card">
                <div className="metric-card__head">
                  <svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="#94a3b8" strokeWidth="1.2" fill="none" /><path d="M8 5v3l2 2" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  <span className="metric-card__label">{t('speed')}</span>
                  <span className="metric-card__unit">km/h</span>
                </div>
                <div className="metric-card__value">{p.speed != null ? Math.round(p.speed) : '—'}</div>
                <div className="bar-thin bar-thin--yellow"><div className="bar-thin__fill" style={{ width: `${((p.speed ?? 0) / 120) * 100}%` }} /></div>
                <div className="bar-labels"><span>0</span><span>120</span></div>
              </div>

              {/* Sand/Fuel */}
              <div className="panel metric-card">
                <div className="metric-card__head">
                  <svg width="14" height="14" viewBox="0 0 16 16"><rect x="3" y="2" width="8" height="12" rx="1" stroke="#94a3b8" strokeWidth="1.2" fill="none" /><rect x="5" y="6" width="4" height="6" rx="0.5" fill="#3b82f640" /></svg>
                  <span className="metric-card__label">{t('sand')}</span>
                  <span className="metric-card__unit">%</span>
                </div>
                <div className="metric-card__value">{p.sand_level != null ? Math.round(p.sand_level) : '—'}</div>
                <div className="bar-thin bar-thin--blue"><div className="bar-thin__fill" style={{ width: `${p.sand_level ?? 0}%` }} /></div>
              </div>

              {/* Pressure */}
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
                    <div><span className="pressure-sublabel">{t('brakePipe')}</span><span className="pressure-val">{p.brake_pipe_pressure?.toFixed(2) ?? '—'}</span></div>
                    <div><span className="pressure-sublabel">{t('brakeCylinder')}</span><span className="pressure-val">{p.brake_cylinder_pressure?.toFixed(2) ?? '—'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Temperature / Electrical row */}
            <div className="metrics-row metrics-row--two">
              {/* Temperature */}
              <div className="panel metric-card">
                <div className="metric-card__head">
                  <svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 1v10M5 11a3 3 0 106 0" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" /></svg>
                  <span className="metric-card__label">{t('temperature')}</span>
                  <span className="metric-card__unit">°C</span>
                </div>
                <div className="temp-rows">
                  <div className="temp-row">
                    <span>{t('cabin')}</span>
                    <span className={`temp-val ${tempClass(p.cabin_temp, 30, 40)}`}>{p.cabin_temp != null ? `${Math.round(p.cabin_temp)}°` : '—'}</span>
                  </div>
                  <div className="temp-row">
                    <span>{t('tractionMotor')}</span>
                    <span className={`temp-val ${tempClass(p.traction_motor_temp, 120, 150)}`}>{p.traction_motor_temp != null ? `${Math.round(p.traction_motor_temp)}°` : '—'}</span>
                  </div>
                  <div className="temp-row">
                    <span>{t('transformerOil')}</span>
                    <span className={`temp-val ${tempClass(p.transformer_oil_temp, 80, 100)}`}>{p.transformer_oil_temp != null ? `${Math.round(p.transformer_oil_temp)}°` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Electrical */}
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
                    <div><span className="elec-sublabel">{t('current')}</span><span className="elec-val">{p.traction_motor_current != null ? Math.round(p.traction_motor_current) : '—'} <small>A</small></span></div>
                    <div><span className="elec-sublabel">{t('power')}</span><span className="elec-val">{computedPower != null ? computedPower.toFixed(1) : '—'} <small>MW</small></span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts panel */}
            <AlertsPanel alerts={replayAlerts} />
          </div>

          {/* Route map sidebar */}
          <RouteMap
            stations={stations}
            progressPercent={progressPercent}
            remainingKm={remainingKm}
          />
        </div>
      )}

      {/* ── Charts: full replay window with cursor ───────────── */}
      {data.length > 0 && (
        <div className="panel rp-charts-panel">
          <div className="telemetry-head">
            <span className="panel__label">{t('replayTelemetry')}</span>
          </div>
          <div className="charts-row">
            {CHARTS.map(c => (
              <ReplayChart
                key={c.field}
                label={t(c.labelKey)}
                data={data.map(row => (row[c.field] as number) ?? 0)}
                timestamps={data.map(row => row.timestamp)}
                min={c.min}
                max={c.max}
                gridLabels={c.gridLabels}
                strokeColor={c.strokeColor}
                cursorIndex={currentIndex}
                totalPoints={data.length}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div className="rp-empty panel">Select a time range above to load replay data.</div>
      )}
    </div>
  );
}
