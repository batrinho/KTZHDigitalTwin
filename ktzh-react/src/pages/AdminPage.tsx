import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import FleetManagement from './admin/FleetManagement';
import AlertThresholds from './admin/AlertThresholds';
import HealthParams from './admin/HealthParams';
import SystemDiagnostics from './admin/SystemDiagnostics';
import { useLocale } from '../context/LocaleContext';
import './AdminPage.css';

type AdminSection = 'fleet' | 'thresholds' | 'healthParams' | 'diagnostics';

function FleetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ThresholdsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HealthParamsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiagnosticsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 9l3 3 3-4 3 5 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SECTIONS: { id: AdminSection; labelKey: string; icon: React.ReactNode }[] = [
  { id: 'fleet',        labelKey: 'fleetManagement',   icon: <FleetIcon /> },
  { id: 'thresholds',   labelKey: 'alertThresholds',    icon: <ThresholdsIcon /> },
  { id: 'healthParams', labelKey: 'healthParams',       icon: <HealthParamsIcon /> },
  { id: 'diagnostics',  labelKey: 'systemDiagnostics',  icon: <DiagnosticsIcon /> },
];

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>('fleet');
  const { t } = useLocale();

  return (
    <div className="page">
      <AppHeader title={t('administration')} />

      <div className="admin-layout">
        <nav className="admin-nav">
          <span className="admin-nav__heading">NAVIGATION</span>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`admin-nav__item${section === s.id ? ' admin-nav__item--active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              {s.icon}
              <span>{t(s.labelKey)}</span>
            </button>
          ))}
        </nav>

        <main className="admin-content">
          {section === 'fleet'        && <FleetManagement />}
          {section === 'thresholds'   && <AlertThresholds />}
          {section === 'healthParams' && <HealthParams />}
          {section === 'diagnostics'  && <SystemDiagnostics />}
        </main>
      </div>
    </div>
  );
}
