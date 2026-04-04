import { useState, useEffect } from 'react';
import TrainIcon from '../icons/TrainIcon';
import WifiIcon from '../icons/WifiIcon';
import { fmtTime } from '../../utils/time';

interface TopBarProps {
  locomotiveId: string;
  routeFrom: string;
  routeTo: string;
}

export default function TopBar({ locomotiveId, routeFrom, routeTo }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(fmtTime);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(fmtTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <TrainIcon className="topbar__train" />
        <div>
          <span className="topbar__loco">Locomotive <strong>{locomotiveId}</strong></span>
          <span className="topbar__route">Route: {routeFrom} &rarr; {routeTo}</span>
        </div>
      </div>

      <div className="topbar__right">
        <span className="live-pill">
          <WifiIcon />
          LIVE
          <span className="live-dot" />
        </span>
        <span className="topbar__icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.9 3.9l1.4 1.4M14.7 14.7l1.4 1.4M16.1 3.9l-1.4 1.4M5.3 14.7l-1.4 1.4" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="topbar__time">{currentTime}</span>
      </div>
    </header>
  );
}
