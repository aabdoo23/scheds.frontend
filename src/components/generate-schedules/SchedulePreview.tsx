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
export function SchedulePreview({ items }: { items: ScheduleCardItem[] }) {
  const byDay = groupByDay(items);
  return (
    <div className="flex gap-1" aria-hidden>
      {DAYS_OF_WEEK.map((day, di) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full h-16 rounded-sm bg-white/[0.03] overflow-hidden">
            {(byDay[di] ?? []).map((it) => {
              const { top, height } = blockPosition(it);
              const color = courseColor(it.courseCode);
              return (
                <div
                  key={itemKey(it)}
                  className="absolute inset-x-0 rounded-[2px]"
                  style={{
                    top: `${top * 100}%`,
                    height: `${Math.max(height * 100, 7)}%`,
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
