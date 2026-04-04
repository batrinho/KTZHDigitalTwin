import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useLocale } from '../context/LocaleContext';
import { fetchHistory } from '../api/history';
import { exportCsv } from '../api/history';
import { buildPath } from '../utils/svg';
import './ReplayPage.css';

type TimeRange = '15m' | '1h' | '6h' | '24h' | '72h';

const RANGE_MS: Record<TimeRange, number> = {
  '15m': 15 * 60_000,
  '1h':  60 * 60_000,
  '6h':  6 * 60 * 60_000,
  '24h': 24 * 60 * 60_000,
  '72h': 72 * 60 * 60_000,
};

interface HistoryChart {
  label: string;
  field: string;
  strokeColor: string;
  min: number;
  max: number;
  gridLabels: string[];
}

const CHARTS: HistoryChart[] = [
  { label: 'chartSpeed', field: 'speed', strokeColor: '#3b82f6', min: 0, max: 120, gridLabels: ['120', '90', '60', '30', '0'] },
  { label: 'chartTemp', field: 'coolant_temp', strokeColor: '#3b82f6', min: 0, max: 120, gridLabels: ['120', '90', '60', '30', '0'] },
  { label: 'chartElectrical', field: 'voltage', strokeColor: '#eab308', min: 0, max: 28, gridLabels: ['28', '21', '14', '7', '0'] },
];

export default function ReplayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();
  const locomotiveId = id ?? '';

  const [range, setRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, number>[]>([]);

  const loadHistory = useCallback(async (r: TimeRange) => {
    setRange(r);
    setLoading(true);
    setError(null);
    try {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - RANGE_MS[r]).toISOString();
      const resolution = RANGE_MS[r] > 60 * 60_000 ? '1min' : 'raw';
      const rows = await fetchHistory(locomotiveId, from, to, resolution);
      setData(rows as unknown as Record<string, number>[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [locomotiveId]);

  const handleExport = useCallback(async () => {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - RANGE_MS[range]).toISOString();
    await exportCsv(locomotiveId, from, to);
  }, [locomotiveId, range]);

  const extractField = (field: string): number[] =>
    data.map(row => (row[field] as number) ?? 0);

  return (
    <div className="replay-page">
      <AppHeader title={t('replay')} subtitle={locomotiveId} />

      <div className="topnav">
        <button className="btn btn--ghost" onClick={() => navigate(`/dashboard/${locomotiveId}`)}>
          {t('backToDashboard')}
        </button>
        <button className="btn btn--outline" onClick={handleExport}>
          {t('exportData')}
        </button>
      </div>

      <div className="replay-controls panel">
        <div className="replay-ranges">
          {(Object.keys(RANGE_MS) as TimeRange[]).map(r => (
            <button
              key={r}
              className={`replay-range-btn${r === range ? ' replay-range-btn--active' : ''}`}
              onClick={() => loadHistory(r)}
            >
              {r}
            </button>
          ))}
        </div>
        {loading && <span className="replay-status">{t('loading')}...</span>}
        {error && <span className="replay-status replay-status--error">{error}</span>}
        {!loading && !error && data.length > 0 && (
          <span className="replay-status">{data.length} {t('dataPoints')}</span>
        )}
      </div>

      <div className="replay-charts">
        {CHARTS.map(chart => {
          const values = extractField(chart.field);
          const path = values.length > 1 ? buildPath(values, chart.min, chart.max) : '';

          return (
            <div className="panel chart-box" key={chart.field}>
              <div className="chart-label">{t(chart.label)}</div>
              <svg viewBox="0 0 300 120" className="chart-svg">
                {[10, 35, 60, 85, 110].map((y, i) => (
                  <g key={y}>
                    <line x1="30" y1={y} x2="290" y2={y} stroke="#2a2d3e" strokeWidth="0.5" />
                    <text x="26" y={y + 4} fill="#475569" fontSize="8" textAnchor="end">
                      {chart.gridLabels[i]}
                    </text>
                  </g>
                ))}
                {path && (
                  <path d={path} fill="none" stroke={chart.strokeColor} strokeWidth="1.5" />
                )}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
