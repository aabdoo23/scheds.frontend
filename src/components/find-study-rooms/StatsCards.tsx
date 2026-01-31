interface StatsCardsProps {
  totalRooms: number;
  availableNow: number;
  avgAvailability: number;
}

export function StatsCards({ totalRooms, availableNow, avgAvailability }: StatsCardsProps) {
  return (
    <div className="flex gap-4 mb-5 flex-wrap">
      <div className="bg-[var(--lighter-dark)] px-6 py-4 rounded-[10px] shadow-[0_3px_10px_rgba(0,0,0,0.1)] flex-1 min-w-[150px] text-center">
        <div className="text-3xl font-bold text-[var(--dark-blue)]">{totalRooms}</div>
        <div className="text-[0.9rem] text-[var(--light-text)] opacity-80">Total Rooms</div>
      </div>
      <div className="bg-[var(--lighter-dark)] px-6 py-4 rounded-[10px] shadow-[0_3px_10px_rgba(0,0,0,0.1)] flex-1 min-w-[150px] text-center">
        <div className="text-3xl font-bold text-[var(--dark-blue)]">{availableNow}</div>
        <div className="text-[0.9rem] text-[var(--light-text)] opacity-80">Available Now</div>
      </div>
      <div className="bg-[var(--lighter-dark)] px-6 py-4 rounded-[10px] shadow-[0_3px_10px_rgba(0,0,0,0.1)] flex-1 min-w-[150px] text-center">
        <div className="text-3xl font-bold text-[var(--dark-blue)]">{avgAvailability}m</div>
        <div className="text-[0.9rem] text-[var(--light-text)] opacity-80">Avg. Free Time</div>
      </div>
    </div>
  );
}
