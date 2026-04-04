import RouteCard from '../components/RouteCard';
import WifiIcon from '../components/icons/WifiIcon';
import { ROUTES } from '../data/routes';
import './RoutesPage.css';

export default function RoutesPage() {
  return (
    <div className="page">
      <div className="header">
        <div>
          <h2 className="header__heading">Routes</h2>
          <p className="header__sub">
            <span className="header__count">{ROUTES.length}</span>
            Active routes
          </p>
        </div>
        <div className="live-badge">
          <WifiIcon />
          Live
          <span className="live-dot" />
        </div>
      </div>

      <div className="route-list">
        {ROUTES.map(route => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
