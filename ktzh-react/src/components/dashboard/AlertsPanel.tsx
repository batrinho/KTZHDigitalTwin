import type { Alert } from '../../models/dashboard';
import { useLocale } from '../../context/LocaleContext';

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (alert: Alert) => void;
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  const { t } = useLocale();

  return (
    <div className="panel alerts-panel">
      <div className="alerts-head">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 2L2 13h12L8 2z" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
          <line x1="8" y1="6" x2="8" y2="9" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.8" fill="#94a3b8" />
        </svg>
        <span className="alerts-title">{t('alerts')}</span>
        <span className="alerts-count">{alerts.length}</span>
      </div>

      <div className="alert-list">
        {alerts.length === 0 && (
          <div className="alert-empty">{t('noAlerts')}</div>
        )}
        {alerts.map((a, i) => (
          <div className={`alert-item alert-item--${a.severity}`} key={`${a.timestamp}-${i}`}>
            <div className="alert-item__body">
              <div className="alert-msg">{a.message}</div>
              {a.recommendation && <div className="alert-rec">{a.recommendation}</div>}
              <div className="alert-time">{a.timestamp}</div>
            </div>
            {onDismiss && (
              <button
                className="alert-dismiss"
                onClick={() => onDismiss(a)}
                title="Acknowledge alert"
              >
                <CheckIcon />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
