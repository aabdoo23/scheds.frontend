import type { SeatResult } from '@/types/seatModeration';

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

export function ResultsPanel({ results, isMonitoring, stopped, onUnsubscribe, actionLoading }: ResultsPanelProps) {
  if (results.length === 0) {
    const emptyMessage = stopped
      ? 'Monitoring stopped'
      : isMonitoring
        ? 'No results available'
        : 'No results yet. Add courses and start monitoring.';
    const emptyIcon = stopped ? 'fa-pause-circle' : 'fa-inbox';
    return (
      <div className="bg-[var(--lighter-dark)] rounded-xl p-6 min-h-[500px] border border-white/10">
        <h2 className="text-[var(--light-text)] text-xl m-0 mb-5">
          <i className="fas fa-chart-bar mr-2" />
          Results
        </h2>
        <div className="min-h-[400px] flex items-center justify-center text-[var(--dark-text)]">
          <div className="text-center py-10">
            <i className={`fas ${emptyIcon} text-5xl mb-4 opacity-50`} />
            <p className="m-0 text-base">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const grouped = groupByCourse(results);
  const availableCount = results.filter((r) => r.hasSeats || r.seatsLeft > 0).length;
  const fullCount = results.length - availableCount;

  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-6 min-h-[500px] border border-white/10">
      <h2 className="text-[var(--light-text)] text-xl m-0 mb-5">
        <i className="fas fa-chart-bar mr-2" />
        Results
      </h2>
      <div className="min-h-[400px]">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white/5 p-5 rounded-lg text-center border-l-4 border-[#28a745]">
            <div className="text-3xl font-bold text-[var(--light-text)] mb-1">{availableCount}</div>
            <div className="text-[var(--dark-text)] text-[0.9rem] uppercase">Available</div>
          </div>
          <div className="bg-white/5 p-5 rounded-lg text-center border-l-4 border-[#dc3545]">
            <div className="text-3xl font-bold text-[var(--light-text)] mb-1">{fullCount}</div>
            <div className="text-[var(--dark-text)] text-[0.9rem] uppercase">Full</div>
          </div>
        </div>
        <div className="grid gap-5">
          {Object.values(grouped).map((sections) => {
            const course = sections[0];
            const availableSections = sections.filter((s) => s.hasSeats || s.seatsLeft > 0).length;
            return (
              <div
                key={course.course}
                className="bg-white/[0.03] rounded-[10px] border border-white/10 overflow-hidden"
              >
                <div className="bg-[var(--light-blue)] px-5 py-4 flex justify-between items-center text-white">
                  <div>
                    <h3 className="m-0 mb-1 text-xl">{course.course}</h3>
                    <p className="m-0 text-[0.9rem] opacity-90">{course.courseName}</p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-[20px] text-[0.85rem] font-semibold ${
                      availableSections > 0 ? 'bg-[#28a745]/30' : 'bg-[#dc3545]/30'
                    }`}
                  >
                    {availableSections}/{sections.length} Available
                  </div>
                </div>
                <div className="p-4">
                  {sections.map((section) => {
                    const hasSeats = section.hasSeats || section.seatsLeft > 0;
                    return (
                      <div
                        key={`${section.course}-${section.section}`}
                        className={`flex justify-between items-center py-3 px-4 rounded-md mb-2 border-l-[3px] ${
                          hasSeats
                            ? 'bg-[#28a745]/10 border-[#28a745]'
                            : 'bg-[#dc3545]/10 border-[#dc3545]'
                        }`}
                      >
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-[var(--light-text)] font-semibold">
                            Section {section.section}
                          </span>
                          <span className="text-[var(--dark-text)] text-[0.9rem]">
                            {section.instructor || 'TBA'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mx-4">
                          <span
                            className={`text-2xl font-bold ${
                              hasSeats ? 'text-[#28a745]' : 'text-[#dc3545]'
                            }`}
                          >
                            {section.seatsLeft}
                          </span>
                          <span className="text-[var(--dark-text)] text-[0.85rem]">seats</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onUnsubscribe(section.course, section.section)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-[#dc3545] border-none text-white rounded-md cursor-pointer text-[0.9rem] transition-colors hover:bg-[#c82333] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-bell-slash" />
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
