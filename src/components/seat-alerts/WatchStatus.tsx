import { Button } from '@/components/ui/Button';

interface WatchStatusProps {
  count: number;
  email: string | null;
  refreshing: boolean;
  lastRefreshed: Date | null;
  error: string | null;
  openedCount: number;
  onRefresh: () => void;
  onStopAll: () => void;
  onDismissOpened: () => void;
}

export function WatchStatus({
  count,
  email,
  refreshing,
  lastRefreshed,
  error,
  openedCount,
  onRefresh,
  onStopAll,
  onDismissOpened,
}: WatchStatusProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-[var(--light-text)] text-xl font-semibold m-0">
            Watching{count > 0 && <span className="text-[var(--dark-text)] font-normal"> ({count})</span>}
          </h2>
          {/* The delivery mechanism was previously never mentioned anywhere in the UI. */}
          <p className="text-[var(--dark-text)] text-sm m-0 mt-1">
            {count === 0
              ? 'Nothing is being watched yet.'
              : email
                ? <>Alerts are emailed to <span className="text-[var(--light-text)]">{email}</span>. Watching continues after you close this tab.</>
                : 'Alerts are emailed to you. Watching continues after you close this tab.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={refreshing || count === 0}
            aria-busy={refreshing}
            className="px-4 text-sm"
          >
            <i
              className={`fas ${refreshing ? 'fa-circle-notch fa-spin' : 'fa-rotate-right'} mr-2`}
              aria-hidden
            />
            Refresh
          </Button>
          <Button
            variant="ghost"
            onClick={onStopAll}
            disabled={count === 0}
            className="px-4 text-sm"
          >
            Stop all
          </Button>
        </div>
      </div>

      {/* Live region: the seat count itself changing is not announced, so say it explicitly. */}
      <p role="status" aria-live="polite" className="sr-only">
        {openedCount > 0
          ? `${openedCount} watched ${openedCount === 1 ? 'section has' : 'sections have'} open seats.`
          : ''}
      </p>

      {openedCount > 0 && (
        <div className="flex items-center gap-3 mb-4 py-2.5 px-4 rounded-lg border border-[var(--orange)]/40 bg-[var(--orange)]/10">
          <i className="fas fa-bolt text-[var(--orange)] shrink-0" aria-hidden />
          <p className="m-0 text-sm text-[var(--light-text)] grow">
            {openedCount === 1 ? 'A seat just opened' : `${openedCount} seats just opened`} — register
            before it fills.
          </p>
          <button
            type="button"
            onClick={onDismissOpened}
            aria-label="Dismiss seat opening notice"
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--dark-text)] transition-colors hover:text-[var(--light-text)] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
          >
            <i className="fas fa-times" aria-hidden />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 mb-4 py-2.5 px-4 rounded-lg border border-[var(--btn-danger)]/40 bg-[var(--btn-danger)]/10"
        >
          <i className="fas fa-triangle-exclamation text-[var(--btn-danger)] shrink-0" aria-hidden />
          <p className="m-0 text-sm text-[var(--light-text)] grow">{error}</p>
          <Button variant="secondary" onClick={onRefresh} className="px-4 py-2 text-sm shrink-0">
            Try again
          </Button>
        </div>
      )}

      {count > 0 && (
        <p className="text-[var(--dark-text)] text-xs m-0 mb-3 tabular-nums">
          {refreshing
            ? 'Checking seats…'
            : lastRefreshed
              ? `Seats checked at ${lastRefreshed.toLocaleTimeString()} · rechecks every minute while this tab is open`
              : 'Waiting for the first seat check…'}
        </p>
      )}
    </>
  );
}
