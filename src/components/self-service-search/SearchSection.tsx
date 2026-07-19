import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SearchSectionProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function SearchSection({ query, onQueryChange, onSearch, loading }: SearchSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 border border-white/10">
      <div className="relative" aria-busy={loading}>
        <i
          className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-text)]"
          aria-hidden
        />
        <Input
          id="course-search"
          type="search"
          aria-label="Search for courses"
          placeholder="Course code, name, or instructor…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-10"
        />
        {loading && (
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-block w-5 h-5 border-2 border-[var(--light-blue)] border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <p className="text-xs text-[var(--dark-text)] m-0">
          SelfService might be down, but Scheds is still up&nbsp;:*
        </p>
        <Button onClick={onSearch} disabled={loading} className="shrink-0">
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin mr-2" aria-hidden />
              Searching&hellip;
            </>
          ) : (
            <>
              <i className="fas fa-magnifying-glass mr-2" aria-hidden />
              Search
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
