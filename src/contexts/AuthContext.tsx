import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { googleLogout } from '@react-oauth/google';
import { API_BASE } from '@/lib/api';

const TOKEN_KEY = 'scheds_token';

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
    sessionStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((value: string | null) => {
    setTokenState(value);
    if (value) {
      sessionStorage.setItem(TOKEN_KEY, value);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    }
  }, [setToken]);

  const handleGoogleSuccess = useCallback(
    async (credential: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: credential }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setToken(data.accessToken);
        await fetchUser();
      } catch {
        setToken(null);
      }
    },
    [setToken, fetchUser]
  );

  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser();
  }, [token, fetchUser]);

  const logout = useCallback(() => {
    googleLogout();
    setToken(null);
    setUser(null);
  }, [setToken]);

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
