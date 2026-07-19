import { useState } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { CourseBlock } from './CourseBlock';
import {
  DAYS_OF_WEEK,
  DAY_ABBREVS,
  DAY_START_MIN,
  DAY_SPAN_MIN,
  blockPosition,
  groupByDay,
  itemKey,
  formatHourLabel,
} from '@/lib/scheduleView';

const HOUR_PX = 52;
const CANVAS_HEIGHT = Math.round((DAY_SPAN_MIN / 60) * HOUR_PX);
const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 9 AM … 8 PM gridlines

function hourTopPct(h: number): number {
  return ((h * 60 - DAY_START_MIN) / DAY_SPAN_MIN) * 100;
}

function TimeAxis() {
  return (
    <div className="relative" style={{ height: CANVAS_HEIGHT }}>
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute right-2 -translate-y-1/2 text-[0.68rem] text-[var(--dark-text)] tabular-nums"
          style={{ top: `${hourTopPct(h)}%` }}
        >
          {formatHourLabel(h)}
        </div>
      ))}
    </div>
  );
}

function DayColumn({ items }: { items: ScheduleCardItem[] }) {
  return (
    <div className="relative border-l border-white/5" style={{ height: CANVAS_HEIGHT }}>
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute inset-x-0 border-t border-white/5"
          style={{ top: `${hourTopPct(h)}%` }}
          aria-hidden
        />
      ))}
      {items.map((it) => {
        const { top, height } = blockPosition(it);
        return (
          <div
            key={itemKey(it)}
            className="absolute inset-x-0.5 min-h-[34px]"
            style={{ top: `${top * 100}%`, height: `${height * 100}%` }}
          >
            <CourseBlock item={it} />
          </div>
        );
      })}
    </div>
  );
}

interface ScheduleCanvasProps {
  items: ScheduleCardItem[];
}

export function ScheduleCanvas({ items }: ScheduleCanvasProps) {
  const byDay = groupByDay(items);
  const unscheduled = items.filter((i) => !DAYS_OF_WEEK.some((d) => d.toLowerCase() === (i.day ?? '').trim().toLowerCase()));
  const gridCols = { gridTemplateColumns: '3.5rem repeat(6, minmax(0, 1fr))' };

  const [selectedDay, setSelectedDay] = useState(() => {
    const first = DAYS_OF_WEEK.findIndex((_, i) => (byDay[i]?.length ?? 0) > 0);
    return first >= 0 ? first : 0;
  });

  return (
    <div>
      {/* Week view (tablet and up) */}
      <div className="hidden md:block overflow-x-auto schedules-scroll">
        <div className="min-w-[680px]">
          <div className="grid" style={gridCols}>
            <div aria-hidden />
            {DAY_ABBREVS.map((abbr, i) => (
              <div
                key={abbr}
                className="text-center pb-2 text-sm font-semibold text-[var(--light-text)]"
              >
                <span className="hidden lg:inline">{DAYS_OF_WEEK[i]}</span>
                <span className="lg:hidden">{abbr}</span>
                {(byDay[i]?.length ?? 0) > 0 && (
                  <span className="text-[var(--dark-text)] font-normal"> · {byDay[i].length}</span>
                )}
              </div>
            ))}
          </div>
          <div className="grid" style={gridCols}>
            <TimeAxis />
            {DAYS_OF_WEEK.map((day, di) => (
              <DayColumn key={day} items={byDay[di] ?? []} />
            ))}
          </div>
        </div>
      </div>

      {/* Day view (mobile) */}
      <div className="md:hidden">
        <div
          role="tablist"
          aria-label="Select day"
          className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 schedules-scroll"
        >
          {DAYS_OF_WEEK.map((day, i) => {
            const count = byDay[i]?.length ?? 0;
            const active = selectedDay === i;
            return (
              <button
                key={day}
                type="button"
                role="tab"
                id={`canvas-tab-${i}`}
                aria-controls="canvas-daypanel"
                aria-selected={active}
                aria-label={day}
                onClick={() => setSelectedDay(i)}
                className={`shrink-0 min-h-[44px] inline-flex items-center gap-1.5 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lighter-dark)] ${
                  active
                    ? 'bg-[var(--light-blue)] text-white'
                    : 'bg-[var(--lighter)] text-[var(--light-text)] hover:bg-[var(--lightest-dark)]'
                }`}
              >
                {DAY_ABBREVS[i]}
                {count > 0 && (
                  <span className={active ? 'text-white/80' : 'text-[var(--dark-text)]'}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div
          id="canvas-daypanel"
          role="tabpanel"
          aria-labelledby={`canvas-tab-${selectedDay}`}
          className="grid"
          style={{ gridTemplateColumns: '3.5rem 1fr' }}
        >
          <TimeAxis />
          <DayColumn items={byDay[selectedDay] ?? []} />
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/10">
          <h4 className="text-[var(--light-text)] text-sm font-semibold m-0 mb-2">
            Not scheduled
          </h4>
          <p className="text-[var(--dark-text)] text-xs m-0 mb-3">
            These sections have no listed day/time — verify them on Self-Service.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            {unscheduled.map((it) => (
              <div key={itemKey(it)} className="h-16">
                <CourseBlock item={it} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
