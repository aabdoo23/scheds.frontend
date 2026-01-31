import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { AuthButton } from './AuthButton';
import { NAV_ITEMS, EXTERNAL_LINKS } from './navConfig';

const linkBase =
  'inline-flex items-center min-h-[44px] no-underline text-[var(--light-text)] text-base font-semibold px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--lighter)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';
const linkActive = 'bg-[var(--lighter)]';
const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)]';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled])';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      const focusable = Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, closeMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const focusable = overlay.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.focus();
  }, [mobileOpen]);

  return (
    <>
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] flex justify-between items-center px-4 md:px-8 py-2 pt-[env(safe-area-inset-top,0px)] h-[var(--navbar-height)] bg-[var(--dark)] box-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link to="/" className="flex items-center min-h-[44px] gap-2 md:gap-4 shrink-0">
        <img
          src="/images/logo-new.png"
          alt="Scheds Logo"
          className="h-9 md:h-[45px] w-auto"
        />
        <div className="flex flex-col">
          <h1 className="m-0 text-xl md:text-2xl font-semibold text-[var(--light-text)]">
            SCHEDS
          </h1>
          <span className="text-[0.65rem] md:text-[0.7rem] text-[var(--dark-text)] italic hidden sm:inline">
            an aabdoo23 project
          </span>
        </div>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3 min-h-[44px]">
        <ThemeToggle />
        <ul className="flex items-center gap-1 m-0 p-0 list-none">
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          {EXTERNAL_LINKS.map(({ href, label, icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-[var(--light-text)] rounded-lg transition-colors duration-200 hover:bg-[var(--lighter)] ${focusRing}`}
              >
                <i className={`${icon.startsWith('fab') ? icon : `fas ${icon}`} text-xl`} />
              </a>
            </li>
          ))}
          <li className="flex items-center">
            <AuthButton />
          </li>
        </ul>
      </div>

      {/* Mobile: ThemeToggle + username + hamburger */}
      <div className="flex md:hidden items-center gap-2">
        <ThemeToggle />
        <AuthButton nameOnly />
        <button
          ref={hamburgerRef}
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className={`flex items-center justify-center p-2 min-w-[44px] min-h-[44px] -m-2 text-[var(--light-text)] rounded-lg transition-colors duration-200 hover:bg-[var(--lighter)] ${focusRing}`}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} text-xl`} />
        </button>
      </div>
    </nav>

      {/* Mobile menu overlay */}
      <div
        ref={overlayRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[999] md:hidden pt-[var(--navbar-height)] bg-[var(--dark)]/95 backdrop-blur-sm transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 pointer-events-none invisible'
        }`}
        onClick={() => {
          closeMenu();
          hamburgerRef.current?.focus();
        }}
      >
        <div
          className="flex flex-col gap-1 p-4 overflow-y-auto max-h-[calc(100vh-var(--navbar-height))]"
          onClick={(e) => e.stopPropagation()}
        >
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                closeMenu();
                hamburgerRef.current?.focus();
              }}
              className={({ isActive }) =>
                `block py-3 px-4 rounded-lg text-[var(--light-text)] font-semibold text-lg transition-colors duration-200 ${
                  isActive ? 'bg-[var(--lighter)]' : 'hover:bg-[var(--lighter)]'
                } ${focusRing}`
              }
            >
              {label}
            </NavLink>
          ))}
          {EXTERNAL_LINKS.map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              onClick={() => {
                closeMenu();
                hamburgerRef.current?.focus();
              }}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg text-[var(--light-text)] font-semibold text-lg transition-colors duration-200 hover:bg-[var(--lighter)] ${focusRing}`}
            >
              <i className={`${icon.startsWith('fab') ? icon : `fas ${icon}`} text-xl w-6`} />
              {label}
            </a>
          ))}
          <div onClick={() => { closeMenu(); hamburgerRef.current?.focus(); }}>
            <AuthButton menuItem />
          </div>
        </div>
      </div>
    </>
  );
}
