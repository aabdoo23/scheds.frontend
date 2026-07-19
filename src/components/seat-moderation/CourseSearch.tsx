import type { CourseSearchItem } from '@/types/seatModeration';
import { Button } from '@/components/ui/Button';

interface CourseSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: CourseSearchItem[];
  loading: boolean;
  onSelectCourse: (course: CourseSearchItem) => void;
  selectedCourse: CourseSearchItem | null;
  sections: string[];
  sectionsLoading: boolean;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onAddToCart: () => void;
  isAuthenticated: boolean;
  addDisabled?: boolean;
}

export function CourseSearch({
  query,
  onQueryChange,
  results,
  loading,
  onSelectCourse,
  selectedCourse,
  sections,
  sectionsLoading,
  selectedSection,
  onSectionChange,
  onAddToCart,
  isAuthenticated,
  addDisabled = false,
}: CourseSearchProps) {
  return (
    <>
      <div className="bg-[var(--lighter-dark)] rounded-xl p-6 mb-5 border border-white/10">
        <h2 className="text-[var(--light-text)] text-xl m-0 mb-5">Search Courses</h2>
        <div className="relative mb-4">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-text)]" />
          <input
            id="course-search"
            type="search"
            placeholder="Search for courses..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            disabled={!isAuthenticated}
            className="w-full py-3 pl-12 pr-4 bg-[var(--dark)] border-2 border-white/10 rounded-lg text-[var(--light-text)] text-base transition-colors outline-none focus:border-[var(--light-blue)] disabled:opacity-50"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading && (
            <div className="py-4 text-center text-[var(--dark-text)]">Loading...</div>
          )}
          {!loading &&
            results.map((course) => (
              <button
                key={`${course.courseCode}-${course.courseName}`}
                type="button"
                onClick={() => onSelectCourse(course)}
                className="w-full text-left py-3 px-4 bg-[var(--dark)] rounded-md mb-2 cursor-pointer transition-colors text-[var(--light-text)] hover:bg-[var(--light-blue)] border-none"
              >
                <strong>{course.courseCode}</strong>: {course.courseName}
              </button>
            ))}
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-[var(--lighter-dark)] rounded-xl p-6 mb-5 border border-white/10">
          <h3 className="text-[var(--light-text)] text-lg m-0 mb-4">
            {selectedCourse.courseCode}: {selectedCourse.courseName}
          </h3>
          <div className="flex gap-2.5 items-center">
            <select
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              disabled={sectionsLoading || sections.length === 0}
              className="flex-1 py-2.5 px-4 bg-[var(--dark)] border-2 border-white/10 rounded-lg text-[var(--light-text)] text-base outline-none focus:border-[var(--light-blue)] disabled:opacity-50"
            >
              <option value="">
                {sectionsLoading ? 'Loading...' : sections.length === 0 ? 'No sections available' : 'Select a section...'}
              </option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
            <Button
              onClick={onAddToCart}
              disabled={!selectedSection || sectionsLoading || addDisabled}
              aria-busy={addDisabled}
              className="shrink-0"
            >
              <i className={`fas ${addDisabled ? 'fa-circle-notch fa-spin' : 'fa-plus'} mr-2`} aria-hidden />
              Add
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
