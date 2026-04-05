import type { HealthInfo } from '../../models/route';
import type { HealthFactor } from '../../models/api';
import { useLocale } from '../../context/LocaleContext';

const CIRC = 2 * Math.PI * 80;

const HEALTH_STATUS_KEY: Record<string, string> = {
  Normal: 'healthNormal',
  Caution: 'healthCaution',
  Critical: 'healthCritical',
};

interface HealthPanelProps {
  healthIndex: number | null;
  healthInfo: HealthInfo;
  healthFactors: HealthFactor[];
}

export default function HealthPanel({ healthIndex, healthInfo, healthFactors }: HealthPanelProps) {
  const { t } = useLocale();
  const idx = healthIndex ?? 0;
  const fill = (idx / 100) * CIRC;
  const gaugeDash = `${fill} ${CIRC}`;
  const statusLabel = t(HEALTH_STATUS_KEY[healthInfo.status] ?? healthInfo.status);

  return (
    <div className="panel health-panel">
      <div className="health-panel__body">
        <div className="gauge-wrap">
          <svg viewBox="0 0 200 200" className="gauge-svg">
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <circle cx="100" cy="100" r="80" fill="none"
              stroke={healthInfo.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={gaugeDash}
              transform="rotate(-90 100 100)" />
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

        <div className="factors">
          <h3 className="panel__label">{t('systemHealthIndex')}</h3>
          {healthFactors.length > 0 && (
            <>
              <p className="factors__title">{t('topFactors')}</p>
              {healthFactors.map(f => (
                <div className="factor-row" key={f.name}>
                  <span className="factor-name">{f.name}</span>
                  <div className="factor-bar">
                    <div
                      className="factor-bar__fill"
                      style={{
                        width: `${f.value}%`,
                        background: f.category === 'CRITICAL' ? '#ef4444' :
                                    f.category === 'ATTENTION' ? '#eab308' : '#22c55e',
                      }}
                    />
                  </div>
                  <span className="factor-val">{f.value}%</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
