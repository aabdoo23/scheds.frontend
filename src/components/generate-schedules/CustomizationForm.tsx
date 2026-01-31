import { useState } from 'react';
import type { GenerateRequest } from '@/types/generate';
import { Tooltip } from '@/components/ui/Tooltip';

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

export function CustomizationForm({ request, onUpdate }: CustomizationFormProps) {
  const [expanded, setExpanded] = useState(true);
  const isMaxDays = request.isNumberOfDaysSelected;
  const allDaysSelected =
    !isMaxDays && request.selectedDays.every(Boolean);

  const setSelectedDays = (days: boolean[]) => {
    onUpdate({ selectedDays: days });
  };

  const toggleDay = (index: number) => {
    const next = [...request.selectedDays];
    next[index] = !next[index];
    setSelectedDays(next);
  };

  const setAllDays = (checked: boolean) => {
    setSelectedDays(checked ? [true, true, true, true, true, true] : [false, false, false, false, false, false]);
  };

  return (
    <section className="my-8">
      <div className="text-center mb-8">
        <h2 className="text-[var(--light-text)] text-[1.7rem] font-semibold m-0 mb-2.5">
          Customize Your Schedule
        </h2>
        <p className="text-[var(--dark-text)] text-[1.1rem] m-0 opacity-90">
          Fine-tune your preferences to generate the perfect schedule
        </p>
      </div>

      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls="customization-options"
          className="w-full py-3 px-4 rounded-lg bg-[var(--lighter-dark)] border border-white/10 text-[var(--light-text)] font-medium flex items-center justify-between gap-2"
        >
          <span>{expanded ? 'Hide' : 'Show'} advanced options</span>
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} aria-hidden />
        </button>
      </div>

      <div
        id="customization-options"
        className={`grid grid-cols-1 gap-6 mb-8 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] ${expanded ? '' : 'hidden lg:grid'}`}
      >
        {/* Schedule Parameters */}
        <div className="bg-[var(--lighter-dark)] rounded-2xl p-6 border border-white/10 shadow-lg hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-white/10">
            <i className="fas fa-sliders-h text-[var(--light-blue)] text-[1.3rem]" />
            <h3 className="text-[var(--light-text)] m-0 text-[1.2rem] font-semibold">
              Schedule Parameters
            </h3>
          </div>
          <div className="flex flex-col gap-5">
            <SliderControl
              label="Minimum Slots per Day"
              value={request.minimumNumberOfItemsPerDay}
              min={0}
              max={5}
              onChange={(v) => onUpdate({ minimumNumberOfItemsPerDay: v })}
              hint="0 = No minimum (recommended for flexibility)"
            />
            <SliderControl
              label="Maximum Gap Period (hours)"
              value={request.largestAllowedGap}
              min={0}
              max={8}
              onChange={(v) => onUpdate({ largestAllowedGap: v })}
              hint="0 = No minimum (recommended for flexibility)"
            />
            <SliderControl
              label="Maximum Number of Schedules"
              value={request.maxNumberOfGeneratedSchedules}
              min={5}
              max={50}
              onChange={(v) => onUpdate({ maxNumberOfGeneratedSchedules: v })}
              hint="15 schedules provide good variety without overwhelming"
            />
          </div>
        </div>

        {/* Student Options */}
        <div className="bg-[var(--lighter-dark)] rounded-2xl p-6 border border-white/10 shadow-lg hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-white/10">
            <i className="fas fa-user-graduate text-[var(--light-blue)] text-[1.3rem]" />
            <h3 className="text-[var(--light-text)] m-0 text-[1.2rem] font-semibold">
              Student Options
            </h3>
          </div>
          <div className="flex flex-col gap-5">
            <CheckboxControl
              label="Engineering Student"
              desc="Consider lab and tutorial sections together"
              checked={request.isEngineering}
              onChange={(v) => onUpdate({ isEngineering: v })}
              tooltip="This considers different sections of labs and tutorials together. For example: if a course needs a lab and a tutorial to be considered together, then when considering lecture 1, it will consider lab 1A and tutorial 1B together, etc."
            />
            <CheckboxControl
              label="Only Available Seats"
              desc="Exclude sections with zero available seats"
              checked={request.considerZeroSeats}
              onChange={(v) => onUpdate({ considerZeroSeats: v })}
              tooltip="This will only consider course items where there are available seats. If you don't check this, it will consider all courses regardless of the number of seats left."
            />
          </div>
        </div>

        {/* Days Configuration */}
        <div className="bg-[var(--lighter-dark)] rounded-2xl p-6 border border-white/10 shadow-lg hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-white/10">
            <i className="fas fa-calendar-week text-[var(--light-blue)] text-[1.3rem]" />
            <h3 className="text-[var(--light-text)] m-0 text-[1.2rem] font-semibold">
              Days Configuration
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-[var(--light-text)] m-0 mb-4 text-base font-medium">
                Day Selection Method
              </h4>
              <div className="flex gap-5">
                <RadioControl
                  label="Maximum Days"
                  checked={isMaxDays}
                  onChange={() => onUpdate({ isNumberOfDaysSelected: true })}
                />
                <RadioControl
                  label="Specific Days"
                  checked={!isMaxDays}
                  onChange={() => onUpdate({ isNumberOfDaysSelected: false })}
                />
              </div>
            </div>
            {isMaxDays ? (
              <div className="mt-4 p-4 rounded-lg bg-white/5">
                <SliderControl
                  label="Maximum Days on Campus"
                  value={request.numberOfDays}
                  min={1}
                  max={6}
                  onChange={(v) => onUpdate({ numberOfDays: v })}
                  hint="5 days allows weekday-only schedules (recommended)"
                />
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-lg bg-white/5">
                <h4 className="text-[var(--light-text)] m-0 mb-2.5 text-base font-medium">
                  Select Days on Campus
                </h4>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2.5 mt-2.5">
                  <DayCheckbox
                    label="All Week"
                    checked={allDaysSelected}
                    onChange={(v) => setAllDays(v)}
                  />
                  {DAYS_OF_WEEK.map((day, i) => (
                    <DayCheckbox
                      key={day}
                      label={day}
                      checked={request.selectedDays[i]}
                      disabled={allDaysSelected}
                      onChange={() => toggleDay(i)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Preferences */}
        <div className="bg-[var(--lighter-dark)] rounded-2xl p-6 border border-white/10 shadow-lg hover:-translate-y-1 transition-transform">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-white/10">
            <i className="fas fa-clock text-[var(--light-blue)] text-[1.3rem]" />
            <h3 className="text-[var(--light-text)] m-0 text-[1.2rem] font-semibold">
              Time Preferences
            </h3>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="text-[var(--light-text)] m-0 mb-3 text-base font-medium">
                First Slot Start Time
              </h4>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2">
                {DAYS_START_OPTIONS.map((opt) => (
                  <TimeRadio
                    key={opt.value}
                    name="daysStart"
                    label={opt.label}
                    value={opt.value}
                    checked={request.daysStart === opt.value}
                    onChange={() => onUpdate({ daysStart: opt.value })}
                  />
                ))}
              </div>
              <p className="text-[var(--dark-text)] text-[0.75rem] opacity-70 mt-1.5 italic">
                10:30 AM avoids early morning classes
              </p>
            </div>
            <div>
              <h4 className="text-[var(--light-text)] m-0 mb-3 text-base font-medium">
                Last Slot End Time
              </h4>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2">
                {DAYS_END_OPTIONS.map((opt) => (
                  <TimeRadio
                    key={opt.value}
                    name="daysEnd"
                    label={opt.label}
                    value={opt.value}
                    checked={request.daysEnd === opt.value}
                    onChange={() => onUpdate({ daysEnd: opt.value })}
                  />
                ))}
              </div>
              <p className="text-[var(--dark-text)] text-[0.75rem] opacity-70 mt-1.5 italic">
                6:30 PM allows reasonable work/life balance
              </p>
            </div>
          </div>
        </div>
      </div>
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
      <label id={`${id}-label`} htmlFor={id} className="text-[var(--light-text)] font-medium text-[0.95rem]">
        {label}
      </label>
      <div className="flex items-center gap-4">
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
          className="flex-1 h-1.5 rounded bg-[var(--dark)] outline-none appearance-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-offset-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--light-blue)] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="min-w-[30px] py-1 px-2.5 rounded-2xl bg-[var(--light-blue)] text-white font-semibold text-[0.9rem] text-center">
          {value}
        </span>
      </div>
      <p className="text-[var(--dark-text)] text-[0.75rem] opacity-70 mt-1 italic">{hint}</p>
    </div>
  );
}

function CheckboxControl({
  label,
  desc,
  checked,
  onChange,
  tooltip,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tooltip: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <label className="flex items-start gap-3 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only [&+span]:block [&+span]:w-5 [&+span]:h-5 [&+span]:rounded [&+span]:border-2 [&+span]:border-[var(--dark-text)] [&+span]:bg-[var(--dark)] [&:checked+span]:bg-[var(--light-blue)] [&:checked+span]:border-[var(--light-blue)] [&:checked+span]:after:content-['✓'] [&:checked+span]:after:absolute [&:checked+span]:after:top-1/2 [&:checked+span]:after:left-1/2 [&:checked+span]:after:-translate-x-1/2 [&:checked+span]:after:-translate-y-1/2 [&:checked+span]:after:text-white [&:checked+span]:after:text-sm [&:checked+span]:after:font-bold focus-visible:[&+span]:ring-2 focus-visible:[&+span]:ring-[var(--light-blue)] focus-visible:[&+span]:ring-offset-2"
        />
        <span className="relative shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-[var(--light-text)] font-medium text-[0.95rem]">{label}</span>
          <span className="text-[var(--dark-text)] text-[0.85rem] opacity-80">{desc}</span>
        </div>
      </label>
      <Tooltip content={tooltip} label="More information">
        <i className="fas fa-info-circle text-[var(--dark-text)]" aria-hidden />
      </Tooltip>
    </div>
  );
}

function RadioControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-[var(--light-text)] text-[0.95rem]">
        <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only [&+span]:block [&+span]:w-[18px] [&+span]:h-[18px] [&+span]:rounded-full [&+span]:border-2 [&+span]:border-[var(--dark-text)] [&:checked+span]:border-[var(--light-blue)] [&:checked+span]:after:content-[''] [&:checked+span]:after:absolute [&:checked+span]:after:top-1/2 [&:checked+span]:after:left-1/2 [&:checked+span]:after:-translate-x-1/2 [&:checked+span]:after:-translate-y-1/2 [&:checked+span]:after:w-2 [&:checked+span]:after:h-2 [&:checked+span]:after:rounded-full [&:checked+span]:after:bg-[var(--light-blue)] focus-visible:[&+span]:ring-2 focus-visible:[&+span]:ring-[var(--light-blue)] focus-visible:[&+span]:ring-offset-2"
      />
      <span className="relative shrink-0" />
      {label}
    </label>
  );
}

function DayCheckbox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer text-[var(--light-text)] text-[0.9rem] p-2 rounded-md transition-colors hover:bg-white/5 ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only [&+span]:block [&+span]:w-4 [&+span]:h-4 [&+span]:rounded-sm [&+span]:border-2 [&+span]:border-[var(--dark-text)] [&:checked+span]:bg-[var(--light-blue)] [&:checked+span]:border-[var(--light-blue)] [&:checked+span]:after:content-['✓'] [&:checked+span]:after:absolute [&:checked+span]:after:top-1/2 [&:checked+span]:after:left-1/2 [&:checked+span]:after:-translate-x-1/2 [&:checked+span]:after:-translate-y-1/2 [&:checked+span]:after:text-white [&:checked+span]:after:text-[11px] [&:checked+span]:after:font-bold focus-visible:[&+span]:ring-2 focus-visible:[&+span]:ring-[var(--light-blue)] focus-visible:[&+span]:ring-offset-2"
      />
      <span className="relative shrink-0" />
      {label}
    </label>
  );
}

function TimeRadio({
  name,
  label,
  value,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-[var(--light-text)] text-[0.9rem] py-2 px-3 rounded-md border border-[var(--dark-text)] bg-white/[0.02] transition-colors hover:bg-white/5 hover:border-[var(--light-blue)]">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only [&+span]:block [&+span]:w-3.5 [&+span]:h-3.5 [&+span]:rounded-full [&+span]:border-2 [&+span]:border-[var(--dark-text)] [&:checked+span]:border-[var(--light-blue)] [&:checked+span]:bg-[var(--light-blue)] [&:checked+span]:after:content-[''] [&:checked+span]:after:absolute [&:checked+span]:after:top-1/2 [&:checked+span]:after:left-1/2 [&:checked+span]:after:-translate-x-1/2 [&:checked+span]:after:-translate-y-1/2 [&:checked+span]:after:w-1 [&:checked+span]:after:h-1 [&:checked+span]:after:rounded-full [&:checked+span]:after:bg-white focus-visible:[&+span]:ring-2 focus-visible:[&+span]:ring-[var(--light-blue)] focus-visible:[&+span]:ring-offset-2"
      />
      <span className="relative shrink-0" />
      {label}
    </label>
  );
}
