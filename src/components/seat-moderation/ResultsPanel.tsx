import type { SeatResult } from '@/types/seatModeration';
import { Button } from '@/components/ui/Button';

interface ResultsPanelProps {
  results: SeatResult[];
  isMonitoring: boolean;
  stopped: boolean;
  onUnsubscribe: (courseCode: string, section: string) => void;
  actionLoading?: boolean;
}

function groupByCourse(results: SeatResult[]): Record<string, SeatResult[]> {
  const groups: Record<string, SeatResult[]> = {};
  for (const r of results) {
    const key = r.course;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

export function ResultsPanel({
  results,
  isMonitoring,
  stopped,
  onUnsubscribe,
  actionLoading,
}: ResultsPanelProps) {
  if (results.length === 0) {
    const emptyMessage = stopped
      ? 'Monitoring stopped.'
      : isMonitoring
        ? 'No results yet — checking for updates.'
        : 'No results yet. Add courses and start monitoring.';
    const emptyIcon = stopped ? 'fa-circle-pause' : 'fa-inbox';
    return (
      <div className="bg-[var(--lighter-dark)] rounded-xl p-5 min-h-[500px] border border-white/10">
        <h2 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-5">Results</h2>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center text-[var(--dark-text)]">
            <i className={`fas ${emptyIcon} text-4xl mb-3`} aria-hidden />
            <p className="m-0 text-sm max-w-xs">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const grouped = groupByCourse(results);
  const availableCount = results.filter((r) => r.hasSeats || r.seatsLeft > 0).length;
  const fullCount = results.length - availableCount;

  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 min-h-[500px] border border-white/10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-4">
        <h2 className="text-[var(--light-text)] text-xl font-semibold m-0">Results</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-2 text-[var(--dark-text)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" aria-hidden />
            <span className="text-[var(--light-text)] font-semibold tabular-nums">
              {availableCount}
            </span>{' '}
            available
          </span>
          <span className="flex items-center gap-2 text-[var(--dark-text)]">
            <span className="w-2 h-2 rounded-full bg-[var(--btn-danger)]" aria-hidden />
            <span className="text-[var(--light-text)] font-semibold tabular-nums">{fullCount}</span>{' '}
            full
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Object.values(grouped).map((sections) => {
          const course = sections[0];
          const availableSections = sections.filter((s) => s.hasSeats || s.seatsLeft > 0).length;
          const anyOpen = availableSections > 0;
          return (
            <div
              key={course.course}
              className="rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="bg-[var(--lighter)] px-4 py-3 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <h3 className="m-0 text-base font-semibold text-[var(--light-text)] truncate">
                    {course.course}
                  </h3>
                  <p className="m-0 text-xs text-[var(--dark-text)] truncate">{course.courseName}</p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums ${
                    anyOpen
                      ? 'bg-[var(--success)]/15 text-[var(--success)]'
                      : 'bg-[var(--btn-danger)]/15 text-[var(--btn-danger)]'
                  }`}
                >
                  {availableSections}/{sections.length} open
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {sections.map((section) => {
                  const hasSeats = section.hasSeats || section.seatsLeft > 0;
                  return (
                    <div
                      key={`${section.course}-${section.section}`}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border ${
                        hasSeats
                          ? 'bg-[var(--success)]/10 border-[var(--success)]/30'
                          : 'bg-[var(--btn-danger)]/10 border-[var(--btn-danger)]/25'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          hasSeats ? 'bg-[var(--success)]' : 'bg-[var(--btn-danger)]'
                        }`}
                        aria-hidden
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[var(--light-text)] text-sm font-semibold">
                          Section {section.section}
                        </span>
                        <span className="text-[var(--dark-text)] text-xs truncate">
                          {section.instructor || 'TBA'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0">
                        <span
                          className={`text-lg font-bold tabular-nums ${
                            hasSeats ? 'text-[var(--success)]' : 'text-[var(--btn-danger)]'
                          }`}
                        >
                          {section.seatsLeft}
                        </span>
                        <span className="text-[var(--dark-text)] text-xs">
                          {section.seatsLeft === 1 ? 'seat' : 'seats'}
                        </span>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => onUnsubscribe(section.course, section.section)}
                        disabled={actionLoading}
                        aria-label={`Stop monitoring ${section.course} section ${section.section}`}
                        className="shrink-0 px-3 py-2 text-sm"
                      >
                        <i className="fas fa-bell-slash" aria-hidden />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
