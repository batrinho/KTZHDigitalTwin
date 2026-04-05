import RouteCard from '../components/RouteCard';
import AppHeader from '../components/AppHeader';
import { useRoutes } from '../hooks/useRoutes';
import { useLocale } from '../context/LocaleContext';
import './RoutesPage.css';

export default function RoutesPage() {
  const { t } = useLocale();
  const { routes, routeDefs, loading, error } = useRoutes();

  return (
    <div className="page">
      <AppHeader
        title={t('routes')}
        subtitle={`${routes.length} ${t('activeRoutes')}`}
      />

      {loading && routes.length === 0 && (
        <div className="page-status">{t('loading')}...</div>
      )}

      {error && routes.length === 0 && (
        <div className="page-status page-status--error">{error}</div>
      )}

      <div className="route-list">
        {routes.map(route => {
          const def = routeDefs.find(d => d.routeId === route.routeId) ?? null;
          return (
            <RouteCard
              key={route.locomotiveId}
              route={route}
              totalKm={def?.totalKm ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
