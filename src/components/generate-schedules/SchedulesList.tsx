import { useState, useCallback, useEffect } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { ScheduleTable } from './ScheduleTable';

interface SchedulesListProps {
  schedules: ScheduleCardItem[][];
}

export function SchedulesList({ schedules }: SchedulesListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCardKey, setActiveCardKey] = useState<string | null>(null);

  const handleCardActivate = useCallback((key: string, _byClick?: boolean) => {
    setActiveCardKey(key);
  }, []);

  const handleCardDeactivate = useCallback(() => {
    setActiveCardKey(null);
  }, []);

  useEffect(() => {
    if (schedules.length > 0 && selectedIndex >= schedules.length) {
      setSelectedIndex(schedules.length - 1);
    }
  }, [schedules.length, selectedIndex]);

  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
        <i className="fas fa-search text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
        <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
          No schedules match your preferences
        </h3>
        <p className="text-[var(--dark-text)] m-0 max-w-md">
          Try adjusting the customization options above (days, time slots, etc.) and generate again.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, schedules.length - 1);
  const currentSchedule = schedules[safeIndex];
  const canPrev = safeIndex > 0;
  const canNext = safeIndex < schedules.length - 1;

  return (
    <div className="flex flex-col items-center w-full min-h-[200px]">
      <div className="flex items-center justify-center gap-4 mb-4 w-full">
        <span className="font-semibold text-lg text-[var(--light-text)]">
          {schedules.length} Generated Schedules
        </span>
        <nav
          className="flex items-center gap-2"
          aria-label="Navigate between schedules"
        >
          <button
            type="button"
            onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="px-3 py-1.5 rounded-lg bg-[var(--lighter-dark)] text-[var(--light-text)] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[var(--light-blue)] transition-colors"
            aria-label="Previous schedule"
          >
            Prev
          </button>
          <span className="text-[var(--light-text)] font-medium min-w-[7rem] text-center">
            Schedule {safeIndex + 1} of {schedules.length}
          </span>
          <button
            type="button"
            onClick={() => setSelectedIndex((i) => Math.min(schedules.length - 1, i + 1))}
            disabled={!canNext}
            className="px-3 py-1.5 rounded-lg bg-[var(--lighter-dark)] text-[var(--light-text)] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-[var(--light-blue)] transition-colors"
            aria-label="Next schedule"
          >
            Next
          </button>
        </nav>
      </div>
      <div className="schedules-scroll flex flex-col w-full overflow-x-auto scroll-smooth">
        <div className="overflow-x-auto overflow-y-visible">
          <ScheduleTable
            key={safeIndex}
            items={currentSchedule}
            scheduleIndex={safeIndex}
            activeCardKey={activeCardKey}
            onCardActivate={handleCardActivate}
            onCardDeactivate={handleCardDeactivate}
          />
        </div>
      </div>
    </div>
  );
}
