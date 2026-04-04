import type { HealthFactor } from '../../models/dashboard';
import type { HealthInfo } from '../../models/route';
import FactorIcon from '../icons/FactorIcon';
import { useLocale } from '../../context/LocaleContext';

const CIRC = 2 * Math.PI * 80;

const FACTOR_KEY: Record<string, string> = {
  temp: 'engineTemp',
  brake: 'brakePressure',
  electrical: 'electricalSystem',
};

const HEALTH_STATUS_KEY: Record<string, string> = {
  Normal: 'healthNormal',
  Caution: 'healthCaution',
  Critical: 'healthCritical',
};

interface HealthPanelProps {
  healthIndex: number;
  healthInfo: HealthInfo;
  healthFactors: HealthFactor[];
}

export default function HealthPanel({ healthIndex, healthInfo, healthFactors }: HealthPanelProps) {
  const { t } = useLocale();
  const fill = (healthIndex / 100) * CIRC;
  const gaugeDash = `${fill} ${CIRC}`;
  const statusLabel = t(HEALTH_STATUS_KEY[healthInfo.status] ?? healthInfo.status);

  return (
    <div className="panel health-panel">
      <div className="health-panel__body">
        <div className="gauge-wrap">
          <svg viewBox="0 0 200 200" className="gauge-svg">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#2a2d3e" strokeWidth="10" />
            <circle cx="100" cy="100" r="80" fill="none"
              stroke={healthInfo.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={gaugeDash}
              transform="rotate(-90 100 100)" />
            <text x="100" y="95" textAnchor="middle" dominantBaseline="central"
              fill="#e2e8f0" fontSize="52" fontWeight="700">
              {healthIndex}
            </text>
            <text x="100" y="130" textAnchor="middle"
              fill={healthInfo.color} fontSize="16" fontWeight="500">
              {statusLabel}
            </text>
          </svg>
        </div>

        <div className="factors">
          <h3 className="panel__label">{t('systemHealthIndex')}</h3>
          <p className="factors__title">{t('topFactors')}</p>
          {healthFactors.map(f => (
            <div className="factor-row" key={f.name}>
              <span className="factor-icon"><FactorIcon icon={f.icon} /></span>
              <span className="factor-name">{t(FACTOR_KEY[f.icon] ?? f.name)}</span>
              <div className="factor-bar">
                <div className="factor-bar__fill" style={{ width: `${f.value}%`, background: f.color }} />
              </div>
              <span className="factor-val" style={{ color: f.color }}>{f.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
