import { useState, useEffect, useRef } from 'react';
import {
  fetchLocomotives,
  createLocomotive,
  updateLocomotive,
  deleteLocomotive,
} from '../../api/locomotives';
import type {
  Locomotive,
  LocomotiveType,
  LocomotiveStatus,
} from '../../models/locomotive';
import { useLocale } from '../../context/LocaleContext';
import '../AdminPage.css';
import './FleetManagement.css';

/* ── Icons ──────────────────────────────────────── */
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <polyline points="21 8 21 21 3 21 3 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="1" y="3" width="22" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Helpers ─────────────────────────────────────── */
const UI_STATUS_FOR_API: Record<LocomotiveStatus, string> = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  DECOMMISSIONED: 'REMOVED',
};

function fmtType(type: LocomotiveType) {
  return type === 'ELECTRIC' ? 'Electric' : 'Diesel';
}

function StatusBadge({ status }: { status: LocomotiveStatus }) {
  const label = UI_STATUS_FOR_API[status] ?? status;
  return <span className={`fleet-badge fleet-badge--${status.toLowerCase()}`}>{label}</span>;
}

/* ── Edit Modal ──────────────────────────────────── */
interface EditModalProps {
  loco: Locomotive;
  onClose: () => void;
  onSaved: (updated: Locomotive) => void;
}

