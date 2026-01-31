import { useState, useRef, useEffect, useId } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  label?: string;
}

export function Tooltip({ content, children, label = 'More information' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !tooltipRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (!next || (!buttonRef.current?.contains(next) && !tooltipRef.current?.contains(next))) {
            setOpen(false);
          }
        }}
        className="p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lighter-dark)]"
      >
        {children}
      </button>
      {open && (
        <div
          ref={tooltipRef}
          id={id}
          role="tooltip"
          className="absolute z-[1000] w-[250px] max-w-[min(250px,calc(100vw-2rem))] p-3 bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-lg bg-[var(--dark)] text-[var(--light-text)] text-[0.85rem] shadow-lg border border-white/10"
        >
          {content}
        </div>
      )}
    </div>
  );
}
