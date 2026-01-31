import { useTheme } from '@/hooks/useTheme';

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';

const baseClass =
  'flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-lg text-[var(--light-text)] transition-colors duration-200 hover:bg-[var(--lighter)]';

export function ThemeToggle() {
  const { isLight, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`${baseClass} ${focusRing}`}
    >
      {isLight ? (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6" aria-hidden>
          <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6" aria-hidden>
          <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8z" />
        </svg>
      )}
    </button>
  );
}
