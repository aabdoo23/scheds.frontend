import type { ScheduleCardItem } from '@/types/generate';
import {
  DAYS_OF_WEEK,
  DAY_ABBREVS,
  blockPosition,
  groupByDay,
  courseColor,
  itemKey,
} from '@/lib/scheduleView';

// Decorative miniature of the week shape — the row's metrics carry the meaning.
// Mirrors the hero's schedule hub: a ruled --lighter-dark track with inset, rounded
// course-colored tiles, so a generated schedule reads as the same object across the app.
export function SchedulePreview({ items }: { items: ScheduleCardItem[] }) {
  const byDay = groupByDay(items);
  return (
    <div className="flex gap-[3px]" aria-hidden>
      {DAYS_OF_WEEK.map((day, di) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full h-16 rounded-[4px] bg-[var(--lighter-dark)] border border-white/[0.07] overflow-hidden [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(25%_-_1px),rgba(255,255,255,0.05)_calc(25%_-_1px),rgba(255,255,255,0.05)_25%)]">
            {(byDay[di] ?? []).map((it) => {
              const { top, height } = blockPosition(it);
              const color = courseColor(it.courseCode);
              return (
                <div
                  key={itemKey(it)}
                  className="absolute left-[2px] right-[2px] rounded-[3px]"
                  style={{
                    top: `${top * 100}%`,
                    height: `${Math.max(height * 100, 8)}%`,
                    backgroundColor: color.bg,
                  }}
                />
              );
            })}
          </div>
          <span className="text-[0.6rem] text-[var(--dark-text)] leading-none">
            {DAY_ABBREVS[di][0]}
          </span>
        </div>
      ))}
    </div>
  );
}
