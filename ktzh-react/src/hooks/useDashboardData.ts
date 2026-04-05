import { useState, useEffect, useMemo, useRef } from 'react';
import { useTelemetryWs } from './useTelemetryWs';
import { fetchHistory } from '../api/history';
import { fetchRouteDefinitionByRouteId } from '../api/routeDefinitions';
import type { TimestampedTelemetry } from './useRingBuffer';
import type { RouteDefinition } from '../models/api';
import type { Station } from '../components/dashboard/RouteMap';

const HISTORY_WINDOW_MS = 10 * 60 * 1000;

export function useDashboardData(locomotiveId: string | undefined) {
  const ws = useTelemetryWs(locomotiveId);

  const [routeDef, setRouteDef] = useState<RouteDefinition | null>(null);
  const [historySeeded, setHistorySeeded] = useState(false);
  const routeFetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!locomotiveId || historySeeded) return;
    let cancelled = false;

    const now = new Date();
    const from = new Date(now.getTime() - HISTORY_WINDOW_MS);

    fetchHistory(locomotiveId, from.toISOString(), now.toISOString(), '1min')
      .then(points => {
        if (cancelled) return;
        for (const p of points) {
          const { timestamp, phase, ...rest } = p;
          ws.push({ ...rest, _ts: new Date(timestamp).getTime() } as TimestampedTelemetry);
        }
        setHistorySeeded(true);
      })
      .catch(() => setHistorySeeded(true));

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locomotiveId]);

  useEffect(() => {
    const rid = ws.routeId;
    if (!rid || routeFetchedFor.current === rid) return;
    routeFetchedFor.current = rid;

    fetchRouteDefinitionByRouteId(rid)
      .then(setRouteDef)
      .catch(() => {});
  }, [ws.routeId]);

  const { stations, progressPercent, remainingKm } = useMemo(() => {
    if (!routeDef) return { stations: [] as Station[], progressPercent: 0, remainingKm: 0 };

    const odo = ws.odometer ?? 0;
    const totalKm = routeDef.totalKm || 1;
    const sorted = [...routeDef.waypoints].sort((a, b) => a.sortOrder - b.sortOrder);

    let currentIdx = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].kmFromStart <= odo) currentIdx = i;
    }

    const stationList: Station[] = sorted.map((wp, i) => ({
      name: wp.cityName,
      distanceKm: wp.kmFromStart,
      status: i < currentIdx ? 'passed' : i === currentIdx ? 'current' : 'upcoming',
      speedLimit: wp.speedLimit,
    }));

    return {
      stations: stationList,
      progressPercent: Math.min(100, Math.round((odo / totalKm) * 100)),
      remainingKm: Math.max(0, Math.round(totalKm - odo)),
    };
  }, [routeDef, ws.odometer]);

  return { ...ws, routeDefinition: routeDef, stations, progressPercent, remainingKm, historySeeded };
}
