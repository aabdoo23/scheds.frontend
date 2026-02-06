import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '@/contexts/AuthContext';

interface AuthButtonProps {
  menuItem?: boolean;
  nameOnly?: boolean;
}

export function AuthButton({ menuItem = false, nameOnly = false }: AuthButtonProps = {}) {
  const { user, loading, handleGoogleSuccess, logout } = useAuthContext();
  const name = user?.name ?? null;

  const menuClass =
    'block w-full py-3 px-4 rounded-lg text-[var(--light-text)] font-semibold text-lg text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';

  if (loading) {
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

  if (nameOnly && !name) {
    return null;
  }

  if (name) {
    if (menuItem) {
      return (
        <button
          type="button"
          onClick={logout}
          className={`${menuClass} hover:bg-[var(--lighter)]`}
        >
          Logout
        </button>
      );
    }
    if (nameOnly) {
      const first = name.split(' ')[0];
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
          Hello, {name.split(' ')[0].length > 12 ? name.split(' ')[0].slice(0, 10) + '…' : name.split(' ')[0]}
        </span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center m-0 px-3 py-1.5 rounded-lg font-semibold text-white bg-[var(--btn-danger)] border border-[var(--btn-danger)] transition-colors duration-200 hover:bg-[var(--btn-danger-hover)] hover:border-[var(--btn-danger-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]"
        >
          Logout
        </button>
      </div>
    );
  }

  const onSuccess = (res: { credential?: string }) => {
    if (res.credential) handleGoogleSuccess(res.credential);
  };

  if (menuItem) {
    return (
      <div className={menuClass}>
        <GoogleLogin
          onSuccess={onSuccess}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      theme="filled_blue"
      size="large"
      text="signin_with"
      shape="rectangular"
    />
  );
}
