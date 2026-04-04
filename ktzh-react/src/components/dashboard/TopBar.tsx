import TrainIcon from '../icons/TrainIcon';
import WifiIcon from '../icons/WifiIcon';
import { useLocale } from '../../context/LocaleContext';

interface TopBarProps {
  locomotiveId: string;
  locomotiveType: string | null;
  routeId: string | null;
  connected: boolean;
}

export default function TopBar({ locomotiveId, locomotiveType, routeId, connected }: TopBarProps) {
  const { t } = useLocale();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <TrainIcon className="topbar__train" />
        <div>
          <span className="topbar__loco">
            {t('locomotive')} <strong>{locomotiveId}</strong>
            {locomotiveType && (
              <span className="topbar__loco-type"> ({locomotiveType})</span>
            )}
          </span>
          {routeId && (
            <span className="topbar__route">
              {t('routeLabel')} {routeId}
            </span>
          )}
        </div>
      </div>

      <div className="topbar__right">
        <span className={`live-pill${connected ? '' : ' live-pill--off'}`}>
          <WifiIcon />
          {connected ? 'LIVE' : 'OFFLINE'}
          <span className={connected ? 'live-dot' : 'live-dot live-dot--off'} />
        </span>
      </div>
    </header>
  );
}
