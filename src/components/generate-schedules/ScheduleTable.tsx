import { useState, useMemo, Fragment } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { ScheduleCardWithDetail } from './ScheduleCardWithDetail';
import { parseTimeToHours, parseTimeToMinutes } from '@/lib/scheduleUtils';

const DAYS_OF_WEEK = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAY_ABBREVS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

const TIME_SLOTS = [
  { label: '8:30 AM - 9:29 AM', hour: 8 },
  { label: '9:30 AM - 10:29 AM', hour: 9 },
  { label: '10:30 AM - 11:29 AM', hour: 10 },
  { label: '11:30 AM - 12:29 PM', hour: 11 },
  { label: '12:30 PM - 1:29 PM', hour: 12 },
  { label: '1:30 PM - 2:29 PM', hour: 13 },
  { label: '2:30 PM - 3:29 PM', hour: 14 },
  { label: '3:30 PM - 4:29 PM', hour: 15 },
  { label: '4:30 PM - 5:29 PM', hour: 16 },
  { label: '5:30 PM - 6:29 PM', hour: 17 },
  { label: '6:30 PM - 7:29 PM', hour: 18 },
  { label: '7:30 PM - 8:29 PM', hour: 19 },
];

interface ScheduleTableProps {
  items: ScheduleCardItem[];
  scheduleIndex: number;
  activeCardKey: string | null;
  onCardActivate: (key: string, byClick: boolean) => void;
  onCardDeactivate: () => void;
}

function normalizeItem(raw: Record<string, unknown>): ScheduleCardItem {
  const get = (k: string) => (raw[k] ?? raw[k.charAt(0).toUpperCase() + k.slice(1)]) as string | number;
  return {
    cardId: String(get('cardId') ?? ''),
    courseCode: String(get('courseCode') ?? ''),
    courseName: String(get('courseName') ?? ''),
    instructorName: String(get('instructorName') ?? ''),
    section: String(get('section') ?? ''),
    credits: Number(get('credits') ?? 0),
    day: String(get('day') ?? ''),
    startTime: String(get('startTime') ?? '00:00:00'),
    endTime: String(get('endTime') ?? '00:00:00'),
    room: String(get('room') ?? ''),
    subType: String(get('subType') ?? ''),
    seatsLeft: Number(get('seatsLeft') ?? 0),
  };
}

function getCardUniqueKey(scheduleIndex: number, item: ScheduleCardItem) {
  return `${scheduleIndex}-${item.cardId || item.courseCode}-${item.section}`;
}

