import { useState, type ReactNode } from 'react';
import type { GenerateRequest, BusyTime } from '@/types/generate';
import { Tooltip } from '@/components/ui/Tooltip';
import { OptionChip } from '@/components/ui/OptionChip';

const DAYS_OF_WEEK = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAY_ABBR = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

// Half-hour slots spanning the teaching day; busy blocks snap to these.
const BUSY_TIME_OPTIONS = Array.from({ length: 27 }, (_, i) => {
  const minutes = 8 * 60 + i * 30; // 08:00 → 21:00
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

const DAYS_START_OPTIONS = [
  { value: '08:30', label: '8:30 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '16:30', label: '4:30 PM' },
];

const DAYS_END_OPTIONS = [
  { value: '12:30', label: '12:30 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '20:30', label: '8:30 PM' },
];

const MAX_DAYS_OPTIONS = [1, 2, 3, 4, 5, 6];

interface CustomizationFormProps {
  request: GenerateRequest;
  onUpdate: (updates: Partial<GenerateRequest>) => void;
}

// Preferences panel , the right/wider (3fr) column of the set-up deck. Groups are
// split into two hand-balanced column stacks (When you're on campus · Generator
// tuning) so the panel reflows to two columns with no ragged, row-locked dead space.
export function CustomizationForm({ request, onUpdate }: CustomizationFormProps) {
  const isMaxDays = request.isNumberOfDaysSelected;
  const allDaysSelected = !isMaxDays && request.selectedDays.every(Boolean);
  const badRange = request.daysStart >= request.daysEnd;

  const setSelectedDays = (days: boolean[]) => onUpdate({ selectedDays: days });

  const toggleDay = (index: number) => {
    const next = [...request.selectedDays];
    next[index] = !next[index];
    setSelectedDays(next);
  };

  const setAllDays = (checked: boolean) => {
    setSelectedDays(
      checked ? [true, true, true, true, true, true] : [false, false, false, false, false, false]
    );
  };

  return (
    <div
      id="preferences-panel"
      className="@container rounded-xl bg-[var(--lighter-dark)] border border-white/10 p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 @2xl:grid-cols-2 @2xl:items-start">
        {/* Column A , when you're on campus */}
        <div className="flex flex-col gap-8 min-w-0">
        {/* Days */}
        <Group icon="fa-calendar-week" title="Days on campus">
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">How to choose your days</legend>
            <div className="grid grid-cols-2 gap-2">
              <OptionChip
                type="radio"
                name="day-method"
                label="Limit total days"
                checked={isMaxDays}
                onChange={() => onUpdate({ isNumberOfDaysSelected: true })}
              />
              <OptionChip
                type="radio"
                name="day-method"
                label="Pick specific days"
                checked={!isMaxDays}
                onChange={() => onUpdate({ isNumberOfDaysSelected: false })}
              />
            </div>
          </fieldset>
          {isMaxDays ? (
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2">
                Maximum days on campus
              </legend>
              <div className="grid grid-cols-6 gap-2">
                {MAX_DAYS_OPTIONS.map((n) => (
                  <OptionChip
                    key={n}
                    type="radio"
                    name="maxDays"
                    label={String(n)}
                    checked={request.numberOfDays === n}
                    onChange={() => onUpdate({ numberOfDays: n })}
                  />
                ))}
              </div>
              <p className="text-[var(--dark-text)] text-xs mt-2">
                5 keeps it to Saturday–Wednesday (recommended)
              </p>
            </fieldset>
          ) : (
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2">
                Days to attend
              </legend>
              <OptionChip
                type="checkbox"
                label="All week"
                checked={allDaysSelected}
                onChange={(v) => setAllDays(v)}
              />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2 mt-2">
                {DAYS_OF_WEEK.map((day, i) => (
                  <OptionChip
                    key={day}
                    type="checkbox"
                    label={day}
                    checked={request.selectedDays[i]}
                    onChange={() => toggleDay(i)}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </Group>

        {/* Class hours */}
        <Group icon="fa-clock" title="Class hours">
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2">
              Earliest start
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {DAYS_START_OPTIONS.map((opt) => (
                <OptionChip
                  key={opt.value}
                  type="radio"
                  name="daysStart"
                  label={opt.label}
                  checked={request.daysStart === opt.value}
                  onChange={() => onUpdate({ daysStart: opt.value })}
                />
              ))}
            </div>
            <p className="text-[var(--dark-text)] text-xs mt-2">10:30 AM skips early morning classes</p>
          </fieldset>
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-[var(--light-text)] text-sm font-medium p-0 mb-2">
              Latest end
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {DAYS_END_OPTIONS.map((opt) => (
                <OptionChip
                  key={opt.value}
                  type="radio"
                  name="daysEnd"
                  label={opt.label}
                  checked={request.daysEnd === opt.value}
                  onChange={() => onUpdate({ daysEnd: opt.value })}
                />
              ))}
            </div>
            <p className="text-[var(--dark-text)] text-xs mt-2">6:30 PM leaves your evenings free</p>
          </fieldset>
          {badRange && (
            <p role="alert" className="text-[var(--btn-danger)] text-sm flex items-center gap-2">
              <i className="fas fa-triangle-exclamation" aria-hidden />
              Set an earliest start before the latest end, or no schedules will fit.
            </p>
          )}
        </Group>

        {/* Busy times */}
        <Group icon="fa-calendar-xmark" title="Busy times">
          <p className="text-[var(--dark-text)] text-xs -mt-2">
            Block times you're unavailable (a job, commute, prayer, training). No class will be
            scheduled over them.
          </p>
          <BusyTimesControl
            busyTimes={request.busyTimes}
            onChange={(busyTimes) => onUpdate({ busyTimes })}
          />
        </Group>
        </div>

        {/* Column B , generator tuning */}
        <div className="flex flex-col gap-8 min-w-0">
        {/* Schedule limits */}
        <Group icon="fa-sliders" title="Schedule limits">
          <SliderControl
            label="Maximum gap between classes (hours)"
            value={request.largestAllowedGap}
            min={0}
            max={8}
            onChange={(v) => onUpdate({ largestAllowedGap: v })}
            hint="0 = no limit (recommended)"
          />
          <SliderControl
            label="Maximum schedules to generate"
            value={request.maxNumberOfGeneratedSchedules}
            min={5}
            max={50}
            onChange={(v) => onUpdate({ maxNumberOfGeneratedSchedules: v })}
            hint="15 gives good variety without overwhelming"
          />
        </Group>

        {/* Options */}
        <Group icon="fa-gear" title="Options">
          <OptionChip
            type="checkbox"
            label="Avoid days with only one class"
            desc="Don't come to campus for a single class , every day gets at least two"
            checked={request.minimumNumberOfItemsPerDay >= 2}
            onChange={(v) => onUpdate({ minimumNumberOfItemsPerDay: v ? 2 : 0 })}
          />
          <div className="flex items-start gap-2">
            <OptionChip
              type="checkbox"
              className="flex-1"
              label="Engineering student"
              desc="Pair lab and tutorial sections together"
              checked={request.isEngineering}
              onChange={(v) => onUpdate({ isEngineering: v })}
            />
            <Tooltip
              content="Considers different sections of labs and tutorials together. For example: when a course needs a lab and a tutorial paired, lecture 1 is matched with lab 1A and tutorial 1B together, etc."
              label="More information"
            >
              <i className="fas fa-info-circle text-[var(--dark-text)] mt-3" aria-hidden />
            </Tooltip>
          </div>
          <div className="flex items-start gap-2">
            <OptionChip
              type="checkbox"
              className="flex-1"
              label="Only sections with open seats"
              desc="Skip sections with zero available seats"
              checked={request.requireOpenSeats}
              onChange={(v) => onUpdate({ requireOpenSeats: v })}
            />
            <Tooltip
              content="Only considers course sections that still have available seats. Leave unchecked to consider all sections regardless of seats left."
              label="More information"
            >
              <i className="fas fa-info-circle text-[var(--dark-text)] mt-3" aria-hidden />
            </Tooltip>
          </div>
        </Group>
        </div>
      </div>
    </div>
  );
}

// Add + list of "busy" blocks. Blocks act like fixed classes the generator must
// avoid , the natural companion to the earliest-start / latest-end window above.
function BusyTimesControl({
  busyTimes,
  onChange,
}: {
  busyTimes: BusyTime[];
  onChange: (next: BusyTime[]) => void;
}) {
  const [day, setDay] = useState(0);
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('16:00');

  const invalid = start >= end;
  const duplicate = busyTimes.some(
    (b) => b.day === day && b.startTime === start && b.endTime === end
  );

  const addBlock = () => {
    if (invalid || duplicate) return;
    onChange([...busyTimes, { day, startTime: start, endTime: end }]);
  };

  const removeBlock = (target: number) => {
    onChange(busyTimes.filter((_, i) => i !== target));
  };

  // Show blocks in week order (day, then start) while removing by real index.
  const ordered = busyTimes
    .map((b, i) => ({ b, i }))
    .sort((x, y) => x.b.day - y.b.day || x.b.startTime.localeCompare(y.b.startTime));

  return (
    <div className="flex flex-col gap-3">
      {ordered.length > 0 && (
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {ordered.map(({ b, i }) => (
            <li
              key={`${b.day}-${b.startTime}-${b.endTime}-${i}`}
              className="flex items-center gap-3 py-2 px-3 rounded-md border border-white/10 bg-white/[0.02]"
            >
              <span className="shrink-0 w-10 text-center text-xs font-semibold text-[var(--light-blue)] tabular-nums">
                {DAY_ABBR[b.day]}
              </span>
              <span className="flex-1 min-w-0 text-sm text-[var(--light-text)] tabular-nums">
                {formatTime(b.startTime)} – {formatTime(b.endTime)}
              </span>
              <button
                type="button"
                onClick={() => removeBlock(i)}
                aria-label={`Remove busy block on ${DAYS_OF_WEEK[b.day]} from ${formatTime(
                  b.startTime
                )} to ${formatTime(b.endTime)}`}
                className="shrink-0 grid place-items-center w-11 h-11 -my-1.5 -mr-1.5 rounded-md text-[var(--dark-text)] transition-colors hover:text-[var(--btn-danger)] hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
              >
                <i className="fas fa-xmark" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-3 gap-2 items-end">
        <BusySelect
          label="Day"
          value={String(day)}
          onChange={(v) => setDay(Number(v))}
          options={DAYS_OF_WEEK.map((d, i) => ({ value: String(i), label: d }))}
        />
        <BusySelect
          label="From"
          value={start}
          onChange={setStart}
          options={BUSY_TIME_OPTIONS.map((t) => ({ value: t, label: formatTime(t) }))}
        />
        <BusySelect
          label="To"
          value={end}
          onChange={setEnd}
          options={BUSY_TIME_OPTIONS.map((t) => ({ value: t, label: formatTime(t) }))}
        />
      </div>

      <button
        type="button"
        onClick={addBlock}
        disabled={invalid || duplicate}
        className="min-h-[44px] px-4 rounded-md border border-dashed border-white/20 text-sm font-medium text-[var(--light-text)] transition-colors hover:border-[var(--light-blue)] hover:bg-[var(--light-blue)]/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/20 disabled:hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lighter-dark)]"
      >
        <i className="fas fa-plus mr-2" aria-hidden />
        Add busy time
      </button>
      {invalid ? (
        <p className="text-[var(--btn-danger)] text-xs m-0">
          The start time must be before the end time.
        </p>
      ) : duplicate ? (
        <p className="text-[var(--dark-text)] text-xs m-0">You already added that block.</p>
      ) : null}
    </div>
  );
}

function BusySelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[var(--dark-text)] text-xs font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full px-2.5 rounded-md border border-white/10 bg-[var(--dark)] text-[var(--light-text)] text-sm cursor-pointer transition-colors hover:border-[var(--light-blue)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Group({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 min-w-0">
      <h3 className="flex items-center gap-2.5 text-[var(--light-text)] text-lg font-semibold m-0">
        <i className={`fas ${icon} text-[var(--dark-text)] text-sm w-4 text-center`} aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  const id = `slider-${label.replace(/\s/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label id={`${id}-label`} htmlFor={id} className="text-[var(--light-text)] font-medium text-sm">
          {label}
        </label>
        <span className="min-w-[2rem] py-0.5 px-2.5 rounded-md bg-white/10 border border-white/10 text-[var(--light-text)] font-semibold text-sm text-center tabular-nums">
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={String(value)}
        aria-labelledby={`${id}-label`}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 rounded bg-[var(--dark)] outline-none appearance-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lighter-dark)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--light-blue)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[0.68rem] text-[var(--dark-text)] tabular-nums">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <p className="text-[var(--dark-text)] text-xs">{hint}</p>
    </div>
  );
}
