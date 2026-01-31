import { useState, useCallback, useRef, useEffect } from 'react';
import type { CustomCartItem } from '@/types/generate';
import type { CourseSearchItem } from '@/types/seatModeration';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function SearchResultsListbox({
  results,
  onAddToCart,
}: {
  results: CourseSearchItem[];
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
      className="flex-1 max-h-[280px] overflow-y-auto rounded-lg p-2.5 bg-[var(--lighter-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
      role="listbox"
      aria-label="Search results"
      aria-live="polite"
      aria-activedescendant={activeIndex >= 0 && results[activeIndex] ? `result-${activeIndex}` : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {results.map((course, i) => (
        <button
          key={`${course.courseCode}-${course.courseName}`}
          id={`result-${i}`}
          type="button"
          role="option"
          aria-selected={i === activeIndex}
          onClick={() =>
            onAddToCart({
              courseCode: course.courseCode,
              courseName: course.courseName,
            })
          }
          className={`w-full text-left py-4 px-4 rounded-lg mb-2.5 cursor-pointer transition-colors border-none ${
            i === activeIndex
              ? 'bg-[var(--light-blue)] text-white ring-2 ring-[var(--light-blue)]'
              : 'bg-[var(--dark-text)] text-white hover:bg-[var(--dark-blue)]'
          }`}
        >
          <strong>{course.courseCode}</strong>: {course.courseName}
        </button>
      ))}
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
  cartLimitError?: boolean;
  onCartLimitErrorDismiss?: () => void;
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
  cartLimitError,
  onCartLimitErrorDismiss,
}: SearchSectionProps) {
  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 flex-1 min-w-0 lg:min-w-[280px] border border-white/10 min-h-[400px] flex flex-col">
      <div className="flex flex-row items-center gap-2.5 mb-4">
        <h2 className="text-[var(--light-text)] text-xl m-0">Search for Courses</h2>
        <label className="flex items-center gap-1.5 mt-1 font-semibold text-[var(--dark-text)] cursor-pointer">
          <input
            type="checkbox"
            checked={useLiveData}
            onChange={(e) => onUseLiveDataChange(e.target.checked)}
            className="rounded"
          />
          Use Live Data in course selection
        </label>
        <Tooltip
          content={
            <>
              Fetches data for each course on selection from Self Service to{' '}
              <strong>ensure data is updated and all sections are there.</strong> Small delay.
            </>
          }
          label="Live data info"
        >
          <i className="fas fa-info-circle text-[var(--dark-text)]" aria-hidden />
        </Tooltip>
      </div>
      {cartLimitError && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-[#dc3545]/20 border border-[#dc3545] text-[var(--light-text)] text-sm flex items-center justify-between gap-2"
        >
          <span>You can register maximum of 8 courses per semester. متحلوّش</span>
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
        <div className="flex-1 min-w-0 relative" aria-busy={loading}>
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-text)]" aria-hidden />
          <Input
            type="search"
            id="course-search"
            aria-label="Search for courses"
            placeholder="Search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            disabled={liveSearchLoading}
            className="pl-12 pr-4"
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-[var(--dark-text)] flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          )}
        </div>
        <Button
          onClick={onSearchLive}
          disabled={liveSearchLoading || !query.trim()}
          className="shrink-0"
        >
          Search Live
        </Button>
        <Tooltip
          content="If you can't find the course you're searching for in the autocomplete, click this button."
          label="Search live info"
        >
          <i className="fas fa-info-circle text-[var(--dark-text)]" aria-hidden />
        </Tooltip>
      </div>
      <SearchResultsListbox
        key={`${results.length}-${results[0]?.courseCode ?? ''}`}
        results={results}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
