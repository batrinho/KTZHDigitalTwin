import { useState, useRef } from 'react';
import { buildPath } from '../../utils/svg';
import { useLocale } from '../../context/LocaleContext';

interface ChartConfig {
  label: string;
  data: number[];
  min: number;
  max: number;
  gridLabels: string[];
  strokeColor: string;
}

const X0 = 30, Y0 = 10, W = 260, H = 100;

interface HoverState {
  svgX: number;
  svgY: number;
  value: number;
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
  const [hover, setHover] = useState<HoverState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const path = buildPath(config.data, config.min, config.max);
  const range = config.max - config.min || 1;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const rawSvgX = ((e.clientX - rect.left) / rect.width) * 300;
    const svgX = Math.max(X0, Math.min(X0 + W, rawSvgX));

    const t = (svgX - X0) / W;
    const n = config.data.length;
    const exactIdx = t * (n - 1);
    const lo = Math.floor(exactIdx);
    const hi = Math.min(Math.ceil(exactIdx), n - 1);
    const frac = exactIdx - lo;
    const value = config.data[lo] * (1 - frac) + config.data[hi] * frac;
    const svgY = Y0 + (1 - (value - config.min) / range) * H;

    setHover({ svgX, svgY, value });
  };

  const tooltipRight = hover ? hover.svgX > 230 : false;
  const tooltipAbove = hover ? hover.svgY < 28 : false;

  return (
    <div className="chart-box">
      <div className="chart-label">{config.label}</div>
      <svg
        ref={svgRef}
        viewBox="0 0 300 120"
        className="chart-svg"
        style={{ cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <ChartGrid labels={config.gridLabels} />
        <path d={path} fill="none" stroke={config.strokeColor} strokeWidth="1.5" />

        {hover && (
          <>
            <line
              x1={hover.svgX} y1={Y0}
              x2={hover.svgX} y2={Y0 + H}
              stroke={config.strokeColor}
              strokeWidth="0.8"
              strokeDasharray="3 2"
              opacity="0.65"
            />
            <circle
              cx={hover.svgX}
              cy={hover.svgY}
              r="3.5"
              fill={config.strokeColor}
              stroke="var(--color-bg)"
              strokeWidth="1.5"
            />
            <rect
              x={tooltipRight ? hover.svgX - 38 : hover.svgX + 5}
              y={tooltipAbove ? hover.svgY + 5 : hover.svgY - 18}
              width="33"
              height="14"
              rx="3"
              fill={config.strokeColor}
              opacity="0.88"
            />
            <text
              x={tooltipRight ? hover.svgX - 21 : hover.svgX + 21}
              y={tooltipAbove ? hover.svgY + 15 : hover.svgY - 8}
              fill="white"
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
            >
              {hover.value.toFixed(1)}
            </text>
          </>
        )}
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
  const { t } = useLocale();

  const charts: ChartConfig[] = [
    {
      label: t('chartSpeed'),
      data: speedTelemetry,
      min: 0,
      max: 120,
      gridLabels: ['120', '90', '60', '30', '0'],
      strokeColor: '#3b82f6',
    },
    {
      label: t('chartTemp'),
      data: tempTelemetry,
      min: 0,
      max: 120,
      gridLabels: ['120', '90', '60', '30', '0'],
      strokeColor: '#3b82f6',
    },
    {
      label: t('chartElectrical'),
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
        <span className="panel__label">{t('telemetryHeading')}</span>
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
