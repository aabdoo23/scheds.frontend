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
    <>
      <SearchSection
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      {error && (
        <div className="w-4/5 mx-auto mt-5 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-6 mx-auto bg-[var(--lighter-dark)] rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] p-5 text-[var(--light-text)] w-4/5">
          <FilterSection
            filters={filters}
            onFiltersChange={setFilters}
            results={data}
            filteredCount={filteredResults.length}
          />
          <div className="grid gap-8 mt-0 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
            {filteredResults.map((course, idx) => (
              <CourseCard
                key={`${course.cardId}-${course.section}-${idx}`}
                course={course}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
