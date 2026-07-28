import { useState, useMemo } from 'react';
import { useCourseSearch } from '@/hooks/useCourseSearch';
import { SearchSection } from '@/components/self-service-search/SearchSection';
import { FilterSection, type SearchFilters } from '@/components/self-service-search/FilterSection';
import { CourseCard } from '@/components/self-service-search/CourseCard';

const DEFAULT_FILTERS: SearchFilters = {
  instructor: '',
  code: '',
  name: '',
  subType: '',
};

export function SelfServiceSearchPage() {
  const { data, loading, error, search } = useCourseSearch();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const filteredResults = useMemo(() => {
    const instructor = filters.instructor.toLowerCase();
    const code = filters.code.toLowerCase();
    const name = filters.name.toLowerCase();
    const subType = filters.subType;

    return data.filter((item) => {
      return (
        (!instructor || item.instructorName.toLowerCase().includes(instructor)) &&
        (!code || item.courseCode.toLowerCase().includes(code)) &&
        (!name || item.courseName.toLowerCase().includes(name)) &&
        (!subType || item.subType === subType)
      );
    });
  }, [data, filters]);

  const handleSearch = () => {
    search(query);
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-[var(--light-text)]">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0 mb-1">Search for courses</h1>
      <p className="text-[var(--dark-text)] m-0 mb-6">
        Look up any section straight from NU Self-Service , by code, name, or instructor.
      </p>

      <SearchSection
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      {error && (
        <div
          role="alert"
          className="mt-6 flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-[var(--btn-danger)]/40 text-center"
        >
          <i className="fas fa-triangle-exclamation text-4xl text-[var(--btn-danger)] mb-4" aria-hidden />
          <h2 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
            Couldn&apos;t search courses
          </h2>
          <p className="text-[var(--light-text)]/80 m-0 max-w-md">{error}</p>
        </div>
      )}

      {!error && data.length > 0 && (
        <section className="mt-6" aria-label="Search results" aria-live="polite">
          <FilterSection
            filters={filters}
            onFiltersChange={setFilters}
            results={data}
            filteredCount={filteredResults.length}
          />
          <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
            {filteredResults.map((course, idx) => (
              <CourseCard key={`${course.cardId}-${course.section}-${idx}`} course={course} />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
          <i className="fas fa-magnifying-glass text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
          <h2 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">No results yet</h2>
          <p className="text-[var(--dark-text)] m-0 max-w-md">
            Search a course code, name, or instructor to see matching sections here.
          </p>
        </div>
      )}
    </main>
  );
}
