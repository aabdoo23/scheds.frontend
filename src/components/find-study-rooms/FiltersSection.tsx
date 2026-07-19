import { OptionChip } from '@/components/ui/OptionChip';

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
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 border border-white/10">
      <h2 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-4">Display options</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <OptionChip
          type="checkbox"
          label="Timeline view"
          checked={filters.showTimeline}
          onChange={(v) => update('showTimeline', v)}
        />
        <OptionChip
          type="checkbox"
          label="Busy periods"
          checked={filters.showBusyPeriods}
          onChange={(v) => update('showBusyPeriods', v)}
        />
        <OptionChip
          type="checkbox"
          label="Group by building"
          checked={filters.groupByBuilding}
          onChange={(v) => update('groupByBuilding', v)}
        />
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/10 p-3 text-xs text-[var(--dark-text)] m-0">
        <i className="fas fa-circle-info mt-0.5" aria-hidden />
        <span>
          <span className="text-[var(--light-text)] font-medium">Tip:</span> raise the minimum free
          block to find rooms open long enough for a full study session.
        </span>
      </p>
    </div>
  );
}
