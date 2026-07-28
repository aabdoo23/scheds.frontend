import { useState, useRef, useEffect, useCallback } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { courseColor, formatClock } from '@/lib/scheduleView';
import { parseTimeToMinutes } from '@/lib/scheduleUtils';

interface CourseBlockProps {
  item: ScheduleCardItem;
}

const POPOVER_W = 264;
const POPOVER_H = 210;
const MARGIN = 8;

export function CourseBlock({ item }: CourseBlockProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const color = courseColor(item.courseCode);

  const start = parseTimeToMinutes(item.startTime);
  const end = parseTimeToMinutes(item.endTime);
  const compact = end - start < 75; // ~1-hour slots: no room for a bottom bar → left color band
  const sectionLabel = `${item.subType} ${item.section}`.trim();
  const typeAbbr = item.subType ? item.subType.slice(0, 3).toUpperCase() : '';

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.min(Math.max(MARGIN, r.left), window.innerWidth - POPOVER_W - MARGIN);
    const fitsBelow = r.bottom + 6 + POPOVER_H + MARGIN <= window.innerHeight;
    const top = fitsBelow ? r.bottom + 6 : Math.max(MARGIN, r.top - POPOVER_H - 6);
    setPos({ left, top });
  }, []);

  const toggle = useCallback(() => {
    setOpen((o) => {
      if (!o) place();
      return !o;
    });
  }, [place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (btnRef.current?.contains(t) || t.closest('[data-course-popover]')) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const dismiss = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={`${item.courseCode} ${item.courseName}, ${item.subType} ${item.section}, ${formatClock(start)} to ${formatClock(end)}. Show details.`}
        className={`w-full h-full rounded-lg overflow-hidden flex text-left cursor-pointer bg-[var(--lighter)] border border-white/10 shadow transition-shadow duration-150 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--lighter-dark)] ${
          compact ? 'items-stretch' : 'flex-col'
        }`}
      >
        {compact ? (
          <>
            {/* short slot , the colored section becomes a labeled vertical band on the left */}
            <span
              className="shrink-0 w-9 flex flex-col items-center justify-center gap-0.5 px-1 leading-none text-center"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {typeAbbr && (
                <span className="text-[10px] font-bold uppercase tracking-wide">{typeAbbr}</span>
              )}
              {item.section && (
                <span className="text-xs font-bold tabular-nums">{item.section}</span>
              )}
            </span>
            <span className="flex-1 min-w-0 px-2 py-1 flex flex-col justify-center gap-0.5 overflow-hidden">
              <span className="font-bold text-[15px] leading-tight text-[var(--light-text)] truncate">
                {item.courseCode}
              </span>
              {item.courseName && (
                <span className="text-xs leading-tight text-[var(--dark-text)] truncate">
                  {item.courseName}
                </span>
              )}
            </span>
          </>
        ) : (
          <>
            <span className="flex-1 min-h-0 px-2.5 py-2 flex flex-col gap-0.5 overflow-hidden">
              <span className="font-bold text-[15px] leading-tight text-[var(--light-text)] truncate">
                {item.courseCode}
              </span>
              <span className="text-[13px] leading-snug text-[var(--light-text)] line-clamp-2">
                {item.courseName}
              </span>
              <span className="text-xs leading-tight text-[var(--dark-text)] truncate">
                {item.instructorName}
              </span>
            </span>
            <span
              className="shrink-0 px-2 py-2 text-[13px] font-bold leading-none text-center truncate"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {sectionLabel}
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          data-course-popover
          role="dialog"
          aria-label={`${item.courseCode} details`}
          className="fixed z-50 w-[264px] rounded-xl bg-[var(--lighter)] border border-white/15 shadow-lg p-4 text-sm text-[var(--light-text)]"
          style={{ left: pos.left, top: pos.top }}
        >
          <div className="flex items-start gap-2.5 mb-3">
            <span
              className="mt-1 w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color.bg }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className="font-bold leading-tight">{item.courseCode}</div>
              <div className="text-[var(--dark-text)] text-xs leading-snug">{item.courseName}</div>
            </div>
          </div>
          <dl className="flex flex-col gap-1.5 text-xs m-0">
            <PopRow label="Section" value={`${item.subType} ${item.section}`.trim() || ','} />
            <PopRow
              label="Time"
              value={
                item.day
                  ? `${item.day}, ${formatClock(start)} – ${formatClock(end)}`
                  : 'Not scheduled'
              }
            />
            <PopRow label="Room" value={item.room || ','} />
            <PopRow label="Instructor" value={item.instructorName || ','} />
            <PopRow label="Seats left" value={String(item.seatsLeft)} />
            <PopRow label="Credits" value={`${item.credits} CH`} />
          </dl>
        </div>
      )}
    </>
  );
}

function PopRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--dark-text)] shrink-0">{label}</dt>
      <dd className="m-0 text-right font-medium min-w-0 break-words">{value}</dd>
    </div>
  );
}
