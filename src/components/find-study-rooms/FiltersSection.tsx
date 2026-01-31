export interface DisplayFilters {
  showTimeline: boolean;
  showBusyPeriods: boolean;
  groupByBuilding: boolean;
  onlyAvailableNow: boolean;
}

interface FiltersSectionProps {
  filters: DisplayFilters;
  onFiltersChange: (filters: DisplayFilters) => void;
}

export function FiltersSection({ filters, onFiltersChange }: FiltersSectionProps) {
  const update = (key: keyof DisplayFilters, value: boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-[var(--lighter-dark)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-6 rounded-xl flex-1 min-w-[300px]">
      <h2 className="text-2xl mb-5 text-[var(--light-text)]">
        <i className="fas fa-filter mr-2" />
        Display Options
      </h2>
      <div className="flex flex-col gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showTimeline}
            onChange={(e) => update('showTimeline', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-[var(--light-text)]">Show Timeline View</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showBusyPeriods}
            onChange={(e) => update('showBusyPeriods', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-[var(--light-text)]">Show Busy Periods</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.groupByBuilding}
            onChange={(e) => update('groupByBuilding', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-[var(--light-text)]">Group by Building</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyAvailableNow}
            onChange={(e) => update('onlyAvailableNow', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-[var(--light-text)]">Only Show Currently Available</span>
        </label>
      </div>
      <div className="mt-5 p-4 bg-[var(--dark)] rounded-lg">
        <p className="text-[0.9rem] text-[var(--light-text)] m-0">
          <i className="fas fa-info-circle mr-2" />
          <strong>Tip:</strong> Use the minimum duration filter to find rooms available for longer
          study sessions.
        </p>
      </div>
    </div>
  );
}
