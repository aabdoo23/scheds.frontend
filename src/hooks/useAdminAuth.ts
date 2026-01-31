import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchWithCredentials } from '@/lib/api';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithCredentials('/api/admin/me');
      const ok = res.ok;
      setIsAuthenticated(ok);
      return ok;
    } catch {
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isLoginPage = location.pathname === '/admin/login';
    checkAuth().then((ok) => {
      if (isLoginPage && ok) {
        navigate('/admin', { replace: true });
      } else if (!isLoginPage && !ok) {
        navigate('/admin/login', { replace: true });
      }
    });
  }, [location.pathname, checkAuth, navigate]);

  const login = useCallback(async (password: string) => {
    const res = await fetchWithCredentials('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await fetchWithCredentials('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return { isAuthenticated, loading, login, logout, checkAuth };
}
