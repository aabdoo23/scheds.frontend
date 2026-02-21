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
      <i className={`fas ${isLight ? 'fa-moon' : 'fa-sun'} text-xl`} aria-hidden />
    </button>
  );
}
