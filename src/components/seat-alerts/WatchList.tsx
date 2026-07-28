import { useNow } from '@/hooks/useNow';
import { sectionKey, type WatchedSection } from '@/types/seatAlerts';

interface WatchListProps {
  sections: WatchedSection[];
  pendingKeys: string[];
  openedKeys: string[];
  loading: boolean;
  onRemove: (courseCode: string, section: string) => void;
}

/** Compact relative age, e.g. "12s ago". Returns null when there is no reading yet. */
function formatAge(lastUpdate: string | null, now: number): string | null {
  if (!lastUpdate) return null;
  const at = Date.parse(lastUpdate);
  if (Number.isNaN(at)) return null;

  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

function isStale(lastUpdate: string | null, now: number): boolean {
  if (!lastUpdate) return false;
  const at = Date.parse(lastUpdate);
  return !Number.isNaN(at) && now - at > 5 * 60_000;
}

export function WatchList({
  sections,
  pendingKeys,
  openedKeys,
  loading,
  onRemove,
}: WatchListProps) {
  const now = useNow();

  if (loading && sections.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--dark-text)]">
        <i className="fas fa-circle-notch fa-spin text-3xl mb-3" aria-hidden />
        <p className="m-0 text-sm">Loading your watched sections&hellip;</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-white/10">
        <i className="fas fa-bell text-3xl text-[var(--dark-text)] mb-3" aria-hidden />
        <p className="text-[var(--light-text)] font-medium m-0 mb-1">Not watching anything yet</p>
        <p className="text-[var(--dark-text)] text-sm m-0 max-w-sm">
          Add a section above. Scheds keeps checking it and emails you the moment a seat opens —
          you can close this tab.
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none p-0 m-0 flex flex-col gap-2">
      {sections.map((item) => {
        const key = sectionKey(item.courseCode, item.section);
        const pending = pendingKeys.includes(key);
        const justOpened = openedKeys.includes(key);
        const unknown = item.seatsLeft === null;
        const open = !unknown && item.seatsLeft! > 0;
        const age = formatAge(item.lastUpdate, now);
        const stale = isStale(item.lastUpdate, now);

        return (
          <li
            key={key}
            className={`flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 p-3 rounded-lg border transition-colors ${
              justOpened
                ? 'border-[var(--orange)]/50 bg-[var(--orange)]/10'
                : open
                  ? 'border-[var(--success)]/30 bg-[var(--success)]/[0.08]'
                  : 'border-white/10 bg-white/[0.02]'
            } ${pending ? 'opacity-60' : ''}`}
          >
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${
                unknown
                  ? 'bg-[var(--dark-text)]'
                  : open
                    ? 'bg-[var(--success)]'
                    : 'bg-[var(--btn-danger)]'
              }`}
              aria-hidden
            />

            <div className="flex flex-col min-w-0 grow order-2 sm:order-none basis-full sm:basis-auto">
              <span className="flex items-center flex-wrap gap-x-2 text-[var(--light-text)] text-sm font-semibold">
                {item.courseCode}
                <span className="text-[var(--dark-text)] font-normal">
                  Section {item.section}
                </span>
                {justOpened && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--orange)]/20 text-[var(--orange)]">
                    Just opened
                  </span>
                )}
              </span>
              <span className="text-[var(--dark-text)] text-xs truncate">
                {item.courseName || 'Course name unavailable'}
                {item.instructor ? ` · ${item.instructor}` : ''}
              </span>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-auto sm:ml-0 order-1 sm:order-none">
              {unknown ? (
                <span className="text-[var(--dark-text)] text-sm">No reading</span>
              ) : (
                <span className="flex items-baseline gap-1">
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      open ? 'text-[var(--success)]' : 'text-[var(--btn-danger)]'
                    }`}
                  >
                    {item.seatsLeft}
                  </span>
                  <span className="text-[var(--dark-text)] text-xs">
                    {item.seatsLeft === 1 ? 'seat' : 'seats'}
                  </span>
                </span>
              )}
              <span
                className={`text-xs tabular-nums ${
                  stale ? 'text-[var(--card-yellow)]' : 'text-[var(--dark-text)]'
                }`}
              >
                {age ?? 'checking…'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.courseCode, item.section)}
              disabled={pending}
              aria-label={`Stop watching ${item.courseCode} section ${item.section}`}
              className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--dark-text)] transition-colors hover:text-white hover:bg-[var(--btn-danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dark)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                className={`fas ${pending ? 'fa-circle-notch fa-spin' : 'fa-bell-slash'}`}
                aria-hidden
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
