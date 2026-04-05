import { useState, useEffect, useMemo } from 'react';
import {
  fetchHealthParamWeights,
  upsertHealthParamWeight,
  deleteHealthParamWeight,
} from '../../api/healthParamWeights';
import type { HealthParamWeight, UpsertHealthParamWeightRequest } from '../../models/healthParamWeight';
import '../AdminPage.css';
import './HealthParams.css';

/* ── Category inference ──────────────────────────────────── */

type Category = 'Engine' | 'Hydraulics' | 'Electrical' | 'Pneumatics' | 'Fuel' | 'Other';

const CATEGORY_META: Record<Category, { label: string; icon: string; color: string }> = {
  Engine:     { label: 'Engine',     icon: '🔧', color: '#f59e0b' },
  Hydraulics: { label: 'Hydraulics', icon: '💧', color: '#3b82f6' },
  Electrical: { label: 'Electrical', icon: '⚡', color: '#a855f7' },
  Pneumatics: { label: 'Pneumatics', icon: '🌀', color: '#06b6d4' },
  Fuel:       { label: 'Fuel',       icon: '⛽', color: '#22c55e' },
  Other:      { label: 'Other',      icon: '📊', color: '#94a3b8' },
};

function inferCategory(paramName: string): Category {
  const p = paramName.toLowerCase();
  if (p.includes('engine') || p.includes('motor_temp') || p.includes('traction_motor_temp') || p.includes('transformer_oil')) return 'Engine';
  if (p.includes('hydraulic') || p.includes('oil_pressure') || p.includes('oil_temp')) return 'Hydraulics';
  if (p.includes('voltage') || p.includes('current') || p.includes('electric') || p.includes('battery') || p.includes('catenary') || p.includes('dc_bus') || p.includes('traction_motor_current') || p.includes('regen') || p.includes('power')) return 'Electrical';
  if (p.includes('pressure') || p.includes('brake') || p.includes('reservoir') || p.includes('pneumatic') || p.includes('pipe') || p.includes('cylinder')) return 'Pneumatics';
  if (p.includes('fuel') || p.includes('sand') || p.includes('throttle')) return 'Fuel';
  return 'Other';
}

function inferUnit(paramName: string): string {
  const p = paramName.toLowerCase();
  if (p.includes('temp')) return '°C';
  if (p.includes('pressure') || p.includes('pipe') || p.includes('cylinder') || p.includes('reservoir')) return 'MPa';
  if (p.includes('catenary') || p.includes('dc_bus')) return 'V';
  if (p.includes('battery_voltage')) return 'V';
  if (p.includes('voltage')) return 'V';
  if (p.includes('current') || p.includes('ampere')) return 'A';
  if (p.includes('speed')) return 'km/h';
  if (p.includes('level') || p.includes('percent') || p.includes('throttle') || p.includes('sand')) return '%';
  if (p.includes('force')) return 'kN';
  return '—';
}

/* ── Category summary card ───────────────────────────────── */

function CategoryCard({ cat, count, active }: { cat: Category; count: number; active: number }) {
  const meta = CATEGORY_META[cat];
  return (
    <div className="hp-cat-card">
      <div className="hp-cat-card__icon" style={{ color: meta.color }}>{meta.icon}</div>
      <div className="hp-cat-card__label">{meta.label}</div>
      <div className="hp-cat-card__count">{count}</div>
      <div className="hp-cat-card__active">{active} active</div>
    </div>
  );
}

/* ── Add / Edit form ─────────────────────────────────────── */

const EMPTY_FORM: UpsertHealthParamWeightRequest = {
  paramName: '',
  displayName: '',
  weight: 1,
  penaltyMultiplier: 1.5,
  warningThreshold: 0.5,
  criticalThreshold: 0.8,
  applicableTo: 'BOTH',
};

interface ParamFormProps {
  initial?: UpsertHealthParamWeightRequest;
  onSave: (req: UpsertHealthParamWeightRequest) => Promise<void>;
  onCancel: () => void;
}

