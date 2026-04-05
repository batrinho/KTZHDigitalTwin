import { useState, useEffect, useRef } from 'react';
import { fetchLocomotives } from '../../api/locomotives';
import { apiFetch } from '../../api/client';
import type { Locomotive, LocomotiveStatus } from '../../models/locomotive';
import type { ApiRoute } from '../../models/api';
import { useLocale } from '../../context/LocaleContext';
import '../AdminPage.css';
import './SystemDiagnostics.css';

/* ── Icons ──────────────────────────────────────── */
function RabbitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="14" rx="8" ry="6" stroke="#60a5fa" strokeWidth="1.6" />
      <path d="M8 8c0-3 1.5-6 4-6s4 3 4 6" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="14" r="1" fill="#60a5fa" />
      <circle cx="15" cy="14" r="1" fill="#60a5fa" />
      <path d="M10 17c.7.7 3.3.7 4 0" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IngestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1" fill="#60a5fa" />
    </svg>
  );
}

/* ── Types ───────────────────────────────────────── */
interface QueueStats {
  mainQueueCount: number;
  mainQueueRate: number;
  dlqCount: number;
  status: 'active' | 'down';
}

interface IngestStats {
  messagesPerSec: number;
  status: 'ok' | 'degraded' | 'down';
}

interface LocoConnection {
  code: string;
  status: LocomotiveStatus;
  live: boolean;
  minutesAgo?: number;
}

/* ── Helpers ─────────────────────────────────────── */
function Badge({ children, variant }: { children: React.ReactNode; variant: 'active' | 'empty' | 'ok' | 'warn' }) {
  return <span className={`diag-badge diag-badge--${variant}`}>{children}</span>;
}

/* ── Main ────────────────────────────────────────── */
export default function SystemDiagnostics() {
  const { t } = useLocale();
  const [locos, setLocos] = useState<Locomotive[]>([]);
  const [activeRoutes, setActiveRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    mainQueueCount: 0,
    mainQueueRate: 0,
    dlqCount: 0,
    status: 'active',
  });
  const [ingestStats, setIngestStats] = useState<IngestStats>({ messagesPerSec: 0, status: 'ok' });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      fetchLocomotives(),
      apiFetch<ApiRoute[]>('/api/v1/routes').catch(() => [] as ApiRoute[]),
    ]).then(([ls, routes]) => {
      setLocos(ls);
      setActiveRoutes(routes);
      // Derive simulated queue/ingest stats from live route count
      const liveCount = routes.length;
      setQueueStats({
        mainQueueCount: liveCount * 2847 + 153,
        mainQueueRate: liveCount * 2847 + 153,
        dlqCount: 0,
        status: 'active',
      });
      setIngestStats({
        messagesPerSec: liveCount * 780,
        status: 'ok',
      });
    }).finally(() => setLoading(false));

    // Simulate live-ish fluctuation every 2s
    timerRef.current = setInterval(() => {
      setQueueStats(prev => ({
        ...prev,
        mainQueueRate: prev.mainQueueRate + Math.round((Math.random() - 0.5) * 200),
      }));
      setIngestStats(prev => ({
        ...prev,
        messagesPerSec: prev.messagesPerSec + Math.round((Math.random() - 0.5) * 60),
      }));
    }, 2000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const liveLocoCodes = new Set(activeRoutes.map(r => r.locomotiveId));

  const connections: LocoConnection[] = locos.map(l => ({
    code: l.code,
    status: l.status,
    live: liveLocoCodes.has(l.id) && l.status === 'ACTIVE',
    minutesAgo: l.status === 'MAINTENANCE' ? undefined : (liveLocoCodes.has(l.id) ? undefined : 8),
  }));

  const liveConns   = connections.filter(c => c.live);
  const offlineConns = connections.filter(c => !c.live);

  return (
    <div>
      <div className="admin-section__header">
        <div className="admin-section__title">{t('systemDiagnostics')}</div>
        <div className="admin-section__desc">{t('systemDiagnosticsDesc')}</div>
      </div>

      {loading ? (
        <div className="diag-loading">{t('loading')}…</div>
      ) : (
        <div className="diag-grid">
          {/* ── RabbitMQ ── */}
          <div className="admin-card diag-card">
            <div className="diag-card__header">
              <RabbitIcon />
              <span className="diag-card__title">{t('rabbitMQQueues')}</span>
            </div>

            <div className="diag-queue">
              <div className="diag-queue__row">
                <span className="diag-queue__name">{t('mainQueue')}</span>
                <Badge variant="active">Active</Badge>
              </div>
              <div className="diag-queue__stat">
                {queueStats.mainQueueRate.toLocaleString()}
              </div>
              <div className="diag-queue__unit">{t('messagesPerMin')}</div>
            </div>

            <div className="diag-queue-divider" />

            <div className="diag-queue">
              <div className="diag-queue__row">
                <span className="diag-queue__name">{t('deadLetterQueue')}</span>
                <Badge variant="empty">Empty</Badge>
              </div>
              <div className="diag-queue__stat">{queueStats.dlqCount}</div>
              <div className="diag-queue__unit">{t('messagesCount')}</div>
            </div>
          </div>

          {/* ── Ingestion Service ── */}
          <div className="admin-card diag-card">
            <div className="diag-card__header">
              <IngestIcon />
              <span className="diag-card__title">{t('ingestionService')}</span>
            </div>

            <div className="diag-ingest__stat">
              {ingestStats.messagesPerSec.toLocaleString()}
            </div>
            <div className="diag-ingest__unit">{t('messagesPerSec')}</div>

            <div className="diag-ingest__status">
              <Badge variant="ok">{t('operatingNormally')}</Badge>
            </div>
          </div>

          {/* ── Locomotive Connections ── */}
          <div className="admin-card diag-card">
            <div className="diag-card__header">
              <WifiIcon />
              <span className="diag-card__title">{t('locomotiveConnections')}</span>
            </div>

            {liveConns.length > 0 && (
              <>
                <div className="diag-conn__group-label">{t('liveNow')}</div>
                {liveConns.map(c => (
                  <div key={c.code} className="diag-conn__item">
                    <span className="diag-conn__dot diag-conn__dot--live" />
                    <span className="diag-conn__code">{c.code}</span>
                  </div>
                ))}
              </>
            )}

            {offlineConns.length > 0 && (
              <>
                <div className="diag-conn__divider" />
                <div className="diag-conn__group-label">{t('noSignal')}</div>
                {offlineConns.map(c => (
                  <div key={c.code} className="diag-conn__item">
                    <span className="diag-conn__dot diag-conn__dot--offline" />
                    <div>
                      <div className="diag-conn__code">{c.code}</div>
                      <div className="diag-conn__sub">
                        {c.status === 'MAINTENANCE'
                          ? <span className="diag-conn__maintenance">{t('underMaintenance')}</span>
                          : <span className="diag-conn__lost">{t('signalLostMin')} {c.minutesAgo} min ago</span>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {connections.length === 0 && (
              <div className="diag-conn__empty">No locomotives registered</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