function EditModal({ loco, onClose, onSaved }: EditModalProps) {
  const { t } = useLocale();
  const [code, setCode] = useState(loco.code);
  const [type, setType] = useState<LocomotiveType>(loco.type);
  const [date, setDate] = useState(loco.manufacturedAt);
  const [status, setStatus] = useState<LocomotiveStatus>(loco.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!code.trim() || !date) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateLocomotive(loco.id, {
        code: code.trim(),
        type,
        status,
        manufacturedAt: date,
      });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__title">{t('editLocomotive')}</div>
            <div className="modal__subtitle">{loco.code}</div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <label className="form-label">
            {t('boardNumber')}
            <input
              className="form-input"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </label>

          <label className="form-label">
            {t('typeCol')}
            <select
              className="form-select"
              value={type}
              onChange={e => setType(e.target.value as LocomotiveType)}
            >
              <option value="ELECTRIC">{t('electric')}</option>
              <option value="DIESEL">{t('diesel')}</option>
            </select>
          </label>

          <label className="form-label">
            {t('productionDate')}
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </label>

          <div className="form-label">
            {t('statusCol')}
            <div className="status-toggle-group">
              {(['ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED'] as LocomotiveStatus[]).map(s => (
                <button
                  key={s}
                  className={`status-toggle-btn status-toggle-btn--${s.toLowerCase()}${status === s ? ' status-toggle-btn--selected' : ''}`}
                  onClick={() => setStatus(s)}
                >
                  {UI_STATUS_FOR_API[s]}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal__footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            {t('cancel')}
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '...' : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────── */
export default function FleetManagement() {
  const { t } = useLocale();
  const [locos, setLocos] = useState<Locomotive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | LocomotiveType>('');
  const [showAdd, setShowAdd] = useState(false);
  const [editLoco, setEditLoco] = useState<Locomotive | null>(null);

  // Add form state
  const [addCode, setAddCode] = useState('');
  const [addType, setAddType] = useState<LocomotiveType>('ELECTRIC');
  const [addDate, setAddDate] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState('');

  const addCodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLocomotives()
      .then(setLocos)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showAdd) addCodeRef.current?.focus();
  }, [showAdd]);

  const filtered = locos.filter(l => {
    const matchSearch = l.code.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === '' || l.type === typeFilter;
    return matchSearch && matchType;
  });

  async function handleAdd() {
    if (!addCode.trim() || !addDate) { setAddError('Fill in all fields'); return; }
    setAddSaving(true);
    setAddError('');
    try {
      const created = await createLocomotive({
        code: addCode.trim(),
        model: addCode.trim(),
        type: addType,
        status: 'ACTIVE',
        manufacturedAt: addDate,
      });
      setLocos(prev => [created, ...prev]);
      setShowAdd(false);
      setAddCode('');
      setAddDate('');
      setAddType('ELECTRIC');
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setAddSaving(false);
    }
  }

  async function handleDelete(loco: Locomotive) {
    if (!window.confirm(`Remove locomotive ${loco.code}?`)) return;
    try {
      await deleteLocomotive(loco.id);
      setLocos(prev => prev.filter(l => l.id !== loco.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  function handleSaved(updated: Locomotive) {
    setLocos(prev => prev.map(l => l.id === updated.id ? updated : l));
    setEditLoco(null);
  }

  return (
    <div>
      <div className="admin-section__header">
        <div className="admin-section__title">{t('fleetManagement')}</div>
        <div className="admin-section__desc">{t('fleetManagementDesc')}</div>
      </div>

      {/* Toolbar */}
      <div className="fleet-toolbar">
        <div className="fleet-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="fleet-search__icon">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            className="fleet-search__input"
            placeholder={t('searchLocomotive')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="fleet-filter">
          <select
            className="form-select fleet-type-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as '' | LocomotiveType)}
          >
            <option value="">{t('typeCol')}</option>
            <option value="ELECTRIC">{t('electric')}</option>
            <option value="DIESEL">{t('diesel')}</option>
          </select>
          <div className="fleet-filter__chevron"><ChevronIcon /></div>
        </div>

        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>
          {t('addLocomotive')}
        </button>
      </div>

      {/* Table */}
      <div className="admin-card fleet-table-card">
        {loading && <div className="fleet-status">{t('loading')}…</div>}
        {error && <div className="fleet-status fleet-status--error">{error}</div>}

        {!loading && (
          <table className="fleet-table">
            <thead>
              <tr>
                <th>{t('boardNumber')}</th>
                <th>{t('typeCol')}</th>
                <th>{t('productionDate')}</th>
                <th>{t('statusCol')}</th>
                <th>{t('actionsCol')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(loco => (
                <tr key={loco.id}>
                  <td className="fleet-table__code">{loco.code}</td>
                  <td>{fmtType(loco.type)}</td>
                  <td className="fleet-table__date">{loco.manufacturedAt}</td>
                  <td><StatusBadge status={loco.status} /></td>
                  <td>
                    <div className="fleet-actions">
                      <button
                        className="fleet-action-btn"
                        title="Edit"
                        onClick={() => setEditLoco(loco)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="fleet-action-btn fleet-action-btn--danger"
                        title="Remove"
                        onClick={() => handleDelete(loco)}
                      >
                        <ArchiveIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="fleet-empty">No locomotives found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="admin-card add-form">
          <div className="add-form__title">{t('addNewLocomotive')}</div>
          <div className="add-form__fields">
            <label className="form-label">
              {t('boardNumber')}
              <input
                ref={addCodeRef}
                className="form-input"
                placeholder="KZ8A-0000"
                value={addCode}
                onChange={e => setAddCode(e.target.value)}
              />
            </label>

            <div className="fleet-filter" style={{ position: 'relative' }}>
              <label className="form-label" style={{ width: '100%' }}>
                {t('typeCol')}
                <select
                  className="form-select"
                  value={addType}
                  onChange={e => setAddType(e.target.value as LocomotiveType)}
                >
                  <option value="ELECTRIC">{t('electric')}</option>
                  <option value="DIESEL">{t('diesel')}</option>
                </select>
              </label>
            </div>

            <label className="form-label">
              {t('productionDate')}
              <input
                className="form-input"
                type="date"
                placeholder="Date"
                value={addDate}
                onChange={e => setAddDate(e.target.value)}
              />
            </label>
          </div>

          {addError && <div className="form-error">{addError}</div>}

          <div className="add-form__actions">
            <button className="btn-primary" onClick={handleAdd} disabled={addSaving}>
              {addSaving ? '...' : t('save')}
            </button>
            <button className="btn-secondary" onClick={() => { setShowAdd(false); setAddError(''); }}>
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editLoco && (
        <EditModal
          loco={editLoco}
          onClose={() => setEditLoco(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
