import { buildPath } from '../../utils/svg';

interface ChartConfig {
  label: string;
  data: number[];
  min: number;
  max: number;
  gridLabels: string[];
  strokeColor: string;
}

function ChartGrid({ labels }: { labels: string[] }) {
  const ys = [10, 35, 60, 85, 110];
  return (
    <>
      {ys.map((y, i) => (
        <g key={y}>
          <line x1="30" y1={y} x2="290" y2={y} stroke="#2a2d3e" strokeWidth="0.5" />
          <text x="26" y={y + 4} fill="#475569" fontSize="8" textAnchor="end">{labels[i]}</text>
        </g>
      ))}
    </>
  );
}

function Chart({ config }: { config: ChartConfig }) {
  const path = buildPath(config.data, config.min, config.max);
  return (
    <div className="chart-box">
      <div className="chart-label">{config.label}</div>
      <svg viewBox="0 0 300 120" className="chart-svg">
        <ChartGrid labels={config.gridLabels} />
        <path d={path} fill="none" stroke={config.strokeColor} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

interface TelemetryPanelProps {
  speedTelemetry: number[];
  tempTelemetry: number[];
  electricalTelemetry: number[];
}

export default function TelemetryPanel({ speedTelemetry, tempTelemetry, electricalTelemetry }: TelemetryPanelProps) {
  const charts: ChartConfig[] = [
    {
      label: 'SPEED (km/h)',
      data: speedTelemetry,
      min: 0,
      max: 120,
      gridLabels: ['120', '90', '60', '30', '0'],
      strokeColor: '#3b82f6',
    },
    {
      label: 'TEMPERATURE (\u00B0C)',
      data: tempTelemetry,
      min: 0,
      max: 120,
      gridLabels: ['120', '90', '60', '30', '0'],
      strokeColor: '#3b82f6',
    },
    {
      label: 'ELECTRICAL SYSTEM',
      data: electricalTelemetry,
      min: 0,
      max: 28,
      gridLabels: ['28', '21', '14', '7', '0'],
      strokeColor: '#eab308',
    },
  ];

  return (
    <div className="panel telemetry-panel">
      <div className="telemetry-head">
        <span className="panel__label">REAL-TIME TELEMETRY &mdash; LAST 10 MINUTES</span>
        <div className="zoom-btns">
          <button className="btn-icon" aria-label="Zoom in">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
              <line x1="11" y1="11" x2="14" y2="14" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="5" y1="7" x2="9" y2="7" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
              <line x1="7" y1="5" x2="7" y2="9" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
          <button className="btn-icon" aria-label="Zoom out">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="7" cy="7" r="5" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
              <line x1="11" y1="11" x2="14" y2="14" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="5" y1="7" x2="9" y2="7" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="charts-row">
        {charts.map(c => (
          <Chart key={c.label} config={c} />
        ))}
      </div>
    </div>
  );
}
