import { useEffect, useState } from 'react';
import { API_BASE, fetchWithCredentials } from '@/lib/api';

interface AuthState {
  name: string | null;
  loading: boolean;
}

interface AuthButtonProps {
  menuItem?: boolean;
  nameOnly?: boolean;
}

export function AuthButton({ menuItem = false, nameOnly = false }: AuthButtonProps = {}) {
  const [auth, setAuth] = useState<AuthState>({ name: null, loading: true });

  useEffect(() => {
    fetchWithCredentials('/api/account/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAuth({ name: data?.name ?? null, loading: false }))
      .catch(() => setAuth({ name: null, loading: false }));
  }, []);

  const handleLogout = async () => {
    await fetchWithCredentials('/Account/Logout', { method: 'POST' });
    setAuth({ name: null, loading: false });
    window.location.href = '/';
  };

  const menuClass =
    'block w-full py-3 px-4 rounded-lg text-[var(--light-text)] font-semibold text-lg text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';

  if (auth.loading) {
    if (menuItem) {
      return (
        <div
          className="h-12 rounded-lg bg-[var(--lighter)] animate-pulse"
          aria-hidden="true"
        />
      );
    }
    if (nameOnly) {
      return (
        <div
          className="min-h-[44px] w-24 rounded bg-[var(--lighter)] animate-pulse shrink-0"
          aria-hidden="true"
        />
      );
    }
    return (
      <div
        className="min-h-[44px] min-w-[120px] rounded-lg bg-[var(--lighter)] animate-pulse"
        aria-hidden="true"
      />
    );
  }

  if (nameOnly && !auth.name) {
    return null;
  }

  if (auth.name) {
    if (menuItem) {
      return (
        <button
          type="button"
          onClick={handleLogout}
          className={`${menuClass} hover:bg-[var(--lighter)]`}
        >
          Logout
        </button>
      );
    }
    if (nameOnly) {
      const first = auth.name.split(' ')[0];
      const display = first.length > 12 ? first.slice(0, 10) + '…' : first;
      return (
        <span className="inline-flex items-center min-h-[44px] text-[var(--light-text)] font-semibold text-[0.95rem] shrink-0 max-w-[120px] truncate">
          Hello, {display}
        </span>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 min-h-[44px]">
        <span className="text-[var(--light-text)] font-semibold text-[0.95rem] leading-none">
          Hello, {auth.name.split(' ')[0].length > 12 ? auth.name.split(' ')[0].slice(0, 10) + '…' : auth.name.split(' ')[0]}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center m-0 px-3 py-1.5 rounded-lg font-semibold text-white bg-[var(--btn-danger)] border border-[var(--btn-danger)] transition-colors duration-200 hover:bg-[var(--btn-danger-hover)] hover:border-[var(--btn-danger-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]"
        >
          Logout
        </button>
      </div>
    );
  }

  const loginHref = `${API_BASE}/Account/Login?returnUrl=${encodeURIComponent(window.location.origin + '/')}`;

  if (menuItem) {
    return (
      <a
        href={loginHref}
        className={`${menuClass} hover:bg-[var(--lighter)]`}
        title="Sign in with Google"
      >
        Sign in with Google
      </a>
    );
  }

  return (
    <a
      href={loginHref}
      className="inline-flex items-center min-h-[44px] gap-2 px-3 py-1.5 rounded-lg font-semibold text-white bg-[var(--btn-primary)] shadow-[0_8px_20px_rgba(43,111,216,0.18)] transition-colors duration-200 hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]"
      title="Sign in with Google"
    >
      Sign in with Google
    </a>
  );
}