function ParamForm({ initial, onSave, onCancel }: ParamFormProps) {
  const [form, setForm] = useState<UpsertHealthParamWeightRequest>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof UpsertHealthParamWeightRequest, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.paramName || !form.displayName) { setErr('paramName and displayName are required'); return; }
    setSaving(true); setErr('');
    try {
      await onSave({ ...form, weight: Number(form.weight), penaltyMultiplier: Number(form.penaltyMultiplier), warningThreshold: Number(form.warningThreshold), criticalThreshold: Number(form.criticalThreshold) });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  }

  return (
    <form className="hp-form admin-card" onSubmit={handleSubmit}>
      <div className="hp-form__title">{initial ? 'Edit Parameter' : 'Add New Parameter'}</div>
      <div className="hp-form__grid">
        <label className="form-label">
          System name (paramName)
          <input className="form-input" value={form.paramName} onChange={e => set('paramName', e.target.value)} placeholder="e.g. engine_temperature" required />
        </label>
        <label className="form-label">
          Display name
          <input className="form-input" value={form.displayName} onChange={e => set('displayName', e.target.value)} placeholder="e.g. Engine Temperature" required />
        </label>
        <label className="form-label">
          Weight
          <input className="form-input" type="number" step="0.01" value={form.weight} onChange={e => set('weight', e.target.value)} />
        </label>
        <label className="form-label">
          Penalty multiplier
          <input className="form-input" type="number" step="0.01" value={form.penaltyMultiplier ?? ''} onChange={e => set('penaltyMultiplier', e.target.value)} />
        </label>
        <label className="form-label">
          Warning threshold
          <input className="form-input" type="number" step="0.01" value={form.warningThreshold ?? ''} onChange={e => set('warningThreshold', e.target.value)} />
        </label>
        <label className="form-label">
          Critical threshold
          <input className="form-input" type="number" step="0.01" value={form.criticalThreshold ?? ''} onChange={e => set('criticalThreshold', e.target.value)} />
        </label>
        <label className="form-label">
          Applicable to
          <select className="form-select" value={form.applicableTo ?? 'BOTH'} onChange={e => set('applicableTo', e.target.value as UpsertHealthParamWeightRequest['applicableTo'])}>
            <option value="BOTH">Both (DIESEL + ELECTRIC)</option>
            <option value="DIESEL">Diesel only</option>
            <option value="ELECTRIC">Electric only</option>
          </select>
        </label>
      </div>
      {err && <div className="form-error">{err}</div>}
      <div className="hp-form__actions">
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Parameter'}</button>
        <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function HealthParams() {
  const [params, setParams] = useState<HealthParamWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editParam, setEditParam] = useState<HealthParamWeight | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchHealthParamWeights();
      setParams(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  /* ── Category stats ───────────────────────────────────── */

  const catStats = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const p of params) {
      const c = inferCategory(p.paramName);
      counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
  }, [params]);

  const CATEGORIES: Category[] = ['Engine', 'Hydraulics', 'Electrical', 'Pneumatics', 'Fuel'];

  /* ── Filtered rows ────────────────────────────────────── */

  const filtered = useMemo(() => {
    if (!search.trim()) return params;
    const q = search.toLowerCase();
    return params.filter(p =>
      p.displayName.toLowerCase().includes(q) ||
      p.paramName.toLowerCase().includes(q)
    );
  }, [params, search]);

  /* ── Save (add or edit) ───────────────────────────────── */

  async function handleSave(req: UpsertHealthParamWeightRequest) {
    const saved = await upsertHealthParamWeight(req);
    setParams(prev => {
      const idx = prev.findIndex(p => p.paramName === saved.paramName);
      return idx >= 0 ? prev.map((p, i) => i === idx ? saved : p) : [...prev, saved];
    });
    setShowForm(false);
    setEditParam(null);
  }

  /* ── Delete ───────────────────────────────────────────── */

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteHealthParamWeight(deleteId);
      setParams(prev => prev.filter(p => p.id !== deleteId));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  /* ── Render ───────────────────────────────────────────── */

  return (
    <div>
      {/* Header */}
      <div className="admin-section__header hp-header">
        <div>
          <div className="admin-section__title">⚡ Health Parameters</div>
          <div className="admin-section__desc">Configure parameter weights and thresholds for locomotive health monitoring</div>
        </div>
        <button className="btn-primary hp-add-btn" onClick={() => { setShowForm(true); setEditParam(null); }}>
          + Add Parameter
        </button>
      </div>

      {/* Category summary cards */}
      <div className="hp-cats">
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat}
            cat={cat}
            count={catStats[cat] ?? 0}
            active={catStats[cat] ?? 0}
          />
        ))}
      </div>

      {/* Add/Edit form */}
      {(showForm || editParam) && (
        <ParamForm
          initial={editParam ? {
            paramName:        editParam.paramName,
            displayName:      editParam.displayName,
            weight:           editParam.weight,
            penaltyMultiplier: editParam.penaltyMultiplier,
            warningThreshold: editParam.warningThreshold,
            criticalThreshold: editParam.criticalThreshold,
            applicableTo:     editParam.applicableTo,
          } : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditParam(null); }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="hp-confirm-overlay">
          <div className="hp-confirm admin-card">
            <div className="hp-confirm__title">Delete Parameter?</div>
            <div className="hp-confirm__desc">This will permanently remove this health parameter configuration.</div>
            <div className="hp-confirm__actions">
              <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search + refresh */}
      <div className="hp-toolbar">
        <div className="hp-search-wrap">
          <svg className="hp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            className="hp-search"
            placeholder="Search parameter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary hp-refresh" onClick={load} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="admin-card hp-table-card">
        {loading ? (
          <div className="hp-loading">Loading parameters…</div>
        ) : filtered.length === 0 ? (
          <div className="hp-loading">{search ? 'No parameters match your search.' : 'No parameters configured yet.'}</div>
        ) : (
          <table className="hp-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Weight</th>
                <th>Warning</th>
                <th>Critical</th>
                <th>Models</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cat = inferCategory(p.paramName);
                const meta = CATEGORY_META[cat];
                const unit = inferUnit(p.paramName);
                return (
                  <tr key={p.id} className="hp-row">
                    <td className="hp-cell hp-cell--param">
                      <div className="hp-param-icon" style={{ color: meta.color }}>{meta.icon}</div>
                      <div>
                        <div className="hp-param-name">{p.displayName}</div>
                        <div className="hp-param-key">{p.paramName}</div>
                      </div>
                    </td>
                    <td className="hp-cell">
                      <span className="hp-cat-badge" style={{ background: `${meta.color}22`, color: meta.color, borderColor: `${meta.color}44` }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="hp-cell hp-cell--unit">{unit}</td>
                    <td className="hp-cell hp-cell--num">{p.weight.toFixed(2)}</td>
                    <td className="hp-cell hp-cell--warn">
                      {p.warningThreshold != null
                        ? <span className="hp-threshold hp-threshold--warn">{p.warningThreshold}</span>
                        : '—'}
                    </td>
                    <td className="hp-cell hp-cell--crit">
                      {p.criticalThreshold != null
                        ? <span className="hp-threshold hp-threshold--crit">{p.criticalThreshold}</span>
                        : '—'}
                    </td>
                    <td className="hp-cell">
                      <div className="hp-models">
                        {(p.applicableTo === 'BOTH' ? ['DIESEL', 'ELECTRIC'] : [p.applicableTo ?? 'BOTH']).map(m => (
                          <span key={m} className="hp-model-badge">{m === 'ELECTRIC' ? 'KZ8A' : m}</span>
                        ))}
                      </div>
                    </td>
                    <td className="hp-cell hp-cell--actions">
                      <button
                        className="hp-action-btn hp-action-btn--edit"
                        onClick={() => { setEditParam(p); setShowForm(false); }}
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className="hp-action-btn hp-action-btn--delete"
                        onClick={() => setDeleteId(p.id)}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
