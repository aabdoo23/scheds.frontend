interface SearchSectionProps {
  dayOfWeek: string;
  onDayChange: (day: string) => void;
  minimumMinutes: number;
  onMinimumMinutesChange: (value: number) => void;
  onSearchNow: () => void;
  onSearchSelectedDay: () => void;
}

const DAYS = [
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
];

export function SearchSection({
  dayOfWeek,
  onDayChange,
  minimumMinutes,
  onMinimumMinutesChange,
  onSearchNow,
  onSearchSelectedDay,
}: SearchSectionProps) {
  return (
    <div className="bg-[var(--lighter-dark)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-6 rounded-xl flex-1 min-w-[300px]">
      <h2 className="text-2xl mb-5 text-[var(--light-text)]">
        <i className="fas fa-search mr-2" />
        Search Criteria
      </h2>
      <div className="space-y-5">
        <div>
          <label
            htmlFor="day-select"
            className="block text-base font-semibold text-[var(--light-text)] mb-2"
          >
            <i className="fas fa-calendar-day mr-2" />
            Day of Week
          </label>
          <select
            id="day-select"
            value={dayOfWeek}
            onChange={(e) => onDayChange(e.target.value)}
            className="w-full p-3 text-base border-2 border-[var(--light-text)] rounded-lg bg-[var(--dark)] text-[var(--light-text)] focus:border-[#ff7300] focus:outline-none"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="minimum-minutes"
            className="block text-base font-semibold text-[var(--light-text)] mb-2"
          >
            <i className="fas fa-clock mr-2" />
            Minimum Available Duration (minutes)
          </label>
          <input
            type="number"
            id="minimum-minutes"
            value={minimumMinutes}
            onChange={(e) => onMinimumMinutesChange(parseInt(e.target.value, 10) || 0)}
            min={0}
            step={30}
            className="w-full p-3 text-base border-2 border-[var(--light-text)] rounded-lg bg-[var(--dark)] text-[var(--light-text)] focus:border-[#ff7300] focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onSearchNow}
            className="w-full h-[50px] cursor-pointer text-white text-base font-semibold rounded-[10px] border-none bg-[var(--dark-blue)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,123,255,0.3)] active:scale-[0.98]"
          >
            <i className="fas fa-bolt mr-2" />
            Search Now
          </button>
          <button
            type="button"
            onClick={onSearchSelectedDay}
            className="w-full h-[50px] cursor-pointer text-white text-base font-semibold rounded-[10px] border-none bg-[var(--lightest-dark)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <i className="fas fa-search mr-2" />
            Search Selected Day
          </button>
        </div>
      </div>
    </div>
  );
}
