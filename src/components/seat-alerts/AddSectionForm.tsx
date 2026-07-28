import type { CourseSearchItem } from '@/types/seatAlerts';
import { Button } from '@/components/ui/Button';

interface AddSectionFormProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: CourseSearchItem[];
  loading: boolean;
  onSelectCourse: (course: CourseSearchItem) => void;
  selectedCourse: CourseSearchItem | null;
  onClearCourse: () => void;
  sections: string[];
  sectionsLoading: boolean;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onAdd: () => void;
  disabled: boolean;
  adding: boolean;
  alreadyWatching: boolean;
}

export function AddSectionForm({
  query,
  onQueryChange,
  results,
  loading,
  onSelectCourse,
  selectedCourse,
  onClearCourse,
  sections,
  sectionsLoading,
  selectedSection,
  onSectionChange,
  onAdd,
  disabled,
  adding,
  alreadyWatching,
}: AddSectionFormProps) {
  const noSections = !sectionsLoading && sections.length === 0;
  const canAdd = !disabled && !adding && !alreadyWatching && selectedSection !== '';

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <label htmlFor="course-search" className="sr-only">
          Search courses
        </label>
        <i
          className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-text)]"
          aria-hidden
        />
        <input
          id="course-search"
          type="search"
          placeholder="Search by course code or name…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          className="w-full py-3 pl-12 pr-4 bg-[var(--dark)] border-2 border-white/10 rounded-lg text-[var(--light-text)] text-base transition-colors outline-none focus:border-[var(--light-blue)] disabled:opacity-50"
        />
      </div>

      {loading && (
        <p className="m-0 text-sm text-[var(--dark-text)]" role="status">
          <i className="fas fa-circle-notch fa-spin mr-2" aria-hidden />
          Searching…
        </p>
      )}

      {!loading && results.length > 0 && !selectedCourse && (
        <ul className="list-none p-0 m-0 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {results.map((course) => (
            <li key={`${course.courseCode}-${course.courseName}`}>
              <button
                type="button"
                onClick={() => onSelectCourse(course)}
                className="w-full text-left min-h-[44px] py-3 px-4 bg-white/[0.02] border border-white/10 rounded-lg cursor-pointer transition-colors text-[var(--light-text)] hover:bg-white/[0.06] hover:border-[var(--light-blue)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
              >
                <span className="font-semibold">{course.courseCode}</span>
                <span className="text-[var(--dark-text)]"> · {course.courseName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedCourse && (
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[var(--light-text)] text-base font-semibold m-0 min-w-0">
              {selectedCourse.courseCode}
              <span className="text-[var(--dark-text)] font-normal"> · {selectedCourse.courseName}</span>
            </h3>
            <button
              type="button"
              onClick={onClearCourse}
              aria-label="Choose a different course"
              className="shrink-0 min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-lg text-[var(--dark-text)] transition-colors hover:text-[var(--light-text)] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
            >
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
            <label htmlFor="section-select" className="sr-only">
              Section
            </label>
            <select
              id="section-select"
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={sectionsLoading || noSections}
              className="grow min-h-[44px] py-2.5 px-4 bg-[var(--dark)] border-2 border-white/10 rounded-lg text-[var(--light-text)] text-base outline-none focus:border-[var(--light-blue)] disabled:opacity-50"
            >
              <option value="">
                {sectionsLoading
                  ? 'Loading sections…'
                  : noSections
                    ? 'No sections available'
                    : 'Select a section…'}
              </option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
            <Button onClick={onAdd} disabled={!canAdd} aria-busy={adding} className="shrink-0">
              <i
                className={`fas ${adding ? 'fa-circle-notch fa-spin' : 'fa-bell'} mr-2`}
                aria-hidden
              />
              Watch section
            </Button>
          </div>

          {/* DESIGN.md: state why a primary action is disabled rather than leaving it to guesswork. */}
          {alreadyWatching ? (
            <p className="m-0 text-sm text-[var(--dark-text)]">
              You are already watching this section.
            </p>
          ) : noSections ? (
            <p className="m-0 text-sm text-[var(--dark-text)]">
              No sections found for this course this term.
            </p>
          ) : selectedSection === '' ? (
            <p className="m-0 text-sm text-[var(--dark-text)]">Pick a section to start watching.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
