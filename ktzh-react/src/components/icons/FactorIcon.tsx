import type { HealthFactor } from '../../models/dashboard';

interface FactorIconProps {
  icon: HealthFactor['icon'];
}

export default function FactorIcon({ icon }: FactorIconProps) {
  switch (icon) {
    case 'temp':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 10c0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.2-.5-2.3-1.3-3l-.7-.6V3a2 2 0 00-4 0v3.4l-.7.6C4.5 7.7 4 8.8 4 10z" stroke="#eab308" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case 'brake':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 2L2 13h12L8 2z" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          <line x1="8" y1="6" x2="8" y2="9" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.8" fill="#f59e0b" />
        </svg>
      );
    case 'electrical':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M9 1L4 9h4l-1 6 6-8H9l1-6z" stroke="#60a5fa" strokeWidth="1.2" fill="none" />
        </svg>
      );
  }
}
