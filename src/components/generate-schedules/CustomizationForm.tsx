import type { ReactNode } from 'react';
import type { GenerateRequest } from '@/types/generate';
import { Tooltip } from '@/components/ui/Tooltip';
import { OptionChip } from '@/components/ui/OptionChip';

const DAYS_OF_WEEK = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

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

interface CustomizationFormProps {
  request: GenerateRequest;
  onUpdate: (updates: Partial<GenerateRequest>) => void;
}

// Grouped, vertical preferences tuned for the left rail: each group leads with an
// icon mini-header, and the whole set reflows to two columns when it has the room.
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
      <div className="grid grid-cols-1 gap-x-8 gap-y-7 @2xl:grid-cols-2">
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
            <SliderControl
              label="Maximum days on campus"
              value={request.numberOfDays}
              min={1}
              max={6}
              onChange={(v) => onUpdate({ numberOfDays: v })}
              hint="5 keeps it to Saturday–Wednesday (recommended)"
            />
          ) : (
            <fieldset className="border-0 p-0 m-0">
              <legend className="sr-only">Days to attend</legend>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2">
                <OptionChip
                  type="checkbox"
                  label="All week"
                  checked={allDaysSelected}
                  onChange={(v) => setAllDays(v)}
                />
                {DAYS_OF_WEEK.map((day, i) => (
                  <OptionChip
                    key={day}
                    type="checkbox"
                    label={day}
                    checked={request.selectedDays[i]}
                    disabled={allDaysSelected}
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(92px,1fr))] gap-2">
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(92px,1fr))] gap-2">
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

        {/* Schedule limits */}
        <Group icon="fa-sliders" title="Schedule limits">
          <SliderControl
            label="Minimum slots per day"
            value={request.minimumNumberOfItemsPerDay}
            min={0}
            max={5}
            onChange={(v) => onUpdate({ minimumNumberOfItemsPerDay: v })}
            hint="0 = no minimum (recommended)"
          />
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
              checked={request.considerZeroSeats}
              onChange={(v) => onUpdate({ considerZeroSeats: v })}
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
  );
}

function Group({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 min-w-0">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid place-items-center w-7 h-7 rounded-lg bg-[var(--light-blue)]/15 text-[var(--light-blue)] text-xs shrink-0"
        >
          <i className={`fas ${icon}`} />
        </span>
        <h3 className="text-[var(--light-text)] text-base font-semibold m-0">{title}</h3>
      </div>
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
