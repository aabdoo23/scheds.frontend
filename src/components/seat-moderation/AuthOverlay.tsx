import { API_BASE } from '@/lib/api';

export function AuthOverlay() {
  const loginHref = `${API_BASE}/Account/Login?returnUrl=${encodeURIComponent(window.location.origin + '/seat-moderation')}`;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-[var(--lighter-dark)] p-10 rounded-xl text-center max-w-[400px] border border-white/10">
        <i className="fas fa-lock text-5xl text-[#dc3545] mb-5" />
        <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2.5">
          Authentication Required
        </h3>
        <p className="text-[var(--dark-text)] m-0 mb-5">
          Sign in with Google to access seat monitoring
        </p>
        <a
          href={loginHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[#4285f4] no-underline transition-colors hover:bg-[#3367d6]"
        >
          <i className="fab fa-google" />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
