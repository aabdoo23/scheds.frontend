import type { KeyboardEvent } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { OptionChip } from '@/components/ui/OptionChip';
import { SchedulePreview } from './SchedulePreview';
import {
  SORT_OPTIONS,
  formatClock,
  formatDays,
  formatGap,
  type ScheduleMetrics,
  type SortKey,
} from '@/lib/scheduleView';

interface ScheduleRankListProps {
  schedules: ScheduleCardItem[][];
  metrics: ScheduleMetrics[];
  order: number[];
  selected: number;
  onSelect: (index: number) => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

// Vertical selector beside the viewer: sort controls on top, then a scrollable
// ranked list. Selecting a row renders that schedule in the canvas.
export function ScheduleRankList({
  schedules,
  metrics,
  order,
  selected,
  onSelect,
  sortKey,
  onSortChange,
}: ScheduleRankListProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const rank = order.indexOf(selected);
    if (rank < 0) return;
    let next = rank;
    if (e.key === 'ArrowDown') next = Math.min(order.length - 1, rank + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, rank - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = order.length - 1;
    else return;
    e.preventDefault();
    const ni = order[next];
    onSelect(ni);
    (e.currentTarget.querySelector(`#sched-opt-${ni}`) as HTMLElement | null)?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-[var(--dark-text)] text-xs font-medium">Sort by</span>
        <div role="radiogroup" aria-label="Sort schedules" className="mt-1.5 grid grid-cols-2 gap-2">
          {SORT_OPTIONS.map((opt) => (
            <OptionChip
              key={opt.key}
              type="radio"
              name="schedule-sort"
              label={opt.label}
              checked={sortKey === opt.key}
              onChange={() => onSortChange(opt.key)}
            />
          ))}
        </div>
      </div>

      <div
        role="listbox"
        aria-label="Generated schedules, ranked"
        aria-activedescendant={`sched-opt-${selected}`}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-2 max-h-[32rem] overflow-y-auto pr-1 schedules-scroll xl:max-h-[calc(100vh-14rem)]"
      >
        {order.map((origIdx, rank) => {
          const m = metrics[origIdx];
          const isSelected = origIdx === selected;
          return (
            <button
              key={origIdx}
              type="button"
              role="option"
              id={`sched-opt-${origIdx}`}
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(origIdx)}
              className={`w-full text-left rounded-lg border p-3 flex flex-col gap-2.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)] ${
                isSelected
                  ? 'border-[var(--light-blue)] bg-[var(--light-blue)]/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 rounded-md text-xs font-bold tabular-nums ${
                    isSelected
                      ? 'bg-[var(--light-blue)] text-white'
                      : 'bg-white/10 text-[var(--light-text)]'
                  }`}
                >
                  #{rank + 1}
                </span>
                {sortKey === 'recommended' && rank === 0 && (
                  <span className="inline-flex items-center gap-1 text-[var(--light-blue)] text-xs font-semibold">
                    <i className="fas fa-star text-[0.6rem]" aria-hidden />
                    Best overall
                  </span>
                )}
                <span className="ml-auto text-[var(--light-text)] text-sm font-semibold tabular-nums">
                  {formatClock(m.earliestStart)} – {formatClock(m.latestEnd)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--dark-text)]">
                <span className="text-[var(--light-text)] font-medium">
                  {formatDays(m.daysOnCampus)}
                </span>
                <span>{formatGap(m.gapMinutes)}</span>
                {m.unscheduledCount > 0 && (
                  <span className="text-[var(--card-yellow)]">{m.unscheduledCount} unscheduled</span>
                )}
              </div>
              <SchedulePreview items={schedules[origIdx]} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
