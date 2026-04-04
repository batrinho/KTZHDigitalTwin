import type { HealthFactor } from '../../models/dashboard';
import type { HealthInfo } from '../../models/route';
import FactorIcon from '../icons/FactorIcon';

const CIRC = 2 * Math.PI * 80;

interface HealthPanelProps {
  healthIndex: number;
  healthInfo: HealthInfo;
  healthFactors: HealthFactor[];
}

export default function HealthPanel({ healthIndex, healthInfo, healthFactors }: HealthPanelProps) {
  const fill = (healthIndex / 100) * CIRC;
  const gaugeDash = `${fill} ${CIRC}`;

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
              {healthInfo.status}
            </text>
          </svg>
        </div>

        <div className="factors">
          <h3 className="panel__label">SYSTEM HEALTH INDEX</h3>
          <p className="factors__title">TOP CONTRIBUTING FACTORS</p>
          {healthFactors.map(f => (
            <div className="factor-row" key={f.name}>
              <span className="factor-icon"><FactorIcon icon={f.icon} /></span>
              <span className="factor-name">{f.name}</span>
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
