import { useState, useEffect, useRef } from 'react';
import { fetchRoutes } from '../api/routes';
import type { ApiRoute } from '../models/api';

const POLL_INTERVAL = 5000;

export function useRoutes() {
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const data = await fetchRoutes();
        if (mountedRef.current) {
          setRoutes(data);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        if (mountedRef.current) {
          setError(e instanceof Error ? e.message : 'Failed to fetch routes');
          setLoading(false);
        }
      }
      if (mountedRef.current) {
        timer = setTimeout(poll, POLL_INTERVAL);
      }
    }

    poll();

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  return { routes, loading, error };
}
