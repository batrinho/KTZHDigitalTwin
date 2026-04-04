import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocale } from '../context/LocaleContext';
import LogoIcon from './icons/LogoIcon';
import { fmtTime } from '../utils/time';
import './AppHeader.css';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [currentTime, setCurrentTime] = useState(fmtTime);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(fmtTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="app-header">
      <div className="app-header__left">
        <LogoIcon size={34} />
        <div className="app-header__titles">
          <span className="app-header__title">{title}</span>
          {subtitle && <span className="app-header__subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="app-header__right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <span className="app-header__time">{currentTime}</span>

        <div className="locale-toggle-group">
          <button
            className={`locale-btn${locale === 'en' ? ' locale-btn--active' : ''}`}
            onClick={() => setLocale('en')}
          >
            ENG
          </button>
          <span className="locale-sep">/</span>
          <button
            className={`locale-btn${locale === 'ru' ? ' locale-btn--active' : ''}`}
            onClick={() => setLocale('ru')}
          >
            RUS
          </button>
        </div>
      </div>
    </header>
  );
}
