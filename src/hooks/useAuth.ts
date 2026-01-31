import { useEffect, useState } from 'react';
import { fetchWithCredentials } from '@/lib/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithCredentials('/api/account/me')
      .then((res) => res.ok)
      .then(setIsAuthenticated)
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  return { isAuthenticated, loading };
}
