import type { CourseSearchResult } from '@/types/course';
import { Input } from '@/components/ui/Input';

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
    <div className="bg-[var(--lighter-dark)] p-5 rounded-xl border border-white/10 mb-6">
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <Input
          type="text"
          aria-label="Filter by instructor"
          value={filters.instructor}
          onChange={(e) => update('instructor', e.target.value)}
          placeholder="Instructor"
        />
        <Input
          type="text"
          aria-label="Filter by course code"
          value={filters.code}
          onChange={(e) => update('code', e.target.value)}
          placeholder="Course code"
        />
        <Input
          type="text"
          aria-label="Filter by course name"
          value={filters.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Course name"
        />
        <select
          aria-label="Filter by section type"
          value={filters.subType}
          onChange={(e) => update('subType', e.target.value)}
          className="w-full py-3 pl-4 pr-10 bg-[var(--dark)] border-2 border-white/10 rounded-lg text-[var(--light-text)] text-base outline-none focus:border-[var(--light-blue)] appearance-none bg-no-repeat bg-[length:16px] bg-[right_12px_center]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238d9099' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          }}
        >
          <option value="">All types</option>
          {subtypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="text-[var(--dark-text)] text-sm text-right pt-3 tabular-nums">
        <i className="fas fa-filter mr-2" aria-hidden />
        {filteredCount} result{filteredCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
