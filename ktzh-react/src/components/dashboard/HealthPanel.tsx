import type { HealthInfo } from '../../models/route';
import type { HealthFactor } from '../../models/api';
import { useLocale } from '../../context/LocaleContext';

const CIRC = 2 * Math.PI * 80;

const HEALTH_STATUS_KEY: Record<string, string> = {
  Normal: 'healthNormal',
  Caution: 'healthCaution',
  Critical: 'healthCritical',
};

function factorColor(category?: string, deviation?: number): string {
  if (category === 'CRITICAL') return '#ef4444';
  if (category === 'ATTENTION' || category === 'CAUTION' || category === 'WARNING') return '#eab308';
  if (category) return '#22c55e';
  // Fall back to deriving colour from normalised deviation when no category
  if (deviation != null) {
    if (deviation >= 0.7) return '#ef4444';
    if (deviation >= 0.4) return '#eab308';
  }
  return '#22c55e';
}

interface HealthPanelProps {
  healthIndex: number | null;
  healthInfo: HealthInfo;
  healthFactors: HealthFactor[];
}

export default function HealthPanel({ healthIndex, healthInfo, healthFactors }: HealthPanelProps) {
  const { t } = useLocale();
  const idx = healthIndex ?? 0;
  const fill = (idx / 100) * CIRC;
  const isNormal = healthInfo.status === 'Normal';
  const statusLabel = t(HEALTH_STATUS_KEY[healthInfo.status] ?? healthInfo.status);

  return (
    <div className="panel health-panel">
      <div className="health-panel__body">

        {/* Gauge */}
        <div className="gauge-wrap">
          <svg viewBox="0 0 200 200" className="gauge-svg">
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <circle cx="100" cy="100" r="80" fill="none"
              stroke={healthInfo.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${fill} ${CIRC}`}
              transform="rotate(-90 100 100)"
            />
            <text x="100" y="95" textAnchor="middle" dominantBaseline="central"
              fill="var(--color-text-primary)" fontSize="52" fontWeight="700">
              {healthIndex != null ? healthIndex : '—'}
            </text>
            <text x="100" y="130" textAnchor="middle"
              fill={healthInfo.color} fontSize="16" fontWeight="500">
              {statusLabel}
            </text>
          </svg>
        </div>

        {/* Factors */}
        <div className="factors">
          <h3 className="panel__label">{t('systemHealthIndex')}</h3>

          {/* Always show this section when health is degraded */}
          {!isNormal && (
            <div className="factors__alert-banner" style={{ borderColor: healthInfo.color, color: healthInfo.color }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{healthInfo.status === 'Critical' ? 'System Critical' : 'System Caution'}</span>
            </div>
          )}

          {healthFactors.length > 0 ? (
            <>
              <p className="factors__title">{t('topFactors')}</p>
              {healthFactors.map(f => {
                const pct = Math.round(f.normalizedDeviation * 100);
                const color = factorColor(f.category, f.normalizedDeviation);
                return (
                  <div className="factor-row" key={f.paramName}>
                    <span className="factor-name">{f.displayName}</span>
                    <div className="factor-bar">
                      <div
                        className="factor-bar__fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="factor-val" style={{ color }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </>
          ) : !isNormal ? (
            <div className="factors__pending">
              <div className="factors__pending-dot" style={{ background: healthInfo.color }} />
              <span>Awaiting factor analysis…</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
