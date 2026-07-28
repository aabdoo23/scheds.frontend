import { useState, useCallback, useRef, useEffect } from 'react';
import type { CustomCartItem } from '@/types/generate';
import type { CourseSearchItem } from '@/types/seatAlerts';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function SearchResultsListbox({
  results,
  inCart,
  onAddToCart,
}: {
  results: CourseSearchItem[];
  inCart: Set<string>;
  onAddToCart: (item: CustomCartItem) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(results.length > 0 ? 0 : -1);
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.querySelector(`#result-${activeIndex}`);
      activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i < results.length - 1 ? i + 1 : i));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        const course = results[activeIndex];
        onAddToCart({ courseCode: course.courseCode, courseName: course.courseName });
      }
    },
    [results, activeIndex, onAddToCart]
  );

  return (
    <div
      ref={listboxRef}
      className="flex-1 min-h-0 overflow-y-auto rounded-lg p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] schedules-scroll"
      role="listbox"
      aria-label="Search results"
      aria-activedescendant={
        activeIndex >= 0 && results[activeIndex] ? `result-${activeIndex}` : undefined
      }
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {results.map((course, i) => {
        const added = inCart.has(course.courseCode);
        const active = i === activeIndex;
        return (
          <button
            key={`${course.courseCode}-${course.courseName}`}
            id={`result-${i}`}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() =>
              onAddToCart({ courseCode: course.courseCode, courseName: course.courseName })
            }
            className={`w-full flex items-center gap-3 text-left py-3 px-3 rounded-lg mb-1 min-h-[44px] cursor-pointer transition-colors border ${
              active
                ? 'bg-[var(--light-blue)] text-white border-[var(--light-blue)]'
                : 'bg-[var(--dark)] text-[var(--light-text)] border-white/10 hover:bg-[var(--lighter)] hover:border-white/20'
            }`}
          >
            <span className="flex-1 min-w-0 truncate text-sm">
              <span className="font-semibold">{course.courseCode}</span>
              <span className={active ? 'text-white/85' : 'text-[var(--dark-text)]'}>
                {' '}· {course.courseName}
              </span>
            </span>
            {added ? (
              <span
                className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium ${
                  active ? 'text-white' : 'text-[var(--success)]'
                }`}
              >
                <i className="fas fa-check" aria-hidden />
                Added
              </span>
            ) : (
              <i
                className={`fas fa-plus shrink-0 ${active ? 'text-white' : 'text-[var(--dark-text)]'}`}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface SearchSectionProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: CourseSearchItem[];
  loading: boolean;
  liveSearchLoading: boolean;
  useLiveData: boolean;
  onUseLiveDataChange: (checked: boolean) => void;
  onAddToCart: (item: CustomCartItem) => void;
  onSearchLive: () => void;
  cartCourseCodes: string[];
  cartLimitError?: boolean;
  onCartLimitErrorDismiss?: () => void;
  searchLiveError?: boolean;
}

export function SearchSection({
  query,
  onQueryChange,
  results,
  loading,
  liveSearchLoading,
  useLiveData,
  onUseLiveDataChange,
  onAddToCart,
  onSearchLive,
  cartCourseCodes,
  cartLimitError,
  onCartLimitErrorDismiss,
  searchLiveError,
}: SearchSectionProps) {
  const inCart = new Set(cartCourseCodes);
  const trimmed = query.trim();
  const showEmpty = trimmed.length > 0 && !loading && results.length === 0;
  const showHint = trimmed.length === 0 && !loading;

  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 flex-1 min-w-0 lg:min-w-[280px] border border-white/10 flex flex-col max-h-[min(460px,48vh)] lg:max-h-[460px]">
      <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-3 shrink-0">
        Search for courses
      </h3>

      {cartLimitError && (
        <div
          role="alert"
          className="mb-3 p-3 rounded-lg bg-[var(--btn-danger)]/20 border border-[var(--btn-danger)] text-[var(--light-text)] text-sm flex items-center justify-between gap-2 shrink-0"
        >
          <span>You can register a maximum of 8 courses per semester.</span>
          {onCartLimitErrorDismiss && (
            <button
              type="button"
              onClick={onCartLimitErrorDismiss}
              aria-label="Dismiss"
              className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
            >
              <i className="fas fa-times" aria-hidden />
            </button>
          )}
        </div>
      )}

      <div className="relative shrink-0" aria-busy={loading}>
        <i
          className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-text)]"
          aria-hidden
        />
        <Input
          type="search"
          id="course-search"
          aria-label="Search for courses"
          placeholder="Course code or name…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={liveSearchLoading}
          className="pl-12 pr-10"
        />
        {loading && (
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-block w-5 h-5 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
        )}
      </div>

      <label className="flex items-center gap-2 mt-2 mb-3 shrink-0 text-sm text-[var(--light-text)] cursor-pointer">
        <input
          type="checkbox"
          checked={useLiveData}
          onChange={(e) => onUseLiveDataChange(e.target.checked)}
          className="w-4 h-4 rounded accent-[var(--orange)]"
        />
        Use live data when adding
        <Tooltip
          content={
            <>
              Fetches each course fresh from Self-Service on add, so{' '}
              <strong>every section is up to date.</strong> Adds a small delay.
            </>
          }
          label="Live data info"
        >
          <i className="fas fa-info-circle text-[var(--dark-text)]" aria-hidden />
        </Tooltip>
      </label>

      {results.length > 0 && (
        <SearchResultsListbox results={results} inCart={inCart} onAddToCart={onAddToCart} />
      )}

      {showEmpty && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4 py-6">
          <p className="text-[var(--light-text)] font-medium m-0 mb-1">
            No matches for “{trimmed}”
          </p>
          <p className="text-[var(--dark-text)] text-sm m-0 mb-4 max-w-xs">
            It may not be cached yet. Fetch it straight from NU Self-Service.
          </p>
          <Button onClick={onSearchLive} disabled={liveSearchLoading}>
            {liveSearchLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2" aria-hidden />
                Searching…
              </>
            ) : (
              <>
                <i className="fas fa-bolt mr-2" aria-hidden />
                Search NU live
              </>
            )}
          </Button>
          {searchLiveError && (
            <p role="alert" className="text-[var(--btn-danger)] text-sm mt-3 m-0">
              Couldn’t reach live search. Check your connection and try again.
            </p>
          )}
        </div>
      )}

      {showHint && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-4 py-6">
          <i className="fas fa-magnifying-glass text-3xl text-[var(--dark-text)] mb-3" aria-hidden />
          <p className="text-[var(--dark-text)] text-sm m-0 max-w-xs">
            Start typing a course code or name to see matches.
          </p>
        </div>
      )}
    </div>
  );
}
