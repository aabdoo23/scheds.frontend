import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const { user, loading } = useAuthContext();
  return { isAuthenticated: user !== null, loading };
}
