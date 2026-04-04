import TrainIcon from '../icons/TrainIcon';
import WifiIcon from '../icons/WifiIcon';
import { useLocale } from '../../context/LocaleContext';

interface TopBarProps {
  locomotiveId: string;
  routeFrom: string;
  routeTo: string;
}

export default function TopBar({ locomotiveId, routeFrom, routeTo }: TopBarProps) {
  const { t } = useLocale();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <TrainIcon className="topbar__train" />
        <div>
          <span className="topbar__loco">
            {t('locomotive')} <strong>{locomotiveId}</strong>
          </span>
          <span className="topbar__route">
            {t('routeLabel')} {routeFrom} &rarr; {routeTo}
          </span>
        </div>
      </div>

      <div className="topbar__right">
        <span className="live-pill">
          <WifiIcon />
          LIVE
          <span className="live-dot" />
        </span>
      </div>
    </header>
  );
}
