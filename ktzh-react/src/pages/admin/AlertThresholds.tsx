import { useState, useEffect } from 'react';
import { fetchLocomotives } from '../../api/locomotives';
import { fetchThresholds, upsertThreshold } from '../../api/thresholds';
import type { Locomotive } from '../../models/locomotive';
import type { ThresholdResponse } from '../../models/threshold';
import { useLocale } from '../../context/LocaleContext';
import '../AdminPage.css';
import './AlertThresholds.css';

interface ThresholdBarProps {
  criticalLow: number;
  criticalHigh: number;
  warningLow: number;
  warningHigh: number;
  max: number;
  unit: string;
  currentValue?: number;
}

function ThresholdBar({
  criticalLow,
  criticalHigh,
  warningLow,
  warningHigh,
  max,
  unit,
  currentValue,
}: ThresholdBarProps) {
  const pct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));

  const zones = [
    { color: '#ef4444', left: pct(0),           width: pct(criticalLow) },
    { color: '#f59e0b', left: pct(criticalLow),  width: pct(warningLow)   - pct(criticalLow) },
    { color: '#22c55e', left: pct(warningLow),   width: pct(warningHigh)  - pct(warningLow) },
    { color: '#f59e0b', left: pct(warningHigh),  width: pct(criticalHigh) - pct(warningHigh) },
    { color: '#ef4444', left: pct(criticalHigh), width: 100 - pct(criticalHigh) },
  ];

  const curPct = currentValue !== undefined ? pct(currentValue) : null;

  const ticks = [0, criticalLow, warningLow, warningHigh, criticalHigh, max].filter(
    (v, i, arr) => arr.indexOf(v) === i && v >= 0,
  );

  return (
    <div className="threshold-bar-wrap">
      {curPct !== null && currentValue !== undefined && (
        <div className="threshold-current" style={{ left: `${curPct}%` }}>
          <div className="threshold-current__label">Current: {currentValue}{unit}</div>
          <div className="threshold-current__dot" />
        </div>
      )}

      <div className="threshold-bar">
        {zones.map((z, i) => (
          <div
            key={i}
            className="threshold-bar__zone"
            style={{ left: `${z.left}%`, width: `${z.width}%`, background: z.color }}
          />
        ))}
      </div>

      <div className="threshold-ticks">
        {ticks.map(v => (
          <span key={v} className="threshold-tick" style={{ left: `${pct(v)}%` }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function guessMax(unit?: string, paramName?: string): number {
  const u = (unit ?? '').toLowerCase();
  const p = (paramName ?? '').toLowerCase();
  if (u === '°c' || u === 'c' || p.includes('temp')) return 150;
  if (u === 'km/h' || p.includes('speed')) return 200;
  if (u === 'mpa' || u === 'bar' || p.includes('pressure')) return 10;
  if (u === 'kv' || p.includes('catenary')) return 30;
  if (u === 'v' || p.includes('voltage')) return 1000;
  if (u === 'a' || p.includes('current')) return 2000;
  if (u === '%' || p.includes('level') || p.includes('throttle')) return 100;
  if (u === 'kn' || p.includes('force')) return 500;
  return 120;
}

export default function AlertThresholds() {
  const { t } = useLocale();

  const [locos,      setLocos]      = useState<Locomotive[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdResponse[]>([]);
  const [loading,    setLoading]    = useState(true);

  const [selectedLocoId,  setSelectedLocoId]  = useState('');
  const [selectedThreshId, setSelectedThreshId] = useState('');

  const [criticalLow,  setCriticalLow]  = useState('');
  const [criticalHigh, setCriticalHigh] = useState('');
  const [warningLow,   setWarningLow]   = useState('');
  const [warningHigh,  setWarningHigh]  = useState('');

  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');

  useEffect(() => {
    Promise.all([fetchLocomotives(), fetchThresholds()])
      .then(([ls, ts]) => {
        setLocos(ls);
        setThresholds(ts);
        if (ls.length > 0) setSelectedLocoId(ls[0].id);
        if (ts.length > 0) setSelectedThreshId(ts[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedThresh =
    thresholds.find(t => t.id === selectedThreshId) ??
    thresholds[0] ??
    null;

  useEffect(() => {
    if (!selectedThresh) return;
    setCriticalLow(String(selectedThresh.criticalLow  ?? ''));
    setCriticalHigh(String(selectedThresh.criticalHigh ?? ''));
    setWarningLow(String(selectedThresh.warningLow    ?? ''));
    setWarningHigh(String(selectedThresh.warningHigh  ?? ''));
  }, [selectedThresh?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const numCL = parseFloat(criticalLow)  || 0;
  const numCH = parseFloat(criticalHigh) || 0;
  const numWL = parseFloat(warningLow)   || 0;
  const numWH = parseFloat(warningHigh)  || 0;
  const unit  = selectedThresh?.unit ?? '';
  const max   = guessMax(unit, selectedThresh?.paramName);

  const currentPreview = Math.round((numWL + numWH) / 2);

  function handleReset() {
    if (!selectedThresh) return;
    setCriticalLow(String(selectedThresh.criticalLow  ?? ''));
    setCriticalHigh(String(selectedThresh.criticalHigh ?? ''));
    setWarningLow(String(selectedThresh.warningLow    ?? ''));
    setWarningHigh(String(selectedThresh.warningHigh  ?? ''));
    setSaveMsg('');
  }

  async function handleSave() {
    if (!selectedThresh) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const saved = await upsertThreshold({
        locomotiveId:          selectedLocoId || undefined,
        paramName:             selectedThresh.paramName,
        displayName:           selectedThresh.displayName,
        applicableTo:          selectedThresh.applicableTo,
        criticalLow:           numCL,
        criticalHigh:          numCH,
        warningLow:            numWL,
        warningHigh:           numWH,
        warningRecommendation: selectedThresh.warningRecommendation,
        criticalRecommendation: selectedThresh.criticalRecommendation,
        enabled:               selectedThresh.enabled,
      });
      setThresholds(prev =>
        prev.map(t =>
          t.id === saved.id || t.paramName === saved.paramName ? saved : t,
        ),
      );
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-section__header">
        <div className="admin-section__title">{t('alertThresholds')}</div>
        <div className="admin-section__desc">{t('alertThresholdsDesc')}</div>
      </div>

      {loading ? (
        <div className="threshold-loading">{t('loading')}…</div>
      ) : (
        <div className="threshold-layout">
          {/* Left: configuration */}
          <div className="admin-card threshold-config">
            <div className="threshold-config__title">Configuration</div>

            <label className="form-label">
              {t('selectLocomotive')}
              <select
                className="form-select"
                value={selectedLocoId}
                onChange={e => setSelectedLocoId(e.target.value)}
              >
                {locos.map(l => (
                  <option key={l.id} value={l.id}>{l.code}</option>
                ))}
              </select>
            </label>

            <label className="form-label" style={{ marginTop: 12 }}>
              {t('parameter')}
              <select
                className="form-select"
                value={selectedThresh?.id ?? ''}
                onChange={e => setSelectedThreshId(e.target.value)}
              >
                {thresholds.map(thresh => (
                  <option key={thresh.id} value={thresh.id}>
                    {thresh.displayName}{thresh.unit ? ` ${thresh.unit}` : ''}
                  </option>
                ))}
              </select>
            </label>

            {selectedThresh && (
              <div className="threshold-values-box">
                <div className="threshold-values-title">{t('thresholdValues')}</div>
                <div className="threshold-values-grid">
                  <label className="form-label threshold-label--critical">
                    {t('criticalLow')}
                    <input
                      className="form-input"
                      type="number"
                      value={criticalLow}
                      onChange={e => setCriticalLow(e.target.value)}
                    />
                  </label>
                  <label className="form-label threshold-label--critical">
                    {t('criticalHigh')}
                    <input
                      className="form-input"
                      type="number"
                      value={criticalHigh}
                      onChange={e => setCriticalHigh(e.target.value)}
                    />
                  </label>
                  <label className="form-label threshold-label--warning">
                    {t('warningLow')}
                    <input
                      className="form-input"
                      type="number"
                      value={warningLow}
                      onChange={e => setWarningLow(e.target.value)}
                    />
                  </label>
                  <label className="form-label threshold-label--warning">
                    {t('warningHigh')}
                    <input
                      className="form-input"
                      type="number"
                      value={warningHigh}
                      onChange={e => setWarningHigh(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {saveMsg && (
              <div
                className={`threshold-save-msg${
                  saveMsg === 'Saved!'
                    ? ' threshold-save-msg--ok'
                    : ' threshold-save-msg--err'
                }`}
              >
                {saveMsg}
              </div>
            )}

            <div className="threshold-config__actions">
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving || !selectedThresh}
              >
                {saving ? '...' : t('saveThresholds')}
              </button>
              <button
                className="btn-secondary"
                onClick={handleReset}
                disabled={!selectedThresh}
              >
                {t('reset')}
              </button>
            </div>
          </div>

          {/* Right: preview */}
          <div className="admin-card threshold-preview">
            <div className="threshold-preview__title">{t('thresholdPreview')}</div>

            {selectedThresh ? (
              <>
                <ThresholdBar
                  criticalLow={numCL}
                  criticalHigh={numCH}
                  warningLow={numWL}
                  warningHigh={numWH}
                  max={max}
                  unit={unit}
                  currentValue={currentPreview}
                />

                <div className="threshold-legend">
                  <div className="threshold-legend__item">
                    <span className="threshold-legend__dot threshold-legend__dot--critical" />
                    <span className="threshold-legend__label">{t('criticalZone')}</span>
                    <span className="threshold-legend__range">
                      &lt;{numCL}{unit} or &gt;{numCH}{unit}
                    </span>
                  </div>
                  <div className="threshold-legend__item">
                    <span className="threshold-legend__dot threshold-legend__dot--warning" />
                    <span className="threshold-legend__label">{t('warningZone')}</span>
                    <span className="threshold-legend__range">
                      {numCL}–{numWL}{unit}, {numWH}–{numCH}{unit}
                    </span>
                  </div>
                  <div className="threshold-legend__item">
                    <span className="threshold-legend__dot threshold-legend__dot--normal" />
                    <span className="threshold-legend__label">{t('normalZone')}</span>
                    <span className="threshold-legend__range">
                      {numWL}–{numWH}{unit}
                    </span>
                  </div>
                </div>

                {(selectedThresh.warningRecommendation || selectedThresh.criticalRecommendation) && (
                  <div className="threshold-recommendations">
                    {selectedThresh.warningRecommendation && (
                      <div className="threshold-rec threshold-rec--warning">
                        <span className="threshold-rec__label">Warning:</span>
                        <span>{selectedThresh.warningRecommendation}</span>
                      </div>
                    )}
                    {selectedThresh.criticalRecommendation && (
                      <div className="threshold-rec threshold-rec--critical">
                        <span className="threshold-rec__label">Critical:</span>
                        <span>{selectedThresh.criticalRecommendation}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="threshold-no-param">Select a parameter to preview</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
