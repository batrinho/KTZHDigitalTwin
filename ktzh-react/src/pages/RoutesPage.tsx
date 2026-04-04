import RouteCard from '../components/RouteCard';
import AppHeader from '../components/AppHeader';
import { ROUTES } from '../data/routes';
import { useLocale } from '../context/LocaleContext';
import './RoutesPage.css';

export default function RoutesPage() {
  const { t } = useLocale();

  return (
    <div className="page">
      <AppHeader
        title={t('routes')}
        subtitle={`${ROUTES.length} ${t('activeRoutes')}`}
      />

      <div className="route-list">
        {ROUTES.map(route => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
