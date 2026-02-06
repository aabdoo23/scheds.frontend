import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { googleLogout } from '@react-oauth/google';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  addListener,
} from '@/lib/authStorage';
import { API_BASE, fetchWithCredentials } from '@/lib/api';

interface AuthState {
  token: string | null;
  user: { name: string } | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  handleGoogleSuccess: (credential: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    getAccessToken()
  );
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }
    const res = await fetchWithCredentials('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    } else {
      setUser(null);
      if (!getAccessToken()) setTokenState(null);
    }
  }, []);

  const handleGoogleSuccess = useCallback(
    async (credential: string) => {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      await fetchUser();
    },
    [fetchUser]
  );

  useEffect(() => {
    return addListener(() => {
      const next = getAccessToken();
      setTokenState(next);
      if (!next) setUser(null);
    });
  }, []);

  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (access) {
      fetchUser().finally(() => setLoading(false));
    } else if (refresh) {
      fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
        credentials: 'include',
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => {
          setTokens(data.accessToken);
          return fetchUser();
        })
        .catch(() => setTokenState(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const refreshUser = useCallback(async () => {
    if (getAccessToken()) await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    googleLogout();
    clearTokens();
    setTokenState(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    loading,
    handleGoogleSuccess,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
