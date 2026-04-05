import { useState, useEffect, useCallback, useRef } from 'react';
import { WS_BASE } from '../api/config';
import { fetchActiveAlerts } from '../api/alerts';
import { fetchHealthNearest } from '../api/health';
import { useRingBuffer, type TimestampedTelemetry } from './useRingBuffer';
import type {
  WsMessage,
  TelemetrySnapshot,
  TelemetryParams,
  HealthIndexSnapshot,
  HealthIndexUpdate,
  WsAlert,
  HealthFactor,
} from '../models/api';
import type { Alert } from '../models/dashboard';

export interface DashboardState {
  connected: boolean;
  locomotiveType: string | null;
  routeId: string | null;
  phase: string | null;
  telemetry: TelemetryParams;
  healthScore: number | null;
  healthCategory: string | null;
  healthTrend: string | null;
  healthFactors: HealthFactor[];
  alerts: Alert[];
  gpsLat: number | null;
  gpsLon: number | null;
  odometer: number | null;
}

const EMPTY_TELEMETRY: TelemetryParams = {};

const INITIAL_STATE: DashboardState = {
  connected: false,
  locomotiveType: null,
  routeId: null,
  phase: null,
  telemetry: EMPTY_TELEMETRY,
  healthScore: null,
  healthCategory: null,
  healthTrend: null,
  healthFactors: [],
  alerts: [],
  gpsLat: null,
  gpsLon: null,
  odometer: null,
};

const MAX_ALERTS = 50;
const RECONNECT_DELAY_MS = 3000;

function deriveCategory(score: number): string {
  if (score >= 80) return 'NORMAL';
  if (score >= 60) return 'CAUTION';
  return 'CRITICAL';
}

function alertKey(a: { message: string; timestamp: string }): string {
  return `${a.message}||${a.timestamp}`;
}

export function useTelemetryWs(locomotiveId: string | undefined) {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const { buffer, push } = useRingBuffer();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmounted = useRef(false);
  const latestTelemetry = useRef<TelemetryParams>({});

  /* ── Message handlers ─────────────────────────────────── */

  const handleSnapshot = useCallback((data: TelemetrySnapshot) => {
    const params = data.smoothedParameters ?? data.rawParameters ?? {};
    latestTelemetry.current = params;
    setState(prev => ({
      ...prev,
      locomotiveType: data.locomotiveType ?? prev.locomotiveType,
      routeId: data.routeId ?? prev.routeId,
      phase: data.phase ?? prev.phase,
      telemetry: params,
      gpsLat: data.gpsLat ?? prev.gpsLat,
      gpsLon: data.gpsLon ?? prev.gpsLon,
      odometer: data.odometer ?? prev.odometer,
    }));
    push({ ...params, _ts: Date.now() } as TimestampedTelemetry);
  }, [push]);

  const handleTelemetry = useCallback((data: Record<string, unknown>) => {
    const params = (
      (data as TelemetrySnapshot).smoothedParameters ??
      (data as TelemetrySnapshot).rawParameters ??
      data
    ) as TelemetryParams;
    const merged = { ...latestTelemetry.current, ...params };
    latestTelemetry.current = merged;
    setState(prev => ({ ...prev, telemetry: merged }));
    push({ ...merged, _ts: Date.now() } as TimestampedTelemetry);
  }, [push]);

  const handleHealthSnapshot = useCallback((data: HealthIndexSnapshot) => {
    setState(prev => ({
      ...prev,
      healthScore: data.score,
      healthCategory: data.category,
      healthTrend: data.trend ?? prev.healthTrend,
    }));
  }, []);

  const handleHealthUpdate = useCallback((data: HealthIndexUpdate) => {
    setState(prev => ({
      ...prev,
      healthScore: data.score,
      healthCategory: deriveCategory(data.score),
      healthFactors: data.topFactors ?? prev.healthFactors,
    }));
  }, []);

  const handleAlert = useCallback((data: WsAlert) => {
    const alert: Alert = {
      message: data.message,
      severity: data.severity.toLowerCase() as Alert['severity'],
      timestamp: data.triggeredAt ?? new Date().toLocaleTimeString(),
      recommendation: data.recommendation,
    };
    const key = alertKey(alert);
    setState(prev => {
      if (prev.alerts.some(a => alertKey(a) === key)) return prev;
      return { ...prev, alerts: [alert, ...prev.alerts].slice(0, MAX_ALERTS) };
    });
  }, []);

  /* ── WebSocket connect (with auto-reconnect) ──────────── */

  const connect = useCallback(() => {
    if (!locomotiveId || unmounted.current) return;

    const url = `${WS_BASE}/ws/telemetry?locomotiveId=${encodeURIComponent(locomotiveId)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (unmounted.current) { ws.close(); return; }
      setState(prev => ({ ...prev, connected: true }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        switch (msg.type) {
          case 'TELEMETRY_SNAPSHOT':    handleSnapshot(msg.data as TelemetrySnapshot);         break;
          case 'TELEMETRY':             handleTelemetry(msg.data as TelemetryParams);           break;
          case 'HEALTH_INDEX_SNAPSHOT': handleHealthSnapshot(msg.data as HealthIndexSnapshot);  break;
          case 'HEALTH_INDEX':          handleHealthUpdate(msg.data as HealthIndexUpdate);       break;
          case 'ALERT':                 handleAlert(msg.data as WsAlert);                       break;
        }
      } catch {
        // ignore malformed frames
      }
    };

    const scheduleReconnect = () => {
      if (unmounted.current) return;
      setState(prev => ({ ...prev, connected: false }));
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onclose = scheduleReconnect;
    ws.onerror = () => { ws.close(); };
  }, [locomotiveId, handleSnapshot, handleTelemetry, handleHealthSnapshot, handleHealthUpdate, handleAlert]);

  /* ── REST: initial active alerts ─────────────────────── */

  useEffect(() => {
    if (!locomotiveId) return;
    let cancelled = false;

    fetchActiveAlerts(locomotiveId)
      .then(activeAlerts => {
        if (cancelled) return;
        const mapped: Alert[] = activeAlerts.map(a => ({
          message: a.message,
          severity: a.severity.toLowerCase() as Alert['severity'],
          timestamp: a.triggeredAt,
          recommendation: a.recommendation,
        }));
        setState(prev => {
          const existing = new Set(prev.alerts.map(alertKey));
          const deduped = mapped.filter(a => !existing.has(alertKey(a)));
          if (deduped.length === 0) return prev;
          return { ...prev, alerts: [...deduped, ...prev.alerts].slice(0, MAX_ALERTS) };
        });
      })
      .catch(() => { /* alerts endpoint may not be live yet */ });

    return () => { cancelled = true; };
  }, [locomotiveId]);

  /* ── REST: initial health snapshot ───────────────────── */

  useEffect(() => {
    if (!locomotiveId) return;
    let cancelled = false;

    fetchHealthNearest(locomotiveId, new Date().toISOString())
      .then(snap => {
        if (cancelled) return;
        setState(prev => {
          if (prev.healthScore != null) return prev;
          return {
            ...prev,
            healthScore: snap.score,
            healthCategory: snap.category,
          };
        });
      })
      .catch(() => { /* health endpoint may not be available */ });

    return () => { cancelled = true; };
  }, [locomotiveId]);

  /* ── WebSocket lifecycle ─────────────────────────────── */

  useEffect(() => {
    unmounted.current = false;
    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { ...state, buffer, push };
}
