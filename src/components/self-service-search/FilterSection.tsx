import type { CourseSearchResult } from '@/types/course';

export interface SearchFilters {
  instructor: string;
  code: string;
  name: string;
  subType: string;
}

interface FilterSectionProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  results: CourseSearchResult[];
  filteredCount: number;
}

export function FilterSection({
  filters,
  onFiltersChange,
  results,
  filteredCount,
}: FilterSectionProps) {
  const subtypes = [...new Set(results.map((r) => r.subType).filter(Boolean))];

  const update = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-[var(--lighter-dark)] p-5 rounded-xl mb-6">
      <div className="grid gap-4 mb-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <input
          type="text"
          value={filters.instructor}
          onChange={(e) => update('instructor', e.target.value)}
          placeholder="Filter by Instructor"
          className="bg-[var(--dark-text)] border border-white/10 rounded-lg px-4 py-3 text-[var(--light-text)] text-[0.95rem] transition-all outline-none focus:border-[var(--light-blue)] focus:shadow-[0_0_0_2px_rgba(0,64,96,0.1)] hover:border-white/20"
        />
        <input
          type="text"
          value={filters.code}
          onChange={(e) => update('code', e.target.value)}
          placeholder="Filter by Course Code"
          className="bg-[var(--dark-text)] border border-white/10 rounded-lg px-4 py-3 text-[var(--light-text)] text-[0.95rem] transition-all outline-none focus:border-[var(--light-blue)] focus:shadow-[0_0_0_2px_rgba(0,64,96,0.1)] hover:border-white/20"
        />
        <input
          type="text"
          value={filters.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Filter by Course Name"
          className="bg-[var(--dark-text)] border border-white/10 rounded-lg px-4 py-3 text-[var(--light-text)] text-[0.95rem] transition-all outline-none focus:border-[var(--light-blue)] focus:shadow-[0_0_0_2px_rgba(0,64,96,0.1)] hover:border-white/20"
        />
        <select
          value={filters.subType}
          onChange={(e) => update('subType', e.target.value)}
          className="bg-[var(--dark-text)] border border-white/10 rounded-lg px-4 py-3 text-[var(--light-text)] text-[0.95rem] transition-all outline-none focus:border-[var(--light-blue)] appearance-none bg-no-repeat bg-[length:16px] bg-[right_12px_center] pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          }}
        >
          <option value="">All Types</option>
          {subtypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="text-[var(--light-text)] text-[0.9rem] opacity-80 text-right pt-2">
        <i className="fas fa-filter mr-2" />
        {filteredCount} result{filteredCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
