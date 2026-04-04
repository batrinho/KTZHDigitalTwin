import { useState, useEffect, useCallback, useRef } from 'react';
import { WS_BASE } from '../api/config';
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

export function useTelemetryWs(locomotiveId: string | undefined) {
  const [state, setState] = useState<DashboardState>(INITIAL_STATE);
  const { buffer, push } = useRingBuffer();
  const wsRef = useRef<WebSocket | null>(null);

  const handleSnapshot = useCallback((data: TelemetrySnapshot) => {
    const params = data.smoothedParameters ?? data.rawParameters ?? {};
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

  const handleTelemetry = useCallback((data: TelemetryParams) => {
    setState(prev => ({
      ...prev,
      telemetry: data,
    }));
    push({ ...data, _ts: Date.now() } as TimestampedTelemetry);
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
    setState(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts].slice(0, MAX_ALERTS),
    }));
  }, []);

  useEffect(() => {
    if (!locomotiveId) return;

    const url = `${WS_BASE}/ws/telemetry?locomotiveId=${encodeURIComponent(locomotiveId)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setState(prev => ({ ...prev, connected: true }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        switch (msg.type) {
          case 'TELEMETRY_SNAPSHOT':
            handleSnapshot(msg.data as TelemetrySnapshot);
            break;
          case 'TELEMETRY':
            handleTelemetry(msg.data as TelemetryParams);
            break;
          case 'HEALTH_INDEX_SNAPSHOT':
            handleHealthSnapshot(msg.data as HealthIndexSnapshot);
            break;
          case 'HEALTH_INDEX':
            handleHealthUpdate(msg.data as HealthIndexUpdate);
            break;
          case 'ALERT':
            handleAlert(msg.data as WsAlert);
            break;
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setState(prev => ({ ...prev, connected: false }));
    };

    ws.onerror = () => {
      setState(prev => ({ ...prev, connected: false }));
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [locomotiveId, handleSnapshot, handleTelemetry, handleHealthSnapshot, handleHealthUpdate, handleAlert]);

  return { ...state, buffer };
}
