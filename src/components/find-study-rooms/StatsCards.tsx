interface StatsCardsProps {
  totalRooms: number;
  availableNow: number;
  avgAvailability: number;
}

// A compact inline summary strip , not hero-metric tiles. States the counts
// quietly above the results without a big-number template.
export function StatsCards({ totalRooms, availableNow, avgAvailability }: StatsCardsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="text-[var(--dark-text)]">
        <span className="text-[var(--light-text)] font-semibold tabular-nums">{totalRooms}</span>{' '}
        rooms
      </span>
      <span className="flex items-center gap-2 text-[var(--dark-text)]">
        <span className="w-2 h-2 rounded-full bg-[var(--success)]" aria-hidden />
        <span className="text-[var(--light-text)] font-semibold tabular-nums">{availableNow}</span>{' '}
        available now
      </span>
      <span className="text-[var(--dark-text)]">
        <span className="text-[var(--light-text)] font-semibold tabular-nums">
          {avgAvailability}m
        </span>{' '}
        avg free time
      </span>
    </div>
  );
}
