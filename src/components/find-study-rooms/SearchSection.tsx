import { Button } from '@/components/ui/Button';
import { OptionChip } from '@/components/ui/OptionChip';

interface SearchSectionProps {
  dayOfWeek: string;
  onDayChange: (day: string) => void;
  minimumMinutes: number;
  onMinimumMinutesChange: (value: number) => void;
  onlyAvailableNow: boolean;
  onOnlyAvailableNowChange: (value: boolean) => void;
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

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
];

export function SearchSection({
  dayOfWeek,
  onDayChange,
  minimumMinutes,
  onMinimumMinutesChange,
  onlyAvailableNow,
  onOnlyAvailableNowChange,
  onSearchNow,
  onSearchSelectedDay,
}: SearchSectionProps) {
  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 border border-white/10">
      <h2 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-4">Search criteria</h2>

      <div className="flex flex-col gap-5">
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2.5">
            Day of week
          </legend>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
            {DAYS.map((d) => (
              <OptionChip
                key={d.value}
                type="radio"
                name="room-day"
                label={d.label}
                checked={dayOfWeek === d.value}
                onChange={() => onDayChange(d.value)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2.5">
            Minimum free block
          </legend>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2">
            {DURATIONS.map((d) => (
              <OptionChip
                key={d.value}
                type="radio"
                name="room-duration"
                label={d.label}
                checked={minimumMinutes === d.value}
                onChange={() => onMinimumMinutesChange(d.value)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2.5">Filter</legend>
          <OptionChip
            type="checkbox"
            label="Only rooms free right now"
            checked={onlyAvailableNow}
            onChange={onOnlyAvailableNowChange}
          />
        </fieldset>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2.5">
            <Button onClick={onSearchSelectedDay} fullWidth>
              <i className="fas fa-magnifying-glass mr-2" aria-hidden />
              Search
            </Button>
            <Button
              variant="secondary"
              onClick={onSearchNow}
              className="shrink-0"
              title="Jump to the current day and time"
              aria-label="Search the current day and time now"
            >
              <i className="fas fa-bolt mr-2" aria-hidden />
              Now
            </Button>
          </div>
          <p className="text-xs text-[var(--dark-text)] m-0">
            <span className="text-[var(--light-text)] font-medium">Now</span> jumps to the current day
            and time.
          </p>
        </div>
      </div>
    </div>
  );
}