export function ScheduleTable({
  items,
  scheduleIndex,
  activeCardKey,
  onCardActivate,
  onCardDeactivate,
}: ScheduleTableProps) {
  const normalized = useMemo(
    () =>
      items.map((i) =>
        typeof i === 'object' && i !== null ? normalizeItem(i as unknown as Record<string, unknown>) : (i as ScheduleCardItem)
      ),
    [items]
  );

  const noScheduleItems = useMemo(
    () => normalized.filter((i) => !i.day || i.day.trim() === ''),
    [normalized]
  );

  const getCardForSlot = (dayIndex: number, slotHour: number) => {
    const day = DAYS_OF_WEEK[dayIndex];
    return normalized.find(
      (item) =>
        item.day &&
        item.day.toLowerCase() === day.toLowerCase() &&
        parseTimeToHours(item.startTime) === slotHour
    );
  };

  const getDurationRows = (item: ScheduleCardItem) => {
    const startMins = parseTimeToMinutes(item.startTime);
    const endMins = parseTimeToMinutes(item.endTime);
    const durationMins = endMins - startMins;
    return Math.max(1, Math.round((durationMins + 1) / 60));
  };

  const isOneHour = (item: ScheduleCardItem) => {
    const startMins = parseTimeToMinutes(item.startTime);
    const endMins = parseTimeToMinutes(item.endTime);
    const durationMins = endMins - startMins;
    return Math.abs(durationMins - 59) < 2 || Math.abs(durationMins - 60) < 2;
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (normalized.length === 0) {
    return (
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[600px] border-collapse rounded-xl overflow-hidden shadow-lg">
        <caption className="sr-only">Schedule for week</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[9.5em] min-w-[9.5em] p-3 bg-[var(--light-blue)] text-white font-bold border border-[var(--dark-blue)] sticky top-0 z-10 bg-[var(--light-blue)]">
              Time
            </th>
            {DAYS_OF_WEEK.map((d) => (
              <th
                key={d}
                scope="col"
                className="p-3 bg-[var(--light-blue)] text-white font-bold border border-[var(--dark-blue)] sticky top-0 z-10 bg-[var(--light-blue)]"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={7} className="p-5 text-center text-[var(--dark-text)]">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    );
  }

  const skipSlots = [0, 0, 0, 0, 0, 0];
  let noScheduleIdx = 0;

  const showOtherTab = noScheduleItems.length > 0;
  const isOtherSelected = showOtherTab && selectedDayIndex === 6;
  const dayIndex = isOtherSelected ? 0 : Math.min(selectedDayIndex, 5);

  const itemsPerDay = useMemo(
    () =>
      DAYS_OF_WEEK.map(
        (day) =>
          normalized.filter(
            (item) => item.day && item.day.toLowerCase() === day.toLowerCase()
          ).length
      ),
    [normalized]
  );

  const dayRows = useMemo(() => {
    const rows: Array<
      | { type: 'free'; start: string; end: string }
      | { type: 'card'; slot: (typeof TIME_SLOTS)[number]; card: ScheduleCardItem }
    > = [];
    let freeStart: number | null = null;
    let skipCount = 0;

    for (let i = 0; i < TIME_SLOTS.length; i++) {
      if (skipCount > 0) {
        skipCount--;
        continue;
      }
      const slot = TIME_SLOTS[i];
      const card = getCardForSlot(dayIndex, slot.hour);

      if (card) {
        if (freeStart !== null) {
          const [start] = TIME_SLOTS[freeStart].label.split(' - ');
          const [, end] = TIME_SLOTS[i - 1].label.split(' - ');
          rows.push({ type: 'free', start, end });
          freeStart = null;
        }
        rows.push({ type: 'card', slot, card });
        skipCount = getDurationRows(card) - 1;
      } else {
        if (freeStart === null) freeStart = i;
      }
    }
    if (freeStart !== null) {
      const [start] = TIME_SLOTS[freeStart].label.split(' - ');
      const [, end] = TIME_SLOTS[TIME_SLOTS.length - 1].label.split(' - ');
      rows.push({ type: 'free', start, end });
    }
    return rows;
  }, [dayIndex, normalized]);

  return (
    <>
      {/* Mobile: day-by-day view */}
      <div className="md:hidden w-full">
        <div
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="Select day"
        >
          {DAYS_OF_WEEK.map((day, i) => (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={selectedDayIndex === i}
              aria-label={day}
              onClick={() => setSelectedDayIndex(i)}
              className={`shrink-0 px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedDayIndex === i
                  ? 'bg-[var(--light-blue)] text-[var(--light-text)]'
                  : 'bg-[var(--lighter-dark)] text-[var(--dark-text)] hover:bg-[var(--lighter-dark)]/80'
              }`}
            >
              {DAY_ABBREVS[i]} ({itemsPerDay[i]})
            </button>
          ))}
          {showOtherTab && (
            <button
              type="button"
              role="tab"
              aria-selected={isOtherSelected}
              aria-label="Unscheduled courses"
              onClick={() => setSelectedDayIndex(6)}
              className={`shrink-0 px-4 py-2 rounded-lg font-semibold transition-colors ${
                isOtherSelected
                  ? 'bg-[var(--light-blue)] text-[var(--light-text)]'
                  : 'bg-[var(--lighter-dark)] text-[var(--dark-text)] hover:bg-[var(--lighter-dark)]/80'
              }`}
            >
              Other ({noScheduleItems.length})
            </button>
          )}
        </div>
        <div className="mt-4 space-y-3" role="tabpanel">
          {isOtherSelected ? (
            <div className="space-y-3">
              <h3 className="text-[var(--light-text)] text-sm font-semibold mb-2">No schedule</h3>
              {noScheduleItems.map((item, i) => (
                <ScheduleCardWithDetail
                  key={`no-schedule-${scheduleIndex}-${i}`}
                  item={item}
                  cardKey={`no-schedule-${scheduleIndex}-${i}`}
                  isActive={activeCardKey === `no-schedule-${scheduleIndex}-${i}`}
                  onActivate={onCardActivate}
                  onDeactivate={onCardDeactivate}
                  compact
                />
              ))}
            </div>
          ) : (
            dayRows.map((row) =>
              row.type === 'free' ? (
                <div
                  key={`free-${row.start}-${row.end}`}
                  className="flex flex-col gap-2 rounded-xl bg-emerald-950/25 border-l-4 border-emerald-600/50 p-3 min-h-[6rem]"
                >
                  <div className="text-[var(--dark-text)] text-sm font-semibold">
                    {row.start} - {row.end}
                  </div>
                  <div className="text-emerald-400/80 text-sm py-2 font-medium">Free</div>
                </div>
              ) : (
                <div
                  key={getCardUniqueKey(scheduleIndex, row.card)}
                  className="flex flex-col gap-2 rounded-xl bg-[var(--lighter-dark)]/50 p-3"
                >
                  <div className="text-[var(--dark-text)] text-sm font-semibold">{row.slot.label}</div>
                  <ScheduleCardWithDetail
                    item={row.card}
                    cardKey={getCardUniqueKey(scheduleIndex, row.card)}
                    isActive={activeCardKey === getCardUniqueKey(scheduleIndex, row.card)}
                    onActivate={onCardActivate}
                    onDeactivate={onCardDeactivate}
                  />
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Desktop: table view */}
      <div className="hidden md:block overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[600px] border-collapse rounded-xl overflow-hidden shadow-lg border-2 border-transparent">
          <caption className="sr-only">Schedule for week</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[9.5em] min-w-[9.5em] p-3 bg-[var(--light-blue)] text-white font-bold border border-[var(--dark-blue)] sticky top-0 z-10 bg-[var(--light-blue)]">
                Time
              </th>
              {DAYS_OF_WEEK.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="p-3 bg-[var(--light-blue)] text-white font-bold border border-[var(--dark-blue)] sticky top-0 z-10 bg-[var(--light-blue)]"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
      <tbody>
        {/* No Schedule row */}
        <tr>
          <td className="p-2 h-9 bg-[var(--lighter)] text-[var(--light-text)] font-semibold text-center border-b border-[var(--dark)]">
            No Schedule
          </td>
          {DAYS_OF_WEEK.map((_, dayIndex) => {
            const noScheduleItem =
              noScheduleIdx < noScheduleItems.length ? noScheduleItems[noScheduleIdx++] : null;
            const key = noScheduleItem ? `no-schedule-${scheduleIndex}-${dayIndex}` : null;
            return (
              <td key={dayIndex} className="p-2 h-9 border-none overflow-visible align-top">
                {noScheduleItem && key && (
                  <ScheduleCardWithDetail
                    item={noScheduleItem}
                    cardKey={key}
                    isActive={activeCardKey === key}
                    onActivate={onCardActivate}
                    onDeactivate={onCardDeactivate}
                    compact
                  />
                )}
              </td>
            );
          })}
        </tr>

        {/* Time slot rows */}
        {TIME_SLOTS.map((slot) => (
          <tr key={slot.label}>
            <td className="p-2 h-9 bg-[var(--lighter)] text-[var(--light-text)] font-semibold text-center border-b border-[var(--dark)]">
              {slot.label}
            </td>
            {DAYS_OF_WEEK.map((_, dayIndex) => {
              if (skipSlots[dayIndex] > 0) {
                skipSlots[dayIndex]--;
                return <Fragment key={dayIndex} />;
              }
              const card = getCardForSlot(dayIndex, slot.hour);
              if (card) {
                const rowspan = getDurationRows(card);
                skipSlots[dayIndex] = rowspan - 1;
                return (
                  <td
                    key={dayIndex}
                    rowSpan={rowspan}
                    className="p-2 h-9 border-none align-top overflow-visible"
                  >
                    <ScheduleCardWithDetail
                      item={card}
                      cardKey={getCardUniqueKey(scheduleIndex, card)}
                      isActive={activeCardKey === getCardUniqueKey(scheduleIndex, card)}
                      onActivate={onCardActivate}
                      onDeactivate={onCardDeactivate}
                      compact={isOneHour(card)}
                    />
                  </td>
                );
              }
              return <td key={dayIndex} className="p-2 h-9 border-none align-top" />;
            })}
          </tr>
        ))}
      </tbody>
    </table>
      </div>
    </>
  );
}
