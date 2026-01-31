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
    <div className="mt-6 mb-0 mx-auto bg-[var(--lighter-dark)] rounded-[10px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] relative w-4/5 p-5 pt-0 text-[var(--light-text)]">
      <div className="flex flex-row items-center gap-2.5">
        <h1 className="text-2xl font-bold text-[var(--light-text)]">Search for Courses</h1>
      </div>
      <div className="flex items-center gap-2.5 relative mb-4 mr-2.5">
        <div className="flex line-height-7 items-center relative w-full">
          <svg
            className="absolute left-2.5 w-4 h-4 fill-[#9e9ea7]"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
          </svg>
          <input
            id="course-search"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-[50px] pl-10 pr-4 border-2 border-transparent rounded-lg outline-none bg-[var(--lighter)] text-[var(--light-text)] placeholder:text-[var(--dark-text)] focus:border-[var(--light-text)] focus:bg-[var(--lightest-dark)] transition-colors"
          />
          {loading && (
            <div className="absolute right-14 flex items-center gap-2 font-semibold text-[var(--light-text)]">
              <div className="w-5 h-5 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
              Loading... Please wait.
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="h-[50px] px-5 cursor-pointer text-[var(--light-text)] text-base font-semibold rounded-[15px] border-none bg-[var(--dark-blue)] transition-all hover:bg-[var(--lighter)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
      <p className="m-0 text-base font-semibold text-[var(--light-text)]">
        SelfService might be down, but Scheds is still up :*
      </p>
    </div>
  );
}
