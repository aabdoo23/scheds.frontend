import type { ScheduleCardItem } from '@/types/generate';
import { parseTimeToMinutes } from '@/lib/scheduleUtils';

export const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
];
export const DAY_ABBREVS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

// Canvas time window (minutes from midnight): 8:30 AM – 8:30 PM.
export const DAY_START_MIN = 8 * 60 + 30;
export const DAY_END_MIN = 20 * 60 + 30;
export const DAY_SPAN_MIN = DAY_END_MIN - DAY_START_MIN;

// Eight perceptually distinct hues — mirrors the --card-* tokens in index.css.
// Dark hues carry white text; the two golds carry ink.
export const COURSE_PALETTE = [
  { bg: 'var(--card-blue)', text: 'var(--light-text)' },
  { bg: 'var(--card-green)', text: 'var(--light-text)' },
  { bg: 'var(--card-purple)', text: 'var(--light-text)' },
  { bg: 'var(--card-yellow)', text: 'var(--font-color-dark)' },
  { bg: 'var(--card-brown)', text: 'var(--font-color-dark)' },
  { bg: 'var(--card-cyan)', text: 'var(--light-text)' },
  { bg: 'var(--card-rose)', text: 'var(--light-text)' },
  { bg: 'var(--card-brick)', text: 'var(--light-text)' },
];

// Deterministic per-course color so a course keeps its hue across every schedule.
export function courseColor(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  }
  return COURSE_PALETTE[hash % COURSE_PALETTE.length];
}

function normalizeItem(raw: Record<string, unknown>): ScheduleCardItem {
  const get = (k: string) =>
    (raw[k] ?? raw[k.charAt(0).toUpperCase() + k.slice(1)]) as string | number;
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

// The API may return capitalized keys; normalize once before rendering.
export function normalizeSchedule(items: ScheduleCardItem[]): ScheduleCardItem[] {
  return items.map((i) =>
    typeof i === 'object' && i !== null
      ? normalizeItem(i as unknown as Record<string, unknown>)
      : (i as ScheduleCardItem)
  );
}

export function dayIndexOf(day: string): number {
  return DAYS_OF_WEEK.findIndex(
    (d) => d.toLowerCase() === (day ?? '').trim().toLowerCase()
  );
}

export interface ScheduleMetrics {
  daysOnCampus: number;
  gapMinutes: number;
  earliestStart: number | null;
  latestEnd: number | null;
  scheduledCount: number;
  unscheduledCount: number;
}

export function scheduleMetrics(items: ScheduleCardItem[]): ScheduleMetrics {
  const byDay = new Map<number, ScheduleCardItem[]>();
  let unscheduled = 0;
  for (const it of items) {
    const d = dayIndexOf(it.day);
    if (d < 0) {
      unscheduled++;
      continue;
    }
    const arr = byDay.get(d);
    if (arr) arr.push(it);
    else byDay.set(d, [it]);
  }

  let gap = 0;
  let earliest: number | null = null;
  let latest: number | null = null;
  for (const dayItems of byDay.values()) {
    const sorted = [...dayItems].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
    for (let i = 0; i < sorted.length; i++) {
      const s = parseTimeToMinutes(sorted[i].startTime);
      const e = parseTimeToMinutes(sorted[i].endTime);
      if (earliest === null || s < earliest) earliest = s;
      if (latest === null || e > latest) latest = e;
      if (i > 0) {
        const prevEnd = parseTimeToMinutes(sorted[i - 1].endTime);
        if (s > prevEnd) gap += s - prevEnd;
      }
    }
  }

  return {
    daysOnCampus: byDay.size,
    gapMinutes: Math.round(gap),
    earliestStart: earliest,
    latestEnd: latest,
    scheduledCount: items.length - unscheduled,
    unscheduledCount: unscheduled,
  };
}

export type SortKey = 'fewestDays' | 'leastGaps' | 'latestStart' | 'earliestFinish';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'fewestDays', label: 'Fewest days' },
  { key: 'leastGaps', label: 'Least gaps' },
  { key: 'latestStart', label: 'Latest start' },
  { key: 'earliestFinish', label: 'Earliest finish' },
];

interface Ranked {
  i: number;
  m: ScheduleMetrics;
}

// Given per-schedule metrics, return original indices in ranked order.
export function rankOrder(metricsList: ScheduleMetrics[], key: SortKey): number[] {
  const ranked: Ranked[] = metricsList.map((m, i) => ({ i, m }));
  const comparators: Record<SortKey, (a: Ranked, b: Ranked) => number> = {
    fewestDays: (a, b) =>
      a.m.daysOnCampus - b.m.daysOnCampus || a.m.gapMinutes - b.m.gapMinutes,
    leastGaps: (a, b) =>
      a.m.gapMinutes - b.m.gapMinutes || a.m.daysOnCampus - b.m.daysOnCampus,
    latestStart: (a, b) =>
      (b.m.earliestStart ?? -1) - (a.m.earliestStart ?? -1) ||
      a.m.daysOnCampus - b.m.daysOnCampus,
    earliestFinish: (a, b) =>
      (a.m.latestEnd ?? Number.MAX_SAFE_INTEGER) -
        (b.m.latestEnd ?? Number.MAX_SAFE_INTEGER) ||
      a.m.daysOnCampus - b.m.daysOnCampus,
  };
  return ranked.sort(comparators[key]).map((r) => r.i);
}

// Group a schedule's items by day-of-week index (0=Sat … 5=Thu); unscheduled dropped.
export function groupByDay(items: ScheduleCardItem[]): Record<number, ScheduleCardItem[]> {
  const byDay: Record<number, ScheduleCardItem[]> = {};
  for (const it of items) {
    const d = dayIndexOf(it.day);
    if (d < 0) continue;
    (byDay[d] ??= []).push(it);
  }
  return byDay;
}

export function itemKey(item: ScheduleCardItem): string {
  return `${item.cardId || item.courseCode}-${item.section}-${item.day}-${item.startTime}`;
}

export function formatClock(min: number | null): string {
  if (min === null) return '—';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const h12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatHourLabel(h: number): string {
  const h12 = h % 12 || 12;
  return `${h12} ${h < 12 ? 'AM' : 'PM'}`;
}

export function formatGap(min: number): string {
  if (min <= 0) return 'No gaps';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m gaps`;
  if (h) return `${h}h gaps`;
  return `${m}m gaps`;
}

export function formatDays(n: number): string {
  return `${n} day${n === 1 ? '' : 's'} on campus`;
}

// Position of an item within the canvas time window, as 0–1 fractions.
// The canvas enforces a readable minimum height in CSS.
export function blockPosition(item: ScheduleCardItem): { top: number; height: number } {
  const start = parseTimeToMinutes(item.startTime);
  const end = parseTimeToMinutes(item.endTime);
  const top = Math.min(1, Math.max(0, (start - DAY_START_MIN) / DAY_SPAN_MIN));
  const height = Math.min(1 - top, Math.max(0, (end - start) / DAY_SPAN_MIN));
  return { top, height };
}
